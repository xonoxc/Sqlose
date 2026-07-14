import { err } from "neverthrow"
import { QueryError } from "@sqlose/shared"
import type { QueryResult, AsyncAppResult } from "@sqlose/shared"
import { executeQueryForDB } from "../drivers"
import { loadEnvironment } from "../environment/store"

const MAX_ROWS = 10_000

export async function executeQuery(environmentId: string, sql: string): AsyncAppResult<QueryResult> {
   const env = loadEnvironment(environmentId)
   if (!env) {
      return err(new QueryError("query:connection_failed", `Environment ${environmentId} not found`))
   }
   if (env.status !== "running") {
      return err(new QueryError("query:connection_failed", "Environment is not running"))
   }

   const result = await executeQueryForDB(env.dbType, env.connectionString, sql)
   if (result.isErr()) {
      return result
   }

   const queryResult = result.value
   if (queryResult.rows.length > MAX_ROWS) {
      const totalRowCount = queryResult.rowCount
      queryResult.rows = queryResult.rows.slice(0, MAX_ROWS)
      queryResult.rowCount = MAX_ROWS
      queryResult.truncated = true
      queryResult.totalRowCount = totalRowCount
   }

   return result
}

export function buildQueryHistory(
   environmentId: string,
   sql: string,
   result: QueryResult | null,
   error: string | null
) {
   return {
      id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      environmentId,
      sql,
      result,
      error,
      executedAt: new Date().toISOString(),
   }
}
