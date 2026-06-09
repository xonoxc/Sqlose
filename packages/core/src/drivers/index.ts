import { err } from "neverthrow"
import { QueryError } from "@sqlose/shared"
import type { DBType, QueryResult, AsyncAppResult } from "@sqlose/shared"
import { executeSQLiteQuery } from "./sqlite"

export function executeQueryForDB(
   dbType: DBType,
   connectionString: string,
   sql: string
): AsyncAppResult<QueryResult> {
   switch (dbType) {
      case "postgres":
         return import("./postgres").then(m => m.executePostgresQuery(connectionString, sql))
      case "mysql":
         return import("./mysql").then(m => m.executeMySQLQuery(connectionString, sql))
      case "sqlite":
         return executeSQLiteQuery(connectionString, sql)
      default:
         return Promise.resolve(
            err(new QueryError("query:execution_failed", `Unsupported DB type: ${dbType}`))
         )
   }
}
