## Why

SQLose is at v0.2.0 with solid architecture but has critical bugs, missing safety guards, inconsistent code patterns, and incomplete CI/CD that prevent it from being production-ready. The orphan container cleanup never matches (containers are never named with "sqlose"), CSV/SQL import parsers have correctness bugs, there are no query timeouts or result size limits, branch coverage is below threshold, and the only CI workflow is for releases with no tests. This change addresses all production-readiness gaps in a single coordinated effort.

## What Changes

- **Fix critical bugs**: Container name filtering for orphan cleanup, CSV parser embedded-newline handling, SQL splitter escape sequence
- **Add safety guards**: Query execution timeouts, result size limits, runtime type validation for IPC payloads
- **Harden drivers**: MySQL affected-row-count reporting, SQLite query timeout, pool error handling
- **Improve test coverage**: Bring branch coverage from 78.4% to 85%+ threshold, add `initDocker()` tests, add integration-level tests for Docker lifecycle
- **Code quality**: Eliminate `env:nuke`/`env:destroy` duplication, unify `db-handlers` typing to match `ipc-handlers`, route history/savedQueries stores through typed API, remove dead Radix dependencies from UI package
- **CI/CD**: Add PR/push CI workflow with lint, typecheck, and test steps; include tests in release workflow
- **Landing page polish**: Fix version mismatches, wire up placeholder links, remove orphaned `LogosSection`, unify `cn` utility

## Capabilities

### New Capabilities
- `query-safety`: Query execution timeouts, result size limits, and safe query dispatch across all drivers
- `runtime-validation`: Runtime type guards and schema validation for IPC payloads and persisted state
- `ci-pipeline`: CI workflow for PRs/pushes with lint, typecheck, and test execution

### Modified Capabilities
<!-- No existing specs in openspec/specs/ to modify -->

## Impact

- **Core packages**: `@sqlose/core` (docker, drivers, query, import), `@sqlose/shared` (guards, types)
- **Desktop app**: `apps/desktop` (stores, hooks, ipc-handlers, db-handlers)
- **UI package**: `packages/ui` (remove dead deps)
- **Web app**: `apps/web` (fix links, versions, remove dead code)
- **CI/CD**: `.github/workflows/` (new ci.yml, update release.yml)
- **Dependencies**: May add a lightweight schema validation library (e.g., zod or valibot) to `@sqlose/shared`
