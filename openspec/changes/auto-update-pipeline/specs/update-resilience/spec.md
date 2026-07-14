## ADDED Requirements

### Requirement: Update state machine
The main process SHALL maintain an update state that transitions through the lifecycle: `idle` → `checking` → `available` → `downloading` → `downloaded` → `error`.

#### Scenario: State transitions from idle to checking
- **WHEN** `autoUpdater.checkForUpdates()` is called
- **THEN** the update state SHALL transition to `checking`

#### Scenario: State transitions to available
- **WHEN** the `update-available` event fires from electron-updater
- **THEN** the update state SHALL transition to `available` and SHALL store the `UpdateInfo` (version, release notes)

#### Scenario: State transitions to downloading
- **WHEN** `autoUpdater.downloadUpdate()` is called
- **THEN** the update state SHALL transition to `downloading`

#### Scenario: State transitions to downloaded
- **WHEN** the `update-downloaded` event fires from electron-updater
- **THEN** the update state SHALL transition to `downloaded`

#### Scenario: State transitions to error
- **WHEN** the `error` event fires from electron-updater
- **THEN** the update state SHALL transition to `error` and SHALL store the error message

#### Scenario: State resets on new check
- **WHEN** a new `checkForUpdates()` is called and the previous state was `error`
- **THEN** the update state SHALL reset to `checking`

### Requirement: Renderer can query current update state
The preload bridge SHALL expose a `getState()` method that returns the current update state and any associated data (version info, error message) to the renderer.

#### Scenario: Renderer queries state on mount
- **WHEN** the renderer mounts and calls `window.sqlose.update.getState()`
- **THEN** it SHALL receive the current state enum and any associated data (version for `available`/`downloading`/`downloaded`, message for `error`)

### Requirement: Retry on failed update check
The updater SHALL retry the initial update check up to 3 times with exponential backoff if the check fails.

#### Scenario: First check fails, retry after delay
- **WHEN** `checkForUpdates()` fails with a network error
- **THEN** the updater SHALL retry after 2 seconds

#### Scenario: Second check fails, retry after longer delay
- **WHEN** the second `checkForUpdates()` attempt also fails
- **THEN** the updater SHALL retry after 4 seconds

#### Scenario: Third check fails, retry with maximum delay
- **WHEN** the third `checkForUpdates()` attempt also fails
- **THEN** the updater SHALL retry after 8 seconds

#### Scenario: All retries exhausted
- **WHEN** all 3 retry attempts fail
- **THEN** the updater SHALL stop retrying, set state to `error`, and the error SHALL be visible to the renderer

#### Scenario: Check succeeds on retry
- **WHEN** a retry attempt succeeds (returns update info or confirms no update)
- **THEN** the retry counter SHALL reset and no further retries SHALL be scheduled

### Requirement: Periodic update polling
The updater SHALL re-check for updates every 4 hours while the application is running.

#### Scenario: Periodic check starts after initial check
- **WHEN** the initial update check completes (success or exhausted retries)
- **THEN** a 4-hour interval timer SHALL start for periodic update checks

#### Scenario: Periodic check finds an update
- **WHEN** a periodic check discovers a new version
- **THEN** the same event flow SHALL trigger as the initial check (`update-available` event, state transition to `available`)

#### Scenario: Periodic check finds no update
- **WHEN** a periodic check confirms no new version is available
- **THEN** the state SHALL remain `idle` and the next check SHALL be scheduled for 4 hours later

### Requirement: Error surfacing to user
Update errors SHALL be visible to the user via the existing toast notification system.

#### Scenario: Check error shown to user
- **WHEN** an update check fails and retries are exhausted
- **THEN** a toast notification SHALL display with the error message (e.g., "Unable to check for updates")

#### Scenario: Download error shown to user
- **WHEN** an update download fails
- **THEN** a toast notification SHALL display with the error message

#### Scenario: Error toast allows retry
- **WHEN** an error toast is shown for a failed check
- **THEN** the toast SHALL include a "Retry" action that triggers a new `checkForUpdates()` call
