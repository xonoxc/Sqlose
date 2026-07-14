import pg from "pg"
import { ok, err } from "neverthrow"
import { attempt } from "@sqlose/shared"
import { QueryError } from "@sqlose/shared"
import type { QueryResult, AsyncAppResult } from "@sqlose/shared"
import { getPool } from "./pool"

export async function executePostgresQuery(
   connectionString: string,
   sql: string
): AsyncAppResult<QueryResult> {
   const pool = getPool(connectionString, "postgres") as pg.Pool

   const clientResult = await attempt<pg.PoolClient>(pool.connect())
   if (clientResult.isErr()) {
      return err(new QueryError("query:execution_failed", clientResult.error.message))
   }

   const client = clientResult.value
   const start = performance.now()

   await attempt(client.query("SET statement_timeout = '30s'"))

   const queryResult = await attempt<pg.QueryResult>(client.query(sql))

   await attempt(client.query("SET statement_timeout = 0"))
   client.release()

   return queryResult.match(
      result => {
         const executionTimeMs = Math.round(performance.now() - start)
         return ok({
            columns: result.fields.map(f => f.name),
            rows: result.rows as Record<string, unknown>[],
            rowCount: result.rowCount ?? result.rows.length,
            executionTimeMs,
         })
      },
      e => {
         const message = e.message ?? ""
         if (message.includes("timed out") || message.includes("canceling")) {
            return err(new QueryError("query:timeout", message))
         }
         if (message.toLowerCase().includes("syntax")) {
            return err(new QueryError("query:invalid_syntax", message))
         }
         return err(new QueryError("query:execution_failed", message))
      }
   )
}

export async function testPostgresConnection(connectionString: string): AsyncAppResult<boolean> {
   const pool = getPool(connectionString, "postgres") as pg.Pool

   const clientResult = await attempt<pg.PoolClient>(pool.connect())
   if (clientResult.isErr()) {
      return ok(false)
   }

   const client = clientResult.value
   const queryResult = await attempt(client.query("SELECT 1"))
   client.release()

   return queryResult.match(
      () => ok(true),
      () => ok(false)
   )
}
