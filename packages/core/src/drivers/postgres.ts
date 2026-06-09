import pg from "pg"
import { ok, err } from "neverthrow"
import { QueryError } from "@sqlose/shared"
import type { QueryResult, AsyncAppResult } from "@sqlose/shared"
import { getPool } from "./pool"

export async function executePostgresQuery(
   connectionString: string,
   sql: string
): AsyncAppResult<QueryResult> {
   const pool = getPool(connectionString, "postgres") as pg.Pool

   let client: pg.PoolClient | null = null
   try {
      client = await pool.connect()
      const start = performance.now()
      const result = await client.query(sql)
      const executionTimeMs = Math.round(performance.now() - start)
      return ok({
         columns: result.fields.map(f => f.name),
         rows: result.rows as Record<string, unknown>[],
         rowCount: result.rowCount ?? result.rows.length,
         executionTimeMs,
      })
   } catch (e) {
      const message = (e as Error).message ?? ""
      if (message.toLowerCase().includes("syntax")) {
         return err(new QueryError("query:invalid_syntax", message))
      }
      return err(new QueryError("query:execution_failed", message))
   } finally {
      if (client) client.release()
   }
}

export async function testPostgresConnection(connectionString: string): AsyncAppResult<boolean> {
   const pool = getPool(connectionString, "postgres") as pg.Pool

   let client: pg.PoolClient | null = null
   try {
      client = await pool.connect()
      await client.query("SELECT 1")
      return ok(true)
   } catch {
      return ok(false)
   } finally {
      if (client) client.release()
   }
}
