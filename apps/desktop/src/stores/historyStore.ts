import { create } from "zustand"
import { ok, type Result } from "neverthrow"
import { AppError } from "@sqlose/shared"
import type { HistoryEntry } from "../lib/types"

interface HistoryStore {
   entries: HistoryEntry[]

   loadHistory: (environmentId?: string | null) => Promise<void>
   addEntry: (
      sql: string,
      environmentId: string | null,
      dbType: string,
      duration: number,
      rowCount: number,
      status: "success" | "error",
      error: string | null
   ) => Promise<Result<HistoryEntry, AppError>>
   clearHistory: () => Promise<Result<void, AppError>>
   removeEntry: (id: string) => Promise<Result<void, AppError>>
   getRecent: (limit?: number) => HistoryEntry[]
}

function createHistoryEntry(
   sql: string,
   environmentId: string | null,
   dbType: string,
   duration: number,
   rowCount: number,
   status: "success" | "error",
   error: string | null
): HistoryEntry {
   const id = `hist-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
   return {
      id,
      sql,
      environmentId,
      dbType,
      duration,
      rowCount,
      status,
      error,
      executedAt: new Date().toISOString(),
   }
}

export const useHistoryStore = create<HistoryStore>()((set, get) => ({
   entries: [],

   loadHistory: async (environmentId?: string | null) => {
      const result = await window.sqlose.db.getHistory(environmentId ?? undefined, 200)
      if (result.success) {
         set({ entries: result.data })
      }
   },

   addEntry: async (sql, environmentId, dbType, duration, rowCount, status, error) => {
      const entry = createHistoryEntry(sql, environmentId, dbType, duration, rowCount, status, error)
      const result = await window.sqlose.db.addHistoryEntry(
         entry.id,
         entry.sql,
         entry.environmentId,
         entry.dbType,
         entry.duration,
         entry.rowCount,
         entry.status,
         entry.error,
         entry.executedAt
      )
      if (!result.success) {
         return ok(entry)
      }
      set(state => ({
         entries: [entry, ...state.entries].slice(0, 200),
      }))
      return ok(entry)
   },

   clearHistory: async () => {
      const result = await window.sqlose.db.clearHistory()
      if (!result.success) {
         return ok(undefined)
      }
      set({ entries: [] })
      return ok(undefined)
   },

   removeEntry: async (id: string) => {
      const result = await window.sqlose.db.deleteHistoryEntry(id)
      if (!result.success) {
         return ok(undefined)
      }
      set(state => ({
         entries: state.entries.filter(e => e.id !== id),
      }))
      return ok(undefined)
   },

   getRecent: (limit = 20) => {
      return get().entries.slice(0, limit)
   },
}))
