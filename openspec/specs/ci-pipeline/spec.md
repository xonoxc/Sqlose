# CI Pipeline

## Purpose

TBD

## Requirements

### Requirement: CI workflow on pull requests
A CI workflow SHALL run on every pull request and push to `main`. The workflow SHALL execute linting, type checking, and unit tests across all packages.

#### Scenario: PR triggers CI
- **WHEN** a pull request is opened or updated
- **THEN** the CI workflow SHALL run `bun lint`, `bun typecheck`, and `bun test`

#### Scenario: Push to main triggers CI
- **WHEN** code is pushed to the `main` branch
- **THEN** the CI workflow SHALL run `bun lint`, `bun typecheck`, and `bun test`

#### Scenario: CI failure blocks merge
- **WHEN** any step in the CI workflow fails
- **THEN** the workflow SHALL report failure and the PR checks SHALL show as failing

### Requirement: Release workflow includes tests
The existing release workflow SHALL run lint, typecheck, and tests before building and publishing. If any check fails, the release SHALL NOT proceed.

#### Scenario: Release with passing tests
- **WHEN** a version tag is pushed and all tests pass
- **THEN** the release workflow SHALL build and publish the app

#### Scenario: Release with failing tests
- **WHEN** a version tag is pushed and any test fails
- **THEN** the release workflow SHALL fail and NOT publish the app
