## ADDED Requirements

### Requirement: Active state check before install
Before calling `quitAndInstall()`, the updater SHALL check whether the user has active database queries or running Docker containers.

#### Scenario: No active queries or containers
- **WHEN** the user clicks "Install Now" and there are no active queries and no running Docker containers
- **THEN** the app SHALL proceed with `quitAndInstall()` without additional prompts

#### Scenario: Active queries detected
- **WHEN** the user clicks "Install Now" and there is at least one active (executing) database query
- **THEN** a confirmation dialog SHALL appear warning the user that active queries will be interrupted, with options to "Install Now" (force) or "Cancel"

#### Scenario: Running Docker containers detected
- **WHEN** the user clicks "Install Now" and there are running Docker containers managed by the app
- **THEN** a confirmation dialog SHALL appear warning the user that Docker containers will be stopped, with options to "Install Now" (force) or "Cancel"

#### Scenario: Both active queries and containers
- **WHEN** the user clicks "Install Now" and both active queries and running containers exist
- **THEN** the confirmation dialog SHALL warn about both, listing the count of active queries and running containers

#### Scenario: User cancels install
- **WHEN** the confirmation dialog is shown and the user clicks "Cancel"
- **THEN** the install SHALL be aborted and the update state SHALL remain `downloaded` so the user can install later

### Requirement: Graceful Docker container shutdown
When the user confirms the install, the updater SHALL attempt to stop running Docker containers gracefully before quitting.

#### Scenario: Containers stop before quit
- **WHEN** the user confirms install and Docker containers are running
- **THEN** the updater SHALL call `stopAllContainers()` and wait for it to complete before calling `quitAndInstall()`

#### Scenario: Container stop fails
- **WHEN** `stopAllContainers()` throws an error
- **THEN** the updater SHALL log the error and proceed with `quitAndInstall()` anyway (the user already confirmed)

### Requirement: Managed package users see guidance
For Linux packages installed via system package managers (apt, snap), the updater SHALL NOT attempt to download or install updates.

#### Scenario: Managed package detected
- **WHEN** the app detects it is installed in a managed path (`/usr/` or `/snap/`)
- **THEN** the update toast SHALL display a message directing the user to use their package manager (e.g., "use your package manager to upgrade") instead of showing a download button
