import { ipcMain } from "electron"
import { attemptSync, safeParseJSON } from "@sqlose/shared"
import { executeQueryForDB, destroyPool } from "@sqlose/core"
import { storeGet, storeSet } from "./db"
import type { DBType, QueryResult } from "@sqlose/shared"

type HandlerResult<T> = { success: true; data: T } | { success: false; error: string }

function ok<T>(data: T): HandlerResult<T> {
   return { success: true, data }
}

function fail(msg: string): HandlerResult<never> {
   return { success: false, error: msg }
}

const CONNECTIONS_KEY = "dbclient:connections"

export interface DbClientConnection {
   id: string
   name: string
   dbType: DBType
   connectionString: string
   createdAt: string
   lastConnectedAt: string | null
   color: string
}

function loadConnections(): DbClientConnection[] {
   const result = attemptSync(() => storeGet(CONNECTIONS_KEY))
   if (result.isErr() || !result.value) {
      return []
   }

   const parsed = safeParseJSON<DbClientConnection[]>(result.value)
   if (parsed.isErr()) {
      return []
   }

   return parsed.value ?? []
}

function saveConnections(connections: DbClientConnection[]): void {
   attemptSync(() => storeSet(CONNECTIONS_KEY, JSON.stringify(connections)))
}

export function registerDbClientHandlers(): void {
   // ── List saved connections ─────────────────────────────────────────────
   ipcMain.handle("dbclient:list", (): HandlerResult<DbClientConnection[]> => {
      return ok(loadConnections())
   })

   // ── Save / upsert a connection ─────────────────────────────────────────
   ipcMain.handle(
      "dbclient:save",
      (
         _event,
         conn: Omit<DbClientConnection, "createdAt" | "lastConnectedAt">
      ): HandlerResult<DbClientConnection> => {
         const connections = loadConnections()
         const existing = connections.findIndex(c => c.id === conn.id)
         const now = new Date().toISOString()

         let saved: DbClientConnection
         if (existing !== -1) {
            saved = { ...connections[existing], ...conn }
            connections[existing] = saved
         } else {
            saved = {
               ...conn,
               createdAt: now,
               lastConnectedAt: null,
            }
            connections.push(saved)
         }

         saveConnections(connections)
         return ok(saved)
      }
   )

   // ── Delete a connection ────────────────────────────────────────────────
   ipcMain.handle("dbclient:delete", (_event, id: string): HandlerResult<void> => {
      const connections = loadConnections().filter(c => c.id !== id)
      saveConnections(connections)
      // Clean up connection pool
      const deleted = loadConnections().find(c => c.id === id)
      if (deleted) {
         destroyPool(deleted.connectionString).catch(() => {})
      }
      return ok(undefined)
   })

   // ── Test a connection ──────────────────────────────────────────────────
   ipcMain.handle(
      "dbclient:test",
      async (
         _event,
         payload: { dbType: DBType; connectionString: string }
      ): Promise<HandlerResult<{ latencyMs: number }>> => {
         const start = Date.now()

         // Simple connectivity check — just run a trivial query
         const testSql =
            payload.dbType === "sqlite"
               ? "SELECT 1"
               : payload.dbType === "postgres"
                 ? "SELECT 1"
                 : "SELECT 1"

         const result = await executeQueryForDB(payload.dbType, payload.connectionString, testSql)

         if (result.isErr()) {
            return fail(result.error.message)
         }

         // Update lastConnectedAt for saved connections
         const connections = loadConnections()
         const idx = connections.findIndex(c => c.connectionString === payload.connectionString)
         if (idx !== -1) {
            connections[idx].lastConnectedAt = new Date().toISOString()
            saveConnections(connections)
         }

         return ok({ latencyMs: Date.now() - start })
      }
   )

   // ── Execute a query ────────────────────────────────────────────────────
   ipcMain.handle(
      "dbclient:execute",
      async (
         _event,
         payload: { connectionId: string; sql: string }
      ): Promise<HandlerResult<QueryResult>> => {
         const connections = loadConnections()
         const conn = connections.find(c => c.id === payload.connectionId)
         if (!conn) {
            return fail(`Connection ${payload.connectionId} not found`)
         }

         // Update lastConnectedAt
         conn.lastConnectedAt = new Date().toISOString()
         saveConnections(connections)

         const result = await executeQueryForDB(conn.dbType, conn.connectionString, payload.sql)
         if (result.isErr()) {
            return fail(result.error.message)
         }

         const MAX_ROWS = 10_000
         const qr = result.value
         if (qr.rows.length > MAX_ROWS) {
            qr.rows = qr.rows.slice(0, MAX_ROWS)
            qr.rowCount = MAX_ROWS
            qr.truncated = true
         }

         return ok(qr)
      }
   )

   // ── Get schema / tables info ───────────────────────────────────────────
   ipcMain.handle(
      "dbclient:schema",
      async (
         _event,
         payload: { connectionId: string }
      ): Promise<HandlerResult<{ tables: string[] }>> => {
         const connections = loadConnections()
         const conn = connections.find(c => c.id === payload.connectionId)
         if (!conn) {
            return fail(`Connection ${payload.connectionId} not found`)
         }

         let sql: string
         if (conn.dbType === "sqlite") {
            sql =
               "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
         } else if (conn.dbType === "postgres") {
            sql =
               "SELECT table_name as name FROM information_schema.tables WHERE table_schema='public' ORDER BY name"
         } else {
            sql = "SHOW TABLES"
         }

         const result = await executeQueryForDB(conn.dbType, conn.connectionString, sql)
         if (result.isErr()) {
            return fail(result.error.message)
         }

         const tables = result.value.rows.map(r => {
            const val = Object.values(r)[0]
            return String(val)
         })

         return ok({ tables })
      }
   )
}
