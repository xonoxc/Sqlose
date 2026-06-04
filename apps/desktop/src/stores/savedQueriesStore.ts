import { create } from "zustand"
import { ok, err, type Result } from "neverthrow"
import { AppError } from "@sqlose/shared"
import type { SavedQuery } from "~/lib/types"

interface SavedQueriesStore {
   queries: SavedQuery[]

   loadQueries: (environmentId?: string | null) => Promise<void>
   saveQuery: (
      name: string,
      sql: string,
      tags?: string[],
      environmentId?: string | null
   ) => Promise<Result<SavedQuery, AppError>>
   updateQuery: (
      id: string,
      updates: Partial<Pick<SavedQuery, "name" | "sql" | "tags">>
   ) => Promise<Result<SavedQuery, AppError>>
   deleteQuery: (id: string) => Promise<Result<void, AppError>>
   getQuery: (id: string) => SavedQuery | undefined
   getQueriesByTag: (tag: string) => SavedQuery[]
}

function createSavedQuery(
   name: string,
   sql: string,
   tags: string[] = [],
   environmentId: string | null = null
): SavedQuery {
   const id = `sq-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
   const now = new Date().toISOString()
   return { id, name, sql, tags, environmentId, createdAt: now, updatedAt: now }
}

export const useSavedQueriesStore = create<SavedQueriesStore>()((set, get) => ({
   queries: [],

   loadQueries: async (environmentId?: string | null) => {
      const result = await window.sqlose.db.getSavedQueries(environmentId ?? undefined)
      if (result.success) {
         set({ queries: result.data })
      }
   },

   saveQuery: async (name, sql, tags = [], environmentId = null) => {
      const q = createSavedQuery(name, sql, tags, environmentId)
      const result = await window.sqlose.db.saveQuery(q.id, q.name, q.sql, q.tags, q.environmentId)
      if (!result.success) {
         return err(new AppError("db:error", result.error))
      }
      set(state => ({
         queries: [...state.queries, q],
      }))
      return ok(q)
   },

   updateQuery: async (id, updates) => {
      const state = get()
      const idx = state.queries.findIndex(q => q.id === id)
      if (idx === -1) {
         return err(new AppError("env:not_found", `Saved query ${id} not found`))
      }
      const current = state.queries[idx]
      const name = updates.name ?? current.name
      const sql = updates.sql ?? current.sql
      const tags = updates.tags ?? current.tags
      const result = await window.sqlose.db.updateQuery(id, name, sql, tags)
      if (!result.success) {
         return err(new AppError("db:error", "Failed to update query"))
      }
      const updated = { ...current, name, sql, tags, updatedAt: new Date().toISOString() }
      set(state => {
         const queries = [...state.queries]
         queries[idx] = updated
         return { queries }
      })
      return ok(updated)
   },

   deleteQuery: async id => {
      const result = await window.sqlose.db.deleteQuery(id)
      if (!result.success) {
         return err(new AppError("db:error", result.error))
      }
      set(state => ({
         queries: state.queries.filter(q => q.id !== id),
      }))
      return ok(undefined)
   },

   getQuery: id => {
      return get().queries.find(q => q.id === id)
   },

   getQueriesByTag: tag => {
      return get().queries.filter(q => q.tags.includes(tag))
   },
}))
