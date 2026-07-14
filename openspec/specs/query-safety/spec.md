# Query Safety

## Purpose

TBD

## Requirements

### Requirement: Query execution timeout
All database drivers SHALL enforce a maximum execution time for SQL queries. The default timeout SHALL be 30 seconds. Queries that exceed this timeout SHALL be cancelled and return a `QueryError` with code `query:timeout`.

#### Scenario: Query exceeds timeout
- **WHEN** a SQL query executes for longer than the configured timeout (default 30s)
- **THEN** the query SHALL be cancelled and a `QueryError` with code `query:timeout` SHALL be returned

#### Scenario: Query completes within timeout
- **WHEN** a SQL query completes before the timeout
- **THEN** the result SHALL be returned normally with no timeout error

#### Scenario: Postgres timeout reset
- **WHEN** a Postgres query executes with a custom `statement_timeout`
- **THEN** the timeout SHALL be reset to 0 after the query completes or fails

### Requirement: Query result size limit
The query execution layer SHALL cap the number of rows returned to a maximum of 10,000. When results are truncated, the `QueryResult` SHALL include `truncated: true` and the total row count.

#### Scenario: Query returns fewer than 10,000 rows
- **WHEN** a SQL query returns fewer than 10,000 rows
- **THEN** all rows SHALL be returned and `truncated` SHALL be `false`

#### Scenario: Query exceeds row limit
- **WHEN** a SQL query returns more than 10,000 rows
- **THEN** only the first 10,000 rows SHALL be returned, `truncated` SHALL be `true`, and `totalRowCount` SHALL contain the actual count

### Requirement: Container naming for orphan detection
All Docker containers created by SQLose SHALL have a name prefixed with `sqlose-`. The orphan cleanup filter SHALL match containers by this name prefix.

#### Scenario: Container created with sqlose prefix
- **WHEN** a new Docker container is created for a database environment
- **THEN** the container name SHALL start with `sqlose-` followed by the environment ID

#### Scenario: Orphan cleanup matches sqlose containers
- **WHEN** orphaned containers exist from a previous session
- **THEN** containers with the `sqlose-` prefix SHALL be detected and stopped

### Requirement: CSV parser handles embedded newlines
The CSV parser SHALL correctly handle quoted fields that contain newline characters. Newlines within quoted fields SHALL NOT be treated as row delimiters.

#### Scenario: Quoted field with newline
- **WHEN** a CSV file contains a quoted field with an embedded newline (e.g., `"line1\nline2"`)
- **THEN** the parser SHALL treat the entire quoted value as a single field value

#### Scenario: Quoted field with escaped quotes
- **WHEN** a CSV file contains a quoted field with an escaped double-quote (`""`)
- **THEN** the parser SHALL correctly unescape the double-quote within the field value

### Requirement: SQL dump splitter uses standard escape
The SQL dump splitter SHALL correctly handle SQL string literals that use the standard double-quote escape sequence (`''`), not backslash escapes.

#### Scenario: String with single-quote escape
- **WHEN** a SQL dump contains a string value like `'O''Brien'`
- **THEN** the splitter SHALL correctly identify the string boundary and not split at the escaped quote

### Requirement: MySQL affected row count
The MySQL driver SHALL return the affected row count for INSERT, UPDATE, and DELETE statements, not zero.

#### Scenario: INSERT returns affected count
- **WHEN** an INSERT statement is executed against MySQL
- **THEN** `QueryResult.rowCount` SHALL reflect the number of rows inserted

#### Scenario: UPDATE returns affected count
- **WHEN** an UPDATE statement is executed against MySQL
- **THEN** `QueryResult.rowCount` SHALL reflect the number of rows updated
