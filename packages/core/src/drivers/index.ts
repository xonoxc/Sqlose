import { err } from "neverthrow"
import { QueryError } from "@sqlose/shared"
import type { DBType, QueryResult, AsyncAppResult } from "@sqlose/shared"
import { DRIVERS } from "./registry"

export { destroyPool } from "./pool"

export async function executeQueryForDB(
   dbType: DBType,
   connectionString: string,
   sql: string
): AsyncAppResult<QueryResult> {
   if (!(dbType in DRIVERS)) {
      return err(new QueryError("query:execution_failed", `Unsupported DB type: ${dbType}`))
   }
   return DRIVERS[dbType].execute(connectionString, sql)
}
