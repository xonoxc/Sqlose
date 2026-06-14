import { create } from "zustand"
import { attempt } from "@sqlose/shared"
import { listTables, getTableColumns, type ColumnInfo } from "~/lib/schema"
import { api } from "~/lib/api"
import type { DBType } from "@sqlose/shared"

export interface TableDataState {
   columns: string[]
   rows: Record<string, unknown>[]
   totalCount: number
   page: number
   pageSize: number
}

interface DatabaseStore {
   tables: Record<string, string[]>
   tableColumns: Record<string, Record<string, ColumnInfo[]>>
   schemaLoading: Record<string, boolean>
   schemaError: Record<string, string | null>
   loadingColumnIds: Record<string, string[]>

   expandedTableIds: Record<string, string[]>
   activeTableId: Record<string, string | null>
   keyboardFocusedIndex: Record<string, number>

   tableData: Record<string, TableDataState | null>
   tableDataLoading: Record<string, boolean>
   tableDataError: Record<string, string | null>

   setExpanded: (envId: string, tableId: string) => void
   setActiveTable: (envId: string, tableId: string | null) => void
   setKeyboardFocusedIndex: (envId: string, index: number) => void
   fetchTables: (envId: string, dbType: DBType) => Promise<void>
   fetchColumns: (envId: string, tableName: string, dbType: DBType) => Promise<void>
   fetchTableData: (
      envId: string,
      tableName: string,
      page?: number,
      pageSize?: number
   ) => Promise<void>
   refreshTableData: (envId: string, tableName: string) => Promise<void>
   reset: (envId: string) => void
}

export const useDatabaseStore = create<DatabaseStore>()((set, get) => ({
   tables: {},
   tableColumns: {},
   schemaLoading: {},
   schemaError: {},
   loadingColumnIds: {},

   expandedTableIds: {},
   activeTableId: {},
   keyboardFocusedIndex: {},

   tableData: {},
   tableDataLoading: {},
   tableDataError: {},

   setExpanded: (envId: string, tableId: string) => {
      const state = get()
      const current = state.expandedTableIds[envId] ?? []
      const isExpanded = current.includes(tableId)
      set({
         expandedTableIds: {
            ...state.expandedTableIds,
            [envId]: isExpanded
               ? current.filter(id => id !== tableId)
               : [...current, tableId],
         },
      })
   },

   setActiveTable: (envId: string, tableId: string | null) => {
      set(state => ({
         activeTableId: { ...state.activeTableId, [envId]: tableId },
      }))
   },

   setKeyboardFocusedIndex: (envId: string, index: number) => {
      set(state => ({
         keyboardFocusedIndex: { ...state.keyboardFocusedIndex, [envId]: index },
      }))
   },

   fetchTables: async (envId: string, dbType: DBType) => {
      set(state => ({
         schemaLoading: { ...state.schemaLoading, [envId]: true },
         schemaError: { ...state.schemaError, [envId]: null },
      }))
      const result = await attempt(listTables(envId, dbType))
      result.match(
         tables =>
            set(state => ({
               tables: { ...state.tables, [envId]: tables },
               schemaLoading: { ...state.schemaLoading, [envId]: false },
            })),
         err =>
            set(state => ({
               schemaError: { ...state.schemaError, [envId]: err.message },
               schemaLoading: { ...state.schemaLoading, [envId]: false },
            }))
      )
   },

   fetchColumns: async (envId: string, tableName: string, dbType: DBType) => {
      const state = get()
      const envColumns = state.tableColumns[envId] ?? {}
      if (envColumns[tableName]) return

      set(state => ({
         loadingColumnIds: {
            ...state.loadingColumnIds,
            [envId]: [...(state.loadingColumnIds[envId] ?? []), tableName],
         },
      }))
      const result = await attempt(getTableColumns(envId, tableName, dbType))
      result.match(
         columns =>
            set(state => ({
               tableColumns: {
                  ...state.tableColumns,
                  [envId]: {
                     ...(state.tableColumns[envId] ?? {}),
                     [tableName]: columns,
                  },
               },
               loadingColumnIds: {
                  ...state.loadingColumnIds,
                  [envId]: (state.loadingColumnIds[envId] ?? []).filter(id => id !== tableName),
               },
            })),
         () =>
            set(state => ({
               tableColumns: {
                  ...state.tableColumns,
                  [envId]: {
                     ...(state.tableColumns[envId] ?? {}),
                     [tableName]: [],
                  },
               },
               loadingColumnIds: {
                  ...state.loadingColumnIds,
                  [envId]: (state.loadingColumnIds[envId] ?? []).filter(id => id !== tableName),
               },
            }))
      )
   },

   fetchTableData: async (envId: string, tableName: string, page = 1, pageSize = 100) => {
      set(state => ({
         tableDataLoading: { ...state.tableDataLoading, [envId]: true },
         tableDataError: { ...state.tableDataError, [envId]: null },
      }))
      const offset = (page - 1) * pageSize
      const safeName = tableName.replace(/[^a-zA-Z0-9_.]/g, "")
      if (safeName !== tableName) {
         set(state => ({
            tableDataError: { ...state.tableDataError, [envId]: "Invalid table name" },
            tableDataLoading: { ...state.tableDataLoading, [envId]: false },
         }))
         return
      }

      const countSql = `SELECT COUNT(*) as total FROM ${safeName}`
      const countResult = await api.query.execute(envId, countSql)
      let totalCount = 0
      if (countResult.isOk()) {
         totalCount = Number(countResult.value.rows[0]?.total ?? 0)
      }

      const dataSql = `SELECT * FROM ${safeName} LIMIT ${pageSize} OFFSET ${offset}`
      const dataResult = await api.query.execute(envId, dataSql)

      dataResult.match(
         qr => {
            set(state => ({
               tableData: {
                  ...state.tableData,
                  [envId]: {
                     columns: qr.columns,
                     rows: qr.rows as Record<string, unknown>[],
                     totalCount,
                     page,
                     pageSize,
                  },
               },
               tableDataLoading: { ...state.tableDataLoading, [envId]: false },
            }))
         },
         err => {
            set(state => ({
               tableDataError: { ...state.tableDataError, [envId]: err.message },
               tableDataLoading: { ...state.tableDataLoading, [envId]: false },
            }))
         }
      )
   },

   refreshTableData: async (envId: string, tableName: string) => {
      const state = get()
      const currentPage = state.tableData[envId]?.page ?? 1
      const pageSize = state.tableData[envId]?.pageSize ?? 100
      await get().fetchTableData(envId, tableName, currentPage, pageSize)
   },

   reset: (envId: string) => {
      set(state => ({
         tables: { ...state.tables, [envId]: [] },
         tableColumns: { ...state.tableColumns, [envId]: {} },
         schemaLoading: { ...state.schemaLoading, [envId]: false },
         schemaError: { ...state.schemaError, [envId]: null },
         loadingColumnIds: { ...state.loadingColumnIds, [envId]: [] },
         expandedTableIds: { ...state.expandedTableIds, [envId]: [] },
         activeTableId: { ...state.activeTableId, [envId]: null },
         keyboardFocusedIndex: { ...state.keyboardFocusedIndex, [envId]: -1 },
         tableData: { ...state.tableData, [envId]: null },
         tableDataLoading: { ...state.tableDataLoading, [envId]: false },
         tableDataError: { ...state.tableDataError, [envId]: null },
      }))
   },
}))
