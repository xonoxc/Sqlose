import { create } from "zustand"
import { ok, err, type Result } from "neverthrow"
import { AppError } from "@sqlose/shared"
import type { QueryResult } from "@sqlose/shared"
import type { SavedQuery } from "~/lib/types"

interface SavedQueriesStore {
   queries: SavedQuery[]

   loadQueries: (environmentId?: string | null) => Promise<void>
   saveQuery: (
      name: string,
      sql: string,
      tags?: string[],
      environmentId?: string | null,
      result?: QueryResult | null
   ) => Promise<Result<SavedQuery, AppError>>
   updateQuery: (
      id: string,
      updates: Partial<Pick<SavedQuery, "name" | "sql" | "tags" | "result">>
   ) => Promise<Result<SavedQuery, AppError>>
   deleteQuery: (id: string) => Promise<Result<void, AppError>>
   getQuery: (id: string) => SavedQuery | undefined
   getQueriesByTag: (tag: string) => SavedQuery[]
}

function createSavedQuery(
   name: string,
   sql: string,
   tags: string[] = [],
   environmentId: string | null = null,
   result: QueryResult | null = null
): SavedQuery {
   const id = `sq-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
   const now = new Date().toISOString()
   return { id, name, sql, tags, environmentId, createdAt: now, updatedAt: now, result }
}

export const useSavedQueriesStore = create<SavedQueriesStore>()((set, get) => ({
   queries: [],

   loadQueries: async (environmentId?: string | null) => {
      const result = await window.sqlose.db.getSavedQueries(environmentId ?? undefined)
      if (result.success) {
         set({ queries: result.data })
      }
   },

   saveQuery: async (name, sql, tags = [], environmentId = null, result = null) => {
      const state = get()
      const existing = state.queries.find(
         q => q.name === name && q.environmentId === environmentId
      )
      if (existing) {
         return get().updateQuery(existing.id, { name, sql, tags, result })
      }
      const q = createSavedQuery(name, sql, tags, environmentId, result)
      const dbResult = await window.sqlose.db.saveQuery(
         q.id,
         q.name,
         q.sql,
         q.tags,
         q.environmentId,
         JSON.stringify(q.result)
      )
      if (!dbResult.success) {
         return err(new AppError("db:error", dbResult.error))
      }
      set(s => ({
         queries: [...s.queries, q],
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
      const result = updates.result !== undefined ? updates.result : current.result
      const dbResult = await window.sqlose.db.updateQuery(
         id,
         name,
         sql,
         tags,
         result ? JSON.stringify(result) : null
      )
      if (!dbResult.success) {
         return err(new AppError("db:error", "Failed to update query"))
      }
      const updated = { ...current, name, sql, tags, result, updatedAt: new Date().toISOString() }
      set(s => {
         const queries = [...s.queries]
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
