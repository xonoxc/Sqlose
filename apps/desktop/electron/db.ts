import { app } from "electron"
import path from "node:path"
import fs from "node:fs"
import initSqlJs, { type Database } from "sql.js"

let db: Database | null = null
let SQL: Awaited<ReturnType<typeof initSqlJs>> | null = null

export function getDbPath(): string {
   const userData = app.getPath("userData")
   return path.join(userData, "sqlose.db")
}

function persist(): void {
   const data = db!.export()
   fs.writeFileSync(getDbPath(), Buffer.from(data))
}

export async function initDatabase(): Promise<void> {
   SQL = await initSqlJs()
   const dbPath = getDbPath()
   const dir = path.dirname(dbPath)
   if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
   }
   if (fs.existsSync(dbPath)) {
      const buffer = fs.readFileSync(dbPath)
      db = new SQL.Database(buffer)
   } else {
      db = new SQL.Database()
   }
   migrate()
   persist()
}

function migrate(): void {
   db!.run(`
      CREATE TABLE IF NOT EXISTS saved_queries (
         id TEXT PRIMARY KEY,
         name TEXT NOT NULL,
         sql_text TEXT NOT NULL,
         tags TEXT NOT NULL DEFAULT '[]',
         environment_id TEXT,
         created_at TEXT NOT NULL,
         updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS history (
         id TEXT PRIMARY KEY,
         sql_text TEXT NOT NULL,
         environment_id TEXT,
         db_type TEXT NOT NULL,
         duration INTEGER NOT NULL,
         row_count INTEGER NOT NULL,
         status TEXT NOT NULL,
         error_text TEXT,
         executed_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS store (
         key TEXT PRIMARY KEY,
         value TEXT NOT NULL
      );
   `)
   try {
      db!.run("ALTER TABLE saved_queries ADD COLUMN result TEXT")
   } catch {
      /* column may already exist */
   }
   try {
      db!.run("ALTER TABLE history ADD COLUMN result TEXT")
   } catch {
      /* column may already exist */
   }
}

export function storeGet(key: string): string | null {
   const stmt = db!.prepare("SELECT value FROM store WHERE key = ?")
   stmt.bind([key])
   if (stmt.step()) {
      const row = stmt.getAsObject() as { value: string }
      stmt.free()
      return row.value
   }
   stmt.free()
   return null
}

export function storeSet(key: string, value: string): void {
   db!.run("INSERT OR REPLACE INTO store (key, value) VALUES (?, ?)", [key, value])
   persist()
}

export function storeDelete(key: string): void {
   db!.run("DELETE FROM store WHERE key = ?", [key])
   persist()
}

export interface SavedQueryRow {
   id: string
   name: string
   sql_text: string
   tags: string
   environment_id: string | null
   created_at: string
   updated_at: string
   result: string | null
}

function rowsToArray<T>(stmt: ReturnType<Database["prepare"]>): T[] {
   const results: T[] = []
   while (stmt.step()) {
      results.push(stmt.getAsObject() as T)
   }
   stmt.free()
   return results
}

function rowToValue<T>(stmt: ReturnType<Database["prepare"]>): T | null {
   if (stmt.step()) {
      const val = stmt.getAsObject() as T
      stmt.free()
      return val
   }
   stmt.free()
   return null
}

export function getSavedQueries(environmentId?: string | null): SavedQueryRow[] {
   if (environmentId) {
      const stmt = db!.prepare(
         "SELECT * FROM saved_queries WHERE environment_id = ? ORDER BY updated_at DESC"
      )
      stmt.bind([environmentId])
      return rowsToArray<SavedQueryRow>(stmt)
   }
   const stmt = db!.prepare("SELECT * FROM saved_queries ORDER BY updated_at DESC")
   return rowsToArray<SavedQueryRow>(stmt)
}

export function saveQuery(
   id: string,
   name: string,
   sql: string,
   tags: string[],
   environmentId: string | null,
   result: string | null = null
): void {
   const now = new Date().toISOString()
   db!.run(
      "INSERT INTO saved_queries (id, name, sql_text, tags, environment_id, created_at, updated_at, result) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [id, name, sql, JSON.stringify(tags), environmentId, now, now, result]
   )
   persist()
}

export function updateSavedQuery(
   id: string,
   name: string,
   sql: string,
   tags: string[],
   result: string | null = null
): boolean {
   const existing = db!.prepare("SELECT id FROM saved_queries WHERE id = ?")
   existing.bind([id])
   const found = rowToValue<{ id: string }>(existing) !== null
   if (!found) {
      return false
   }
   const now = new Date().toISOString()
   db!.run(
      "UPDATE saved_queries SET name = ?, sql_text = ?, tags = ?, result = ?, updated_at = ? WHERE id = ?",
      [name, sql, JSON.stringify(tags), result, now, id]
   )
   persist()
   return true
}

export function deleteSavedQuery(id: string): void {
   db!.run("DELETE FROM saved_queries WHERE id = ?", [id])
   persist()
}

export interface HistoryRow {
   id: string
   sql_text: string
   environment_id: string | null
   db_type: string
   duration: number
   row_count: number
   status: string
   error_text: string | null
   executed_at: string
   result: string | null
}

export function getHistory(environmentId?: string | null, limit = 50): HistoryRow[] {
   if (environmentId) {
      const stmt = db!.prepare(
         "SELECT * FROM history WHERE environment_id = ? ORDER BY executed_at DESC LIMIT ?"
      )
      stmt.bind([environmentId, limit])
      return rowsToArray<HistoryRow>(stmt)
   }
   const stmt = db!.prepare("SELECT * FROM history ORDER BY executed_at DESC LIMIT ?")
   stmt.bind([limit])
   return rowsToArray<HistoryRow>(stmt)
}

export function addHistoryEntry(
   id: string,
   sql: string,
   environmentId: string | null,
   dbType: string,
   duration: number,
   rowCount: number,
   status: string,
   error: string | null,
   executedAt: string,
   result: string | null = null
): void {
   db!.run(
      "INSERT INTO history (id, sql_text, environment_id, db_type, duration, row_count, status, error_text, executed_at, result) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, sql, environmentId, dbType, duration, rowCount, status, error, executedAt, result]
   )
   persist()
}

export function deleteHistoryEntry(id: string): void {
   db!.run("DELETE FROM history WHERE id = ?", [id])
   persist()
}

export function clearHistory(): void {
   db!.run("DELETE FROM history")
   persist()
}

export async function closeDatabase(): Promise<void> {
   if (db) {
      persist()
      db.close()
      db = null
   }
}
