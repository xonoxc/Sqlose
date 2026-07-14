## Context

Sqlose is an Electron 42 + React desktop app built with Vite and electron-builder. It already has a working `electron-updater` integration: the main process (`apps/desktop/electron/main.ts`) configures `autoUpdater` with `autoDownload: false`, forwards events to the renderer via IPC, and checks for updates once on startup in production. The preload bridge and a `useUpdateToast` hook render notifications in the UI.

The `electron-builder.json5` is configured to publish to GitHub Releases (`xonoxc/Sqlose`). However, there is no CI workflow that actually builds and publishes releases, the update check runs exactly once at startup, errors are silently logged, and the quit-and-install path has no safety checks.

## Goals / Non-Goals

**Goals:**
- End-to-end auto-update pipeline: CI builds and publishes → app checks GitHub Releases → downloads → installs
- Resilient update checking: retry on failure, periodic re-check for long sessions
- User-facing error notifications for failed update checks/downloads
- Safe install flow: warn users about active queries or running containers before quitting
- Clean state machine for the update lifecycle (checking → available → downloading → downloaded → installing)

**Non-Goals:**
- Delta/differential updates (electron-updater handles this where supported; no custom delta logic)
- Staged rollouts or percentage-based rollouts (GitHub Releases doesn't support this natively)
- Custom update server (GitHub Releases is the chosen provider)
- Auto-update for Linux `.deb` packages installed via apt (these are managed by the system package manager—out of scope)
- Rollback mechanism if a new version introduces a regression

## Decisions

### 1. GitHub Actions release workflow triggered by version tags

**Decision**: Use a `v*` tag push (e.g., `v0.3.0`) to trigger a GitHub Actions workflow that runs `electron-builder --publish always` for all three platforms.

**Rationale**: Tag-based releases are the simplest model for a small team. The `electron-builder` GitHub publish provider already knows how to create a GitHub Release and upload artifacts. A manual `npm version` + `git push --tags` flow keeps release orchestration predictable.

**Alternatives considered**:
- *Workflow dispatch with manual version input*: More flexible but adds friction and risk of version mismatches between code and tag.
- *Release on every push to main*: Too aggressive; not every commit should be a release.

### 2. Update state machine in the main process

**Decision**: Track update state (`idle` → `checking` → `available` → `downloading` → `downloaded` → `error`) as a module-level variable in `main.ts`. Expose the current state via a new IPC handler (`update:get-state`) so the renderer can query it on mount (e.g., if the app was backgrounded during an update check).

**Rationale**: A single source of truth in the main process avoids race conditions between multiple renderer windows and makes the flow auditable. The renderer can poll or subscribe, but the state lives in one place.

**Alternatives considered**:
- *State only in renderer via events*: Breaks if the window reloads or a second window opens. Loses state.
- *Persistent state in electron-store*: Unnecessary complexity; update state is ephemeral and resets each launch.

### 3. Retry with exponential backoff for the initial check

**Decision**: If `checkForUpdates()` fails, retry up to 3 times with exponential backoff (2s, 4s, 8s). After 3 failures, surface the error to the user and stop retrying.

**Rationale**: Network issues at startup are common (VPN, Wi-Fi handshake, DNS). Silent retries avoid annoying the user while still being resilient. A hard cap prevents infinite retry loops.

**Alternatives considered**:
- *Single retry*: Too aggressive; two quick failures in a row are common on flaky networks.
- *Infinite retry*: Wasteful and could mask a real configuration error.
- *Periodic polling only (no retry)*: Defers the check by minutes; user might not see the update for a while.

### 4. Periodic update check every 4 hours

**Decision**: After the initial check succeeds (or exhausts retries), set a 4-hour interval to re-check for updates while the app is running.

**Rationale**: Users who keep the app open for long sessions (common for a SQL tool) would otherwise miss updates until they restart. 4 hours is frequent enough to be timely but infrequent enough to avoid hammering the GitHub API.

**Alternatives considered**:
- *Check only on startup*: Simple, but users who never close the app never get updates.
- *Check on every focus event*: Too aggressive; GitHub has rate limits.

### 5. Guard quit-and-install with active state checks

**Decision**: Before calling `autoUpdater.quitAndInstall()`, check for active database queries and running Docker containers. If any are active, show a dialog warning the user and let them confirm or cancel.

**Rationale**: A SQL tool often has long-running queries and Docker containers. Force-quitting mid-query could lose work. The user should always have the choice to finish what they're doing first.

**Alternatives considered**:
- *Always force quit and install*: Simpler but could cause data loss for users mid-query.
- *Queue the install for next natural quit*: More complex state management; the user might forget.

### 6. Expose update state to preload with a typed API

**Decision**: Add `update:get-state` IPC handler and extend the preload bridge with `getState()` returning the current update state enum. Extend the renderer hook to handle all states.

**Rationale**: The renderer needs to show different UI based on state (e.g., "Checking for updates..." spinner vs. "Update available" toast). A typed state enum keeps the contract clear between main and renderer.

## Risks / Trade-offs

- **[Risk] GitHub API rate limiting** → The 4-hour poll interval and 3-retry cap keep us well under limits. The `electron-updater` library uses conditional requests (If-None-Match) which helps.
- **[Risk] Users on slow connections get stuck on "Downloading..."** → The download progress toast already shows percentage. Consider adding a "Cancel download" option in a future iteration.
- **[Risk] NSIS installer on Windows requires the app to fully quit before installing** → `quitAndInstall()` handles this, but if the user has unsaved work in the SQL editor, they lose it. The active-state guard mitigates this for queries/Docker but not for unsaved SQL text. Consider a "save draft?" prompt in a future iteration.
- **[Trade-off] No auto-install on macOS** → macOS DMG requires manual drag-to-install. `quitAndInstall()` on macOS opens the DMG. This is standard behavior; not worth building custom logic around.
- **[Trade-off] Linux AppImage updates require FUSE** → Some server/minimal Linux installs lack FUSE. The existing `isPackageManaged` check already handles this by telling users to use their package manager.
