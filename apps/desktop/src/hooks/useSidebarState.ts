import { useState, useEffect, useRef } from "react"
import type { Environment, DBType } from "@sqlose/shared"
import { useEnvironmentStore } from "~/stores/environmentStore"
import { useEditorStore } from "~/stores/editorStore"
import { useWorkspaceStore } from "~/stores/workspaceStore"
import { useHistoryStore } from "~/stores/historyStore"
import { useSavedQueriesStore } from "~/stores/savedQueriesStore"
import { useDatabaseStore } from "~/stores/databaseStore"

type NavTab = "playground" | "saved" | "history" | null

export function useSidebarState(onOpenTable: (tableName: string) => void) {
   const environments = useEnvironmentStore(s => s.environments)
   const selectedEnvironmentId = useEnvironmentStore(s => s.selectedEnvironmentId)
   const selectEnvironment = useEnvironmentStore(s => s.selectEnvironment)
   const setSelectedEnvironment = useEditorStore(s => s.setSelectedEnvironment)
   const openTab = useWorkspaceStore(s => s.openTab)
   const historyEntries = useHistoryStore(s => s.entries)
   const savedQueries = useSavedQueriesStore(s => s.queries)

   const envSavedQueries = savedQueries.filter(q => q.environmentId === selectedEnvironmentId)
   const envHistoryEntries = historyEntries.filter(h => h.environmentId === selectedEnvironmentId)

   const savedQueryNamesBySql = (() => {
      const map = new Map<string, string>()
      for (const q of envSavedQueries) {
         const key = q.sql.trim()
         if (!map.has(key)) map.set(key, q.name)
      }
      return map
   })()

   const tables = useDatabaseStore(s => s.tables)
   const tableColumns = useDatabaseStore(s => s.tableColumns)
   const schemaLoading = useDatabaseStore(s => s.schemaLoading)
   const schemaError = useDatabaseStore(s => s.schemaError)
   const loadingColumnIds = useDatabaseStore(s => s.loadingColumnIds)
   const expandedTableIds = useDatabaseStore(s => s.expandedTableIds)
   const activeTableId = useDatabaseStore(s => s.activeTableId)
   const keyboardFocusedIndex = useDatabaseStore(s => s.keyboardFocusedIndex)
   const fetchTables = useDatabaseStore(s => s.fetchTables)
   const fetchColumns = useDatabaseStore(s => s.fetchColumns)
   const setExpanded = useDatabaseStore(s => s.setExpanded)
   const setActiveTable = useDatabaseStore(s => s.setActiveTable)
   const setKeyboardFocusedIndex = useDatabaseStore(s => s.setKeyboardFocusedIndex)
   const reset = useDatabaseStore(s => s.reset)

   const [search, setSearch] = useState("")
   const [activeNav, setActiveNav] = useState<NavTab>(null)
   const [tableTreeExpanded, setTableTreeExpanded] = useState(true)

   const tableListRef = useRef<HTMLDivElement>(null)

   const selectedEnv = selectedEnvironmentId
      ? (environments.find((e: Environment) => e.id === selectedEnvironmentId) ?? null)
      : null

   useEffect(() => {
      if (!selectedEnvironmentId || !selectedEnv) {
         reset()
         return
      }
      fetchTables(selectedEnvironmentId, selectedEnv.dbType as DBType)
   }, [selectedEnvironmentId, selectedEnv, fetchTables, reset])

   const filteredTables = !search
      ? tables
      : tables.filter(t => t.toLowerCase().includes(search.toLowerCase()))

   const handleSelect = (id: string) => {
      selectEnvironment(id)
      setSelectedEnvironment(id)
   }

   const handleTableClick = (tableName: string) => {
      setActiveTable(tableName)
      onOpenTable(tableName)
   }

   const handleChevronClick = (e: React.MouseEvent, tableName: string) => {
      e.stopPropagation()
      e.preventDefault()
      if (!selectedEnvironmentId || !selectedEnv) return
      setExpanded(tableName)
      if (!tableColumns[tableName]) {
         fetchColumns(selectedEnvironmentId, tableName, selectedEnv.dbType as DBType)
      }
   }

   const handleRefresh = async () => {
      if (!selectedEnvironmentId || !selectedEnv) return
      reset()
      fetchTables(selectedEnvironmentId, selectedEnv.dbType as DBType)
   }

   const handleNavClick = (tab: NavTab) => {
      setActiveNav(prev => (prev === tab ? null : tab))
   }

   const filteredIndex = activeTableId ? filteredTables.indexOf(activeTableId) : -1

   const handleKeyDown = (e: React.KeyboardEvent) => {
      if (filteredTables.length === 0) return

      let currentIndex =
         keyboardFocusedIndex >= 0 ? keyboardFocusedIndex : filteredIndex >= 0 ? filteredIndex : 0

      switch (e.key) {
         case "ArrowDown":
            e.preventDefault()
            currentIndex = Math.min(currentIndex + 1, filteredTables.length - 1)
            setKeyboardFocusedIndex(currentIndex)
            break
         case "ArrowUp":
            e.preventDefault()
            currentIndex = Math.max(currentIndex - 1, 0)
            setKeyboardFocusedIndex(currentIndex)
            break
         case "Enter": {
            e.preventDefault()
            const table = filteredTables[currentIndex]
            if (table) {
               handleTableClick(table)
            }
            break
         }
         case "ArrowRight": {
            e.preventDefault()
            const table = filteredTables[currentIndex]
            if (table && selectedEnvironmentId && selectedEnv) {
               if (!expandedTableIds.includes(table)) {
                  setExpanded(table)
                  if (!tableColumns[table]) {
                     fetchColumns(selectedEnvironmentId, table, selectedEnv.dbType as DBType)
                  }
               }
            }
            break
         }
         case "ArrowLeft": {
            e.preventDefault()
            const table = filteredTables[currentIndex]
            if (table && expandedTableIds.includes(table)) {
               setExpanded(table)
            }
            break
         }
      }
   }

   const handleTableDoubleClick = (tableName: string) => {
      onOpenTable(tableName)
   }

   return {
      environments,
      selectedEnvironmentId,
      selectedEnv,
      savedQueries: envSavedQueries,
      savedQueryNamesBySql,
      historyEntries: envHistoryEntries,
      tables,
      tableColumns,
      schemaLoading,
      schemaError,
      loadingColumnIds,
      expandedTableIds,
      activeTableId,
      keyboardFocusedIndex,
      filteredTables,
      filteredIndex,
      search,
      setSearch,
      activeNav,
      setActiveNav,
      tableTreeExpanded,
      setTableTreeExpanded,
      tableListRef,
      handleSelect,
      handleTableClick,
      handleChevronClick,
      handleRefresh,
      handleNavClick,
      handleKeyDown,
      handleTableDoubleClick,
      openTab,
   }
}
