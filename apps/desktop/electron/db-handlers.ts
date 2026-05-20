import { ipcMain } from "electron"
import type { SavedQuery, HistoryEntry } from "../src/lib/types"
import {
   storeGet,
   storeSet,
   storeDelete,
   getSavedQueries,
   saveQuery,
   updateSavedQuery,
   deleteSavedQuery,
   getHistory,
   addHistoryEntry,
   deleteHistoryEntry,
   clearHistory,
} from "./db"

type HandlerResult<T> =
   | { success: true; data: T }
   | { success: false; error: string }

function ok<T>(data: T): HandlerResult<T> {
   return { success: true, data }
}

function err(msg: string): HandlerResult<never> {
   return { success: false, error: msg }
}

export function registerDbHandlers(): void {
   ipcMain.handle("db:get", (_event, key: string): HandlerResult<string | null> => {
      try {
         const val = storeGet(key)
         return ok(val ?? null)
      } catch (e) {
         return err(String(e))
      }
   })

   ipcMain.handle(
      "db:set",
      (_event, key: string, value: string): HandlerResult<void> => {
         try {
            storeSet(key, value)
            return ok(undefined)
         } catch (e) {
            return err(String(e))
         }
      }
   )

   ipcMain.handle("db:delete", (_event, key: string): HandlerResult<void> => {
      try {
         storeDelete(key)
         return ok(undefined)
      } catch (e) {
         return err(String(e))
      }
   })

   ipcMain.handle(
      "db:get-saved-queries",
      (_event, environmentId?: string | null): HandlerResult<SavedQuery[]> => {
         try {
            const rows = getSavedQueries(environmentId)
            const queries: SavedQuery[] = rows.map(r => ({
               id: r.id,
               name: r.name,
               sql: r.sql_text,
               tags: JSON.parse(r.tags),
               environmentId: r.environment_id,
               createdAt: r.created_at,
               updatedAt: r.updated_at,
            }))
            return ok(queries)
         } catch (e) {
            return err(String(e))
         }
      }
   )

   ipcMain.handle(
      "db:save-query",
      (
         _event,
         id: string,
         name: string,
         sql: string,
         tags: string[],
         environmentId: string | null
      ): HandlerResult<void> => {
         try {
            saveQuery(id, name, sql, tags, environmentId)
            return ok(undefined)
         } catch (e) {
            return err(String(e))
         }
      }
   )

   ipcMain.handle(
      "db:update-query",
      (
         _event,
         id: string,
         name: string,
         sql: string,
         tags: string[]
      ): HandlerResult<boolean> => {
         try {
            const result = updateSavedQuery(id, name, sql, tags)
            return ok(result)
         } catch (e) {
            return err(String(e))
         }
      }
   )

   ipcMain.handle("db:delete-query", (_event, id: string): HandlerResult<void> => {
      try {
         deleteSavedQuery(id)
         return ok(undefined)
      } catch (e) {
         return err(String(e))
      }
   })

   ipcMain.handle(
      "db:get-history",
      (_event, environmentId?: string | null, limit?: number): HandlerResult<HistoryEntry[]> => {
         try {
            const rows = getHistory(environmentId, limit)
            const entries: HistoryEntry[] = rows.map(r => ({
               id: r.id,
               sql: r.sql_text,
               environmentId: r.environment_id,
               dbType: r.db_type,
               duration: r.duration,
               rowCount: r.row_count,
               status: r.status as "success" | "error",
               error: r.error_text,
               executedAt: r.executed_at,
            }))
            return ok(entries)
         } catch (e) {
            return err(String(e))
         }
      }
   )

   ipcMain.handle(
      "db:add-history-entry",
      (
         _event,
         id: string,
         sql: string,
         environmentId: string | null,
         dbType: string,
         duration: number,
         rowCount: number,
         status: string,
         error: string | null,
         executedAt: string
      ): HandlerResult<void> => {
         try {
            addHistoryEntry(id, sql, environmentId, dbType, duration, rowCount, status, error, executedAt)
            return ok(undefined)
         } catch (e) {
            return err(String(e))
         }
      }
   )

   ipcMain.handle("db:delete-history-entry", (_event, id: string): HandlerResult<void> => {
      try {
         deleteHistoryEntry(id)
         return ok(undefined)
      } catch (e) {
         return err(String(e))
      }
   })

   ipcMain.handle("db:clear-history", (_event): HandlerResult<void> => {
      try {
         clearHistory()
         return ok(undefined)
      } catch (e) {
         return err(String(e))
      }
   })
}
