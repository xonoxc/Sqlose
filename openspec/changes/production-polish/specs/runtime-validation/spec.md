## ADDED Requirements

### Requirement: Runtime validation of IPC payloads
The system SHALL validate the shape and types of all IPC payloads at the process boundary using runtime type guards. Invalid payloads SHALL be rejected with an `IPCError` before reaching business logic.

#### Scenario: Valid IPC payload
- **WHEN** a valid IPC request payload is received
- **THEN** the payload SHALL pass validation and be forwarded to the handler

#### Scenario: Invalid IPC payload
- **WHEN** an IPC request payload is missing required fields or has wrong types
- **THEN** an `IPCError` with code `ipc:invalid_payload` SHALL be returned

### Requirement: Type guards for core domain types
`@sqlose/shared` SHALL export runtime type guards for `Environment`, `EnvironmentStatus`, `DBType`, `ImportFormat`, and `DockerAvailability`. These guards SHALL validate all required fields and their types.

#### Scenario: Valid Environment object
- **WHEN** an `unknown` value is passed to `isEnvironment()`
- **THEN** it SHALL return `true` if the value has all required `Environment` fields with correct types

#### Scenario: Invalid Environment object
- **WHEN** an `unknown` value is missing required `Environment` fields
- **THEN** `isEnvironment()` SHALL return `false`

#### Scenario: DBType validation
- **WHEN** `isDBType()` is called with `"postgres"`, `"mysql"`, or `"sqlite"`
- **THEN** it SHALL return `true`

#### Scenario: Invalid DBType
- **WHEN** `isDBType()` is called with an unrecognized string
- **THEN** it SHALL return `false`

### Requirement: Environment store schema validation
When loading environments from persistent storage, the system SHALL validate that each stored object conforms to the `Environment` type. Corrupted or invalid entries SHALL be skipped with a warning logged.

#### Scenario: Valid stored environments
- **WHEN** environments are loaded from `electron-store`
- **THEN** all valid environment records SHALL be returned

#### Scenario: Corrupted stored environment
- **WHEN** a stored environment object fails validation
- **THEN** it SHALL be skipped (not included in the loaded list) and a warning SHALL be logged
