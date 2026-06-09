import mysql from "mysql2/promise"
import { ok, err } from "neverthrow"
import { QueryError } from "@sqlose/shared"
import type { QueryResult, AsyncAppResult } from "@sqlose/shared"
import { getPool } from "./pool"

export async function executeMySQLQuery(
   connectionString: string,
   sql: string
): AsyncAppResult<QueryResult> {
   const pool = getPool(connectionString, "mysql") as mysql.Pool

   let conn: mysql.PoolConnection | null = null
   try {
      conn = await pool.getConnection()
      const start = performance.now()
      const [rows, fields] = await conn.query(sql)
      const executionTimeMs = Math.round(performance.now() - start)
      const fieldDescriptors = fields as mysql.FieldPacket[]
      const columns = fieldDescriptors?.map((f: mysql.FieldPacket) => f.name) ?? []

      return ok({
         columns,
         rows: (rows as Record<string, unknown>[]) ?? [],
         rowCount: Array.isArray(rows) ? rows.length : 0,
         executionTimeMs,
      })
   } catch (e) {
      const message = (e as Error).message ?? ""
      if (message.toLowerCase().includes("syntax")) {
         return err(new QueryError("query:invalid_syntax", message))
      }
      return err(new QueryError("query:execution_failed", message))
   } finally {
      if (conn) conn.release()
   }
}

export async function testMySQLConnection(connectionString: string): AsyncAppResult<boolean> {
   const pool = getPool(connectionString, "mysql") as mysql.Pool

   let conn: mysql.PoolConnection | null = null
   try {
      conn = await pool.getConnection()
      await conn.query("SELECT 1")
      return ok(true)
   } catch {
      return ok(false)
   } finally {
      if (conn) conn.release()
   }
}
