import { err } from "neverthrow"
import { QueryError } from "@sqlose/shared"
import type { DBType, QueryResult, AsyncAppResult } from "@sqlose/shared"
import { executeSQLiteQuery } from "./sqlite"

export { destroyPool } from "./pool"

export async function executeQueryForDB(
   dbType: DBType,
   connectionString: string,
   sql: string
): AsyncAppResult<QueryResult> {
   switch (dbType) {
      case "postgres":
         return (await import("./postgres")).executePostgresQuery(connectionString, sql)
      case "mysql":
         return (await import("./mysql")).executeMySQLQuery(connectionString, sql)
      case "sqlite":
         return executeSQLiteQuery(connectionString, sql)
      default:
         return err(new QueryError("query:execution_failed", `Unsupported DB type: ${dbType}`))
   }
}
