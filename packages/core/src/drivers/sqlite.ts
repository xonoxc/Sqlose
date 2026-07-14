import sqlite3 from "sqlite3"
import { ok, err } from "neverthrow"
import { QueryError } from "@sqlose/shared"
import type { QueryResult, AsyncAppResult } from "@sqlose/shared"

const QUERY_TIMEOUT_MS = 30_000

function openDatabase(dbPath: string): Promise<sqlite3.Database> {
   return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(dbPath, error => {
         if (error) reject(error)
         else resolve(db)
      })
   })
}

function runQuery(
   db: sqlite3.Database,
   sql: string
): Promise<{ columns: string[]; rows: Record<string, unknown>[] }> {
   return new Promise((resolve, reject) => {
      db.all(sql, (error, rows) => {
         if (error) reject(error)
         else {
            const columns = rows.length > 0 ? Object.keys(rows[0] as Record<string, unknown>) : []
            resolve({ columns, rows: rows as Record<string, unknown>[] })
         }
      })
   })
}

function closeDatabase(db: sqlite3.Database): Promise<void> {
   return new Promise((resolve, reject) => {
      db.close(err => {
         if (err) reject(err)
         else resolve()
      })
   })
}

export async function executeSQLiteQuery(
   dbPath: string,
   sql: string
): AsyncAppResult<QueryResult> {
   let db: sqlite3.Database | null = null
   try {
      db = await openDatabase(dbPath)
      const start = performance.now()
      const result = await Promise.race([
         runQuery(db, sql),
         new Promise<never>((_, reject) =>
            setTimeout(
               () => reject(new Error("Query timed out after 30000ms")),
               QUERY_TIMEOUT_MS
            )
         ),
      ])
      const executionTimeMs = Math.round(performance.now() - start)
      return ok({
         columns: result.columns,
         rows: result.rows,
         rowCount: result.rows.length,
         executionTimeMs,
      })
   } catch (e: unknown) {
      const message = (e as Error).message ?? ""
      if (message.includes("timed out")) {
         return err(new QueryError("query:timeout", message))
      }
      if (message.toLowerCase().includes("syntax")) {
         return err(new QueryError("query:invalid_syntax", message))
      }
      return err(new QueryError("query:execution_failed", message))
   } finally {
      if (db) {
         try {
            await closeDatabase(db)
         } catch {
            // ignore close errors
         }
      }
   }
}
