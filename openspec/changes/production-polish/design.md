## Context

SQLose is a desktop SQL IDE (Electron + React) at v0.2.0 that provisions ephemeral database environments (SQLite, Postgres, MySQL via Docker). The architecture is clean — three-layer design with typed IPC, `neverthrow` Result types, and a well-structured monorepo. However, a codebase audit revealed critical bugs, missing safety guards, inconsistent patterns, and absent CI/CD that block production readiness.

Current state:
- **3 critical bugs** in container lifecycle and import parsers
- **No query safety** — queries can hang indefinitely or exhaust memory
- **No runtime validation** at IPC boundaries
- **78.4% branch coverage** (below 85% threshold)
- **No CI pipeline** — only a release workflow that skips tests
- **Inconsistent code patterns** across handlers and stores

## Goals / Non-Goals

**Goals:**
- Fix all critical bugs (container naming, CSV/SQL parsers)
- Add query execution timeouts and result size limits to all drivers
- Add runtime type guards for IPC payloads using a lightweight validation library
- Bring branch coverage above 85% threshold
- Add CI workflow that runs lint, typecheck, and tests on every PR
- Eliminate code duplication and inconsistencies
- Polish the landing page (fix versions, wire links, remove dead code)

**Non-Goals:**
- Rewrite the architecture or switch frameworks
- Add new features (auth, collaboration, new database engines)
- Performance optimization beyond the safety guards
- Full E2E test suite (out of scope for this change)
- Redesign the UI or component library

## Decisions

### 1. Container naming for orphan cleanup

**Decision:** Prefix all container names with `sqlose-` when creating them (e.g., `sqlose-env-1720000000-1`).

**Why:** The orphan cleanup filter at `docker/index.ts:478,521` already checks `name.includes("sqlose")`, but containers are created without a `Name` property, so Docker assigns random names. Adding the prefix makes the existing filter work correctly.

**Alternatives considered:**
- Use label-based filtering (`Labels: { "sqlose": "true" }`) — cleaner but requires changing the filter logic in 3 places
- Use a custom label with the environment ID — more precise but overkill for orphan detection

### 2. Query timeout implementation

**Decision:** Add a `statement_timeout` option to the query execution path. For Postgres, use `SET statement_timeout` before query execution. For MySQL, use `mysql2`'s `timeout` option on the connection. For SQLite, wrap execution in a `Promise.race` with a timer.

**Why:** Each driver has different timeout mechanisms. Postgres supports `statement_timeout` natively. MySQL's `mysql2` driver supports per-query timeouts. SQLite has no native timeout, so we wrap the promise.

**Alternatives considered:**
- AbortController-based timeout at the IPC layer — would cancel the IPC call but leave the database query running
- Docker-level timeout — too coarse, doesn't distinguish between connection and query timeout

### 3. Result size limit

**Decision:** Cap query results at 10,000 rows. Return a `truncated: true` flag and the total row count when exceeded.

**Why:** 10K rows is enough for most development queries. Virtualized rendering in the UI already handles large lists, but memory pressure from loading millions of rows into JS objects is the real risk. The flag lets the UI display "Showing 10,000 of 1,234,567 rows".

**Alternatives considered:**
- Configurable limit in settings — adds complexity, 10K is a reasonable default
- Streaming/pagination — requires significant driver and UI changes, out of scope

### 4. Runtime validation library

**Decision:** Add `zod` to `@sqlose/shared` for runtime schema validation.

**Why:** Zod is the most widely used TypeScript-first validation library. It integrates well with existing type patterns, provides detailed error messages, and has a small runtime footprint. The `neverthrow` integration is straightforward — `schema.safeParse()` returns a success/failure object that maps directly to `ok()`/`err()`.

**Alternatives considered:**
- `valibot` — smaller bundle but less ecosystem support and fewer TypeScript infer utilities
- Hand-rolled guards — already tried, inconsistent and no error detail
- `superstruct` — less popular, fewer integrations

### 5. CSV parser fix

**Decision:** Rewrite `parseCSV` to use a stateful character-by-character parser that handles quoted fields with embedded newlines, rather than splitting on `\n` first.

**Why:** The current approach splits the entire content on newlines before parsing quotes, which breaks when a quoted field contains a newline. A character-by-character approach correctly tracks quote state across newlines.

**Alternatives considered:**
- Use a library (e.g., `papaparse`) — adds a dependency for something we can handle correctly in ~60 lines
- Pre-process to replace `\r\n` with `\n` and hope for the best — doesn't fix embedded newlines

### 6. CI pipeline design

**Decision:** Single `ci.yml` workflow triggered on PRs and pushes to `main`, running lint, typecheck, and tests. Update `release.yml` to also run tests before publishing.

**Why:** One workflow is simpler to maintain. Running tests before release prevents publishing broken builds. The existing release workflow already has the build step; adding test/lint/typecheck is minimal.

**Alternatives considered:**
- Separate workflows per package — too granular for this monorepo size
- Use Turborepo remote cache in CI — requires setup overhead, can be added later

### 7. `db-handlers` typing unification

**Decision:** Refactor `db-handlers.ts` to use the same `IPCRequest<C>`/`IPCResponse<C>` typed pattern as `ipc-handlers.ts`, adding the DB channels to the shared IPC type maps.

**Why:** The DB handlers currently use raw `string` arguments and a flat error format (`{ success, error: string }`), while the main handlers use structured errors (`{ success, error: { code, message } }`). This inconsistency makes the codebase harder to reason about and prevents the renderer from handling DB errors with the same error display logic.

### 8. Landing page version alignment

**Decision:** Use the version from `package.json` (root) as the single source of truth. The hero badge should display `v0.2.0`. Remove the conflicting footer version string.

**Why:** Three different version strings (0.1.2, 0.2.0, 1.0.0) across the landing page is confusing. The root `package.json` is the canonical version.

## Risks / Trade-offs

- **[Query timeout complexity]** Postgres `SET statement_timeout` is session-level and persists across queries in the same connection. We must reset it after each query or use a dedicated connection for timed queries. → Mitigation: Reset timeout to 0 after each query execution.

- **[Zod dependency size]** Adding zod increases the shared package's bundle. For an Electron app this is negligible, but it's a new dependency to maintain. → Mitigation: Zod is widely maintained and tree-shakeable.

- **[Result size limit may surprise users]** Users running legitimate large queries may be confused by truncated results. → Mitigation: Clear UI indicator ("Showing 10,000 of N rows") with an option to increase the limit or export full results.

- **[CSV parser rewrite risk]** Rewriting the parser could introduce regressions for existing CSV imports. → Mitigation: Existing tests cover the current behavior. Add new test cases for embedded newlines before and after the rewrite.

- **[Container naming may conflict]** If a user has manually created containers with the `sqlose-` prefix, orphan cleanup could affect them. → Mitigation: Low risk since users don't manually create Docker containers for this app.

## Migration Plan

No migration needed — all changes are backward-compatible:
- Container naming only affects new containers
- Query timeouts are new defaults (configurable)
- Result size limits are new defaults (configurable)
- CI pipeline is additive
- Code refactors don't change external behavior

## Open Questions

- Should the result row limit be configurable in the Settings panel, or is 10K hardcoded sufficient for v0.2?
- Should we add a "Cancel Query" button to the UI that uses AbortController, or is timeout-only sufficient?
