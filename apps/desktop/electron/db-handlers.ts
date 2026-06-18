import { ipcMain } from "electron"
import { attemptSync } from "@sqlose/shared"
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

type HandlerResult<T> = { success: true; data: T } | { success: false; error: string }

function ok<T>(data: T): HandlerResult<T> {
   return { success: true, data }
}

function err(msg: string): HandlerResult<never> {
   return { success: false, error: msg }
}

export function registerDbHandlers(): void {
   ipcMain.handle("db:get", (_event, key: string): HandlerResult<string | null> => {
      const result = attemptSync(() => storeGet(key))
      if (result.isOk()) return ok(result.value ?? null)
      return err(String(result.error))
   })

   ipcMain.handle("db:set", (_event, key: string, value: string): HandlerResult<void> => {
      const result = attemptSync(() => storeSet(key, value))
      if (result.isOk()) return ok(undefined)
      return err(String(result.error))
   })

   ipcMain.handle("db:delete", (_event, key: string): HandlerResult<void> => {
      const result = attemptSync(() => storeDelete(key))
      if (result.isOk()) return ok(undefined)
      return err(String(result.error))
   })

   ipcMain.handle(
      "db:get-saved-queries",
      (_event, environmentId?: string | null): HandlerResult<SavedQuery[]> => {
         const result = attemptSync(() => {
            const rows = getSavedQueries(environmentId)
            return rows.map(r => ({
               id: r.id,
               name: r.name,
               sql: r.sql_text,
               tags: JSON.parse(r.tags),
               environmentId: r.environment_id,
               createdAt: r.created_at,
               updatedAt: r.updated_at,
               result: r.result ? JSON.parse(r.result) : null,
            }))
         })
         if (result.isOk()) return ok(result.value)
         return err(String(result.error))
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
         environmentId: string | null,
         result: string | null
      ): HandlerResult<void> => {
         const r = attemptSync(() => saveQuery(id, name, sql, tags, environmentId, result))
         if (r.isOk()) return ok(undefined)
         return err(String(r.error))
      }
   )

   ipcMain.handle(
      "db:update-query",
      (
         _event,
         id: string,
         name: string,
         sql: string,
         tags: string[],
         result: string | null
      ): HandlerResult<boolean> => {
         const r = attemptSync(() => updateSavedQuery(id, name, sql, tags, result))
         if (r.isOk()) return ok(r.value)
         return err(String(r.error))
      }
   )

   ipcMain.handle("db:delete-query", (_event, id: string): HandlerResult<void> => {
      const result = attemptSync(() => deleteSavedQuery(id))
      if (result.isOk()) return ok(undefined)
      return err(String(result.error))
   })

   ipcMain.handle(
      "db:get-history",
      (_event, environmentId?: string | null, limit?: number): HandlerResult<HistoryEntry[]> => {
         const result = attemptSync(() => {
            const rows = getHistory(environmentId, limit)
            return rows.map(r => ({
               id: r.id,
               sql: r.sql_text,
               environmentId: r.environment_id,
               dbType: r.db_type,
               duration: r.duration,
               rowCount: r.row_count,
               status: r.status as "success" | "error",
               error: r.error_text,
               executedAt: r.executed_at,
               result: r.result ? JSON.parse(r.result) : null,
            }))
         })
         if (result.isOk()) return ok(result.value)
         return err(String(result.error))
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
         executedAt: string,
         result: string | null
      ): HandlerResult<void> => {
         const r = attemptSync(() =>
            addHistoryEntry(
               id,
               sql,
               environmentId,
               dbType,
               duration,
               rowCount,
               status,
               error,
               executedAt,
               result
            )
         )
         if (r.isOk()) return ok(undefined)
         return err(String(r.error))
      }
   )

   ipcMain.handle("db:delete-history-entry", (_event, id: string): HandlerResult<void> => {
      const result = attemptSync(() => deleteHistoryEntry(id))
      if (result.isOk()) return ok(undefined)
      return err(String(result.error))
   })

   ipcMain.handle("db:clear-history", (_event): HandlerResult<void> => {
      const result = attemptSync(() => clearHistory())
      if (result.isOk()) return ok(undefined)
      return err(String(result.error))
   })
}
