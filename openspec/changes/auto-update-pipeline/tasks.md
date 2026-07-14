## 1. Release CI Workflow

- [x] 1.1 Create `.github/workflows/release.yml` triggered on `v*` tag push
- [x] 1.2 Configure matrix strategy for `macos-latest`, `windows-latest`, `ubuntu-latest`
- [x] 1.3 Set up Bun and Node.js on each runner using the project's package manager version
- [x] 1.4 Add steps: checkout, install dependencies, run build (`turbo run build`), run `electron-builder --publish always`
- [x] 1.5 Verify electron-builder.json5 publish config points to `xonoxc/Sqlose` GitHub repo with release type `release`

## 2. Update State Machine (Main Process)

- [x] 2.1 Define `UpdateState` type and state variable in `apps/desktop/electron/main.ts` (`idle` | `checking` | `available` | `downloading` | `downloaded` | `error`) with associated data fields
- [x] 2.2 Wrap existing `autoUpdater.checkForUpdates()` call to transition state to `checking`
- [x] 2.3 Update `update-available` handler to set state to `available` and store `UpdateInfo`
- [x] 2.4 Add IPC handler `update:download` to transition state to `downloading` before calling `autoUpdater.downloadUpdate()`
- [x] 2.5 Update `update-downloaded` handler to set state to `downloaded`
- [x] 2.6 Update `error` handler to set state to `error` and store error message
- [x] 2.7 Add IPC handler `update:get-state` that returns current state and associated data to the renderer

## 3. Retry Logic

- [x] 3.1 Create a `checkForUpdatesWithRetry(attempt)` helper function in `main.ts` that calls `autoUpdater.checkForUpdates()` and catches errors
- [x] 3.2 Implement exponential backoff: retry after 2s (attempt 1), 4s (attempt 2), 8s (attempt 3)
- [x] 3.3 Cap retries at 3 attempts; on exhaustion, set state to `error`
- [x] 3.4 Reset retry counter on successful check

## 4. Periodic Update Polling

- [x] 4.1 After initial check completes (success or exhausted retries), start a `setInterval` at 4 hours (14,400,000ms)
- [x] 4.2 Each interval tick calls `checkForUpdatesWithRetry(0)` (fresh retry cycle)
- [x] 4.3 Clear interval on `app.quit` / `will-quit`

## 5. Preload Bridge Extension

- [x] 5.1 Add `getState()` method to `apps/desktop/electron/preload.ts` that invokes `update:get-state`
- [x] 5.2 Export the `UpdateState` type for renderer consumption
- [x] 5.3 Add `onStateChange` listener in preload so the renderer can subscribe to state transitions (optional, for reactive UI)

## 6. Renderer Error Surfacing

- [x] 6.1 Update `apps/desktop/src/hooks/useUpdateToast.ts` to call `getState()` on mount and render appropriate toast for current state
- [x] 6.2 Add error toast for `error` state with error message and "Retry" action button
- [x] 6.3 Add "Checking for updates..." toast for `checking` state
- [x] 6.4 Ensure the existing `update-available`, `download-progress`, `update-downloaded` toasts still work with the new state machine

## 7. Safe Install Flow

- [x] 7.1 Add IPC handler `update:check-active-state` in `main.ts` that returns `{ activeQueries: number, runningContainers: number }`
- [x] 7.2 Add `checkActiveState()` method to the preload bridge
- [x] 7.3 Before calling `quitAndInstall()` in the `update:quit-and-install` handler, invoke `checkActiveState()` and show a native `dialog.showMessageBox` confirmation if either count > 0
- [x] 7.4 On user confirm, call `stopAllContainers()` (graceful shutdown), wait for completion, then `autoUpdater.quitAndInstall()`
- [x] 7.5 On user cancel, leave state as `downloaded` so the user can install later
- [x] 7.6 If `stopAllContainers()` fails, log error and proceed with `quitAndInstall()` anyway

## 8. Verification

- [ ] 8.1 Test the release workflow by pushing a `v*` tag and verifying artifacts appear on GitHub Releases
- [ ] 8.2 Test update flow end-to-end: install older version, push new release, verify toast appears, download completes, install succeeds
- [ ] 8.3 Test retry logic: simulate network failure, verify 3 retries with backoff, verify error toast appears
- [ ] 8.4 Test safe install: start a long-running query, trigger install, verify confirmation dialog appears
- [ ] 8.5 Test managed package path: verify Linux deb/snap users see "use package manager" message instead of download button
