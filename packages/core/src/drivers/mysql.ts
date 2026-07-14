import mysql from "mysql2/promise"
import { ok, err } from "neverthrow"
import { attempt } from "@sqlose/shared"
import { QueryError } from "@sqlose/shared"
import type { QueryResult, AsyncAppResult } from "@sqlose/shared"
import { getPool } from "./pool"

export async function executeMySQLQuery(
   connectionString: string,
   sql: string
): AsyncAppResult<QueryResult> {
   const pool = getPool(connectionString, "mysql") as mysql.Pool

   const connResult = await attempt<mysql.PoolConnection>(pool.getConnection())
   if (connResult.isErr()) {
      return err(new QueryError("query:execution_failed", connResult.error.message))
   }

   const conn = connResult.value
   const start = performance.now()

   const queryResult = await attempt<[mysql.QueryResult, mysql.FieldPacket[]]>(
      conn.query({ sql, timeout: 30000 })
   )
   conn.release()

   return queryResult.match(
      ([rows, fields]) => {
         const executionTimeMs = Math.round(performance.now() - start)
         const fieldDescriptors = fields as mysql.FieldPacket[]
         const columns = fieldDescriptors?.map((f: mysql.FieldPacket) => f.name) ?? []
         const isResultSet = Array.isArray(rows)
         const rowCount = isResultSet
            ? rows.length
            : (rows as mysql.ResultSetHeader).affectedRows ?? 0
         return ok({
            columns,
            rows: (rows as Record<string, unknown>[]) ?? [],
            rowCount,
            executionTimeMs,
         })
      },
      e => {
         const message = e.message ?? ""
         if (message.includes("timed out") || message.includes("ETIMEOUT")) {
            return err(new QueryError("query:timeout", message))
         }
         if (message.toLowerCase().includes("syntax")) {
            return err(new QueryError("query:invalid_syntax", message))
         }
         return err(new QueryError("query:execution_failed", message))
      }
   )
}

export async function testMySQLConnection(connectionString: string): AsyncAppResult<boolean> {
   const pool = getPool(connectionString, "mysql") as mysql.Pool

   const connResult = await attempt<mysql.PoolConnection>(pool.getConnection())
   if (connResult.isErr()) {
      return ok(false)
   }

   const conn = connResult.value
   const queryResult = await attempt(conn.query("SELECT 1"))
   conn.release()

   return queryResult.match(
      () => ok(true),
      () => ok(false)
   )
}
