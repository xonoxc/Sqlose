## Why

The desktop app has a partial electron-updater integration: the main process checks for updates on startup, the preload bridge exposes update events, and a `useUpdateToast` hook renders notifications. However, the pipeline has gaps that prevent reliable auto-updates for end users. There is no CI release workflow to publish builds to GitHub Releases, the update check only runs once at startup with no retry or periodic polling, errors are silently logged without user-facing feedback, and the Linux AppImage/deb experience for managed packages is underspecified. To ship confident auto-updates, the full loop—from CI publishing a release to the running app downloading and installing it—must work end-to-end.

## What Changes

- Add a GitHub Actions release workflow that builds platform artifacts and publishes them to GitHub Releases with `electron-builder --publish always`
- Make the updater resilient: add retry logic for the initial check, and optionally poll for updates on a timer so users who keep the app open for long sessions still get notified
- Surface update errors to the user via toast notifications (currently only logged to console)
- Guard the `quitAndInstall` path so it does not interrupt active queries or running Docker containers—prompt the user to save work first
- Add update state tracking (checking / available / downloading / downloaded / error) so the renderer can show appropriate UI for each stage
- Verify the NSIS (Windows), DMG (macOS), and AppImage/deb (Linux) installers all support delta/incremental updates where electron-updater supports them, and configure `electron-builder` accordingly

## Capabilities

### New Capabilities
- `update-release-ci`: GitHub Actions workflow that builds all platform targets and publishes to GitHub Releases on tag push, enabling the electron-updater publish provider to find new versions
- `update-resilience`: Retry logic, periodic polling, update state machine, and error surfacing so the update experience is robust and user-friendly
- `update-safe-install`: Guard rails around quit-and-install that check for active state (running queries, Docker containers) and prompt the user before proceeding

### Modified Capabilities

## Impact

- **Code**: `apps/desktop/electron/main.ts` (updater logic, state machine), `apps/desktop/src/hooks/useUpdateToast.ts` (expanded toast states), `apps/desktop/electron/preload.ts` (new IPC channels for state)
- **CI/CD**: New `.github/workflows/release.yml` (or rename/replace existing if present)
- **Dependencies**: None new—`electron-updater` and `electron-builder` are already installed
- **Build config**: Potential additions to `electron-builder.json5` (nsis/allowDowngrade, publish config refinements)
- **User experience**: Users will see a toast when an update is available, a download progress indicator, a prompt before installing, and will no longer need to manually reinstall for new versions
