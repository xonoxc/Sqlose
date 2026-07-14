## ADDED Requirements

### Requirement: Release workflow triggered by version tag
The CI system SHALL build and publish desktop app artifacts to GitHub Releases when a `v*` tag is pushed to the repository.

#### Scenario: Tag push triggers release build
- **WHEN** a git tag matching the pattern `v*` (e.g., `v0.3.0`) is pushed to the repository
- **THEN** the GitHub Actions release workflow SHALL run `electron-builder --publish always` for all platform targets (macOS DMG, Windows NSIS, Linux AppImage and deb)

#### Scenario: Release artifacts are uploaded to GitHub Releases
- **WHEN** the release workflow completes a platform build successfully
- **THEN** the built artifacts SHALL be uploaded to a GitHub Release matching the tag name, and the release SHALL be marked as the latest release

#### Scenario: Workflow runs on all three platforms
- **WHEN** the release workflow triggers
- **THEN** it SHALL build on `macos-latest`, `windows-latest`, and `ubuntu-latest` runners in parallel

#### Scenario: Workflow uses the correct Node and package manager
- **WHEN** the release workflow runs
- **THEN** it SHALL use the Node.js version and Bun package manager specified in the project configuration

### Requirement: electron-builder publish configuration
The electron-builder configuration SHALL be set to publish artifacts to GitHub Releases for the `xonoxc/Sqlose` repository.

#### Scenario: Publish provider is GitHub
- **WHEN** electron-builder runs with `--publish always`
- **THEN** it SHALL upload artifacts to GitHub Releases using the provider `github`, owner `xonoxc`, repo `Sqlose`, with release type `release`

#### Scenario: Artifacts use versioned naming
- **WHEN** a build is published
- **THEN** artifact filenames SHALL include the version number (e.g., `Sqlose-Windows-0.3.0-Setup.exe`)
