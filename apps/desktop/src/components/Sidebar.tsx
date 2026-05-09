import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import { cn, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@sqlose/ui"
import { IconChevronRight, IconDatabase, IconTable, IconRefresh, IconKey, IconSearch } from "@tabler/icons-react"
import type { Environment, DBType } from "@sqlose/shared"
import { useEnvironmentStore } from "../stores/environmentStore"
import { useEditorStore } from "../stores/editorStore"
import { listTables, getTableColumns, type ColumnInfo } from "../lib/schema"

interface AppSidebarProps {
   onSettingsOpen: () => void
   onClose: () => void
}

interface TableCache {
   [tableName: string]: ColumnInfo[]
}

export function AppSidebar({ onSettingsOpen, onClose }: AppSidebarProps) {
   const environments = useEnvironmentStore((s) => s.environments)
   const selectedEnvironmentId = useEnvironmentStore((s) => s.selectedEnvironmentId)
   const selectEnvironment = useEnvironmentStore((s) => s.selectEnvironment)
   const setSelectedEnvironment = useEditorStore((s) => s.setSelectedEnvironment)

   const [search, setSearch] = useState("")
   const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set())
   const [tableColumns, setTableColumns] = useState<TableCache>({})
   const [schemaLoading, setSchemaLoading] = useState(false)
   const [schemaError, setSchemaError] = useState<string | null>(null)
   const [loadingColumns, setLoadingColumns] = useState<Set<string>>(new Set())
   const [activeTableId, setActiveTableId] = useState<string | null>(null)

   const selectedEnv = selectedEnvironmentId
      ? environments.find((e: Environment) => e.id === selectedEnvironmentId) ?? null
      : null
   const [tables, setTables] = useState<string[]>([])

   const fetchAbortRef = useRef(false)

   useEffect(() => {
      if (!selectedEnvironmentId || !selectedEnv) {
         setTables([])
         setTableColumns({})
         setExpandedTables(new Set())
         setSchemaError(null)
         return
      }

      let cancelled = false
      fetchAbortRef.current = false

      const fetchTables = async () => {
         setSchemaLoading(true)
         setSchemaError(null)
         try {
            const result = await listTables(selectedEnvironmentId, selectedEnv.dbType as DBType)
            if (!cancelled) {
               setTables(result)
               setSchemaLoading(false)
            }
         } catch (err) {
            if (!cancelled) {
               setSchemaError(err instanceof Error ? err.message : "Failed to load tables")
               setSchemaLoading(false)
            }
         }
      }

      fetchTables()
      return () => { cancelled = true; fetchAbortRef.current = true }
   }, [selectedEnvironmentId, selectedEnv?.dbType])

   const filteredTables = useMemo(() => {
      if (!search) return tables
      const q = search.toLowerCase()
      return tables.filter(t => t.toLowerCase().includes(q))
   }, [tables, search])

   const handleSelect = useCallback(
      (id: string) => {
         selectEnvironment(id)
         setSelectedEnvironment(id)
      },
      [selectEnvironment, setSelectedEnvironment],
   )

   const toggleTable = useCallback(async (tableName: string) => {
      if (!selectedEnvironmentId || !selectedEnv) return

      setActiveTableId(tableName)

      if (expandedTables.has(tableName)) {
         setExpandedTables(prev => {
            const next = new Set(prev)
            next.delete(tableName)
            return next
         })
         return
      }

      if (tableColumns[tableName]) {
         setExpandedTables(prev => new Set(prev).add(tableName))
         return
      }

      setLoadingColumns(prev => new Set(prev).add(tableName))
      try {
         const columns = await getTableColumns(selectedEnvironmentId, tableName, selectedEnv.dbType as DBType)
         setTableColumns(prev => ({ ...prev, [tableName]: columns }))
         setExpandedTables(prev => new Set(prev).add(tableName))
      } catch {
         setTableColumns(prev => ({ ...prev, [tableName]: [] }))
         setExpandedTables(prev => new Set(prev).add(tableName))
      } finally {
         setLoadingColumns(prev => {
            const next = new Set(prev)
            next.delete(tableName)
            return next
         })
      }
   }, [selectedEnvironmentId, selectedEnv, expandedTables, tableColumns])

   const handleRefresh = useCallback(async () => {
      if (!selectedEnvironmentId || !selectedEnv) return
      setTableColumns({})
      setExpandedTables(new Set())
      setSchemaLoading(true)
      setSchemaError(null)
      try {
         const result = await listTables(selectedEnvironmentId, selectedEnv.dbType as DBType)
         setTables(result)
      } catch (err) {
         setSchemaError(err instanceof Error ? err.message : "Failed to load tables")
      } finally {
         setSchemaLoading(false)
      }
   }, [selectedEnvironmentId, selectedEnv])

   return (
      <div className="flex h-full flex-col bg-[#111111] text-text-secondary w-full">
         {/* Header: DB Selector + Settings */}
         <div className="flex items-center justify-between w-full app-no-drag gap-1 px-2 pt-2 pb-1 shrink-0 app-drag-region">
            <Select
               value={selectedEnvironmentId ?? ""}
               onValueChange={handleSelect}
            >
               <SelectTrigger className="w-full bg-transparent border-transparent shadow-none hover:bg-[#161616] focus:ring-0 px-2 h-9 transition-colors truncate">
                  <div className="flex items-center gap-2 truncate">
                     <div className="h-6 w-6 rounded bg-[#222] border border-[#333] flex items-center justify-center text-accent shrink-0">
                        <IconDatabase className="h-3.5 w-3.5" />
                     </div>
                     <SelectValue placeholder="Select Database" />
                  </div>
               </SelectTrigger>
               <SelectContent className="border-[#333] min-w-[200px]">
                  {environments.map((env: Environment) => (
                     <SelectItem key={env.id} value={env.id}>
                        {env.name || `${env.dbType} ${env.port}`}
                     </SelectItem>
                  ))}
               </SelectContent>
            </Select>
            <div className="flex items-center shrink-0">
               <button onClick={onSettingsOpen} className="h-7 w-7 rounded flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-[#161616] transition-colors" aria-label="Settings">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80"><circle cx="12" cy="12" r="10"/><path d="m11.5 15.5 3-3-3-3"/><path d="M7.5 15.5 11 12l-3.5-3.5"/></svg>
               </button>
               <button onClick={onClose} className="h-7 w-7 rounded flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-[#161616] transition-colors" aria-label="Collapse sidebar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
               </button>
            </div>
         </div>

         {/* Schema Section */}
         <div className="flex-1 flex flex-col min-h-0 mt-1">
            {/* Schema Header */}
            <div className="flex items-center justify-between px-4 py-1.5">
               <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="3" x2="21" y1="15" y2="15"/><line x1="9" x2="9" y1="9" y2="21"/><line x1="15" x2="15" y1="9" y2="21"/></svg>
                  <span className="text-[11px] font-semibold tracking-wide text-text-muted uppercase">Tables</span>
               </div>
               <button
                  onClick={handleRefresh}
                  disabled={schemaLoading}
                  className="h-6 w-6 rounded flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-[#1a1a1a] transition-colors disabled:opacity-40"
                  aria-label="Refresh tables"
               >
                  <IconRefresh className={cn("h-3.5 w-3.5", schemaLoading && "animate-spin")} />
               </button>
            </div>

            {/* Search */}
            <div className="px-3 pb-1.5">
               <div className="flex items-center gap-2 bg-[#161616] rounded border border-[#1e1e1e] px-2.5 py-1.5">
                  <IconSearch className="h-3.5 w-3.5 text-text-muted shrink-0" />
                  <input
                     type="text"
                     value={search}
                     onChange={e => setSearch(e.target.value)}
                     placeholder="Filter tables..."
                     className="flex-1 bg-transparent text-[12px] text-text-primary outline-none placeholder:text-text-muted/50"
                  />
               </div>
            </div>

            {/* Table List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-1.5 pb-2">
               {/* Loading State */}
               {schemaLoading && tables.length === 0 && (
                  <div className="flex items-center justify-center py-8">
                     <div className="flex flex-col items-center gap-2">
                        <div className="h-4 w-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                        <span className="text-[11px] text-text-muted">Loading tables...</span>
                     </div>
                  </div>
               )}

               {/* Error State */}
               {schemaError && !schemaLoading && (
                  <div className="mx-2 mt-2 p-3 rounded bg-error/5 border border-error/20">
                     <p className="text-[11px] text-error font-medium mb-1">Failed to load schema</p>
                     <p className="text-[10px] text-text-muted leading-relaxed">{schemaError}</p>
                  </div>
               )}

               {/* Empty State */}
               {!schemaLoading && !schemaError && tables.length === 0 && selectedEnvironmentId && (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                     <IconTable className="h-8 w-8 text-text-muted/40 mb-2" />
                     <span className="text-[12px] text-text-muted">No tables found</span>
                     <span className="text-[10px] text-text-muted/60 mt-1">Run a query or import data</span>
                  </div>
               )}

               {/* No Results for Search */}
               {!schemaLoading && filteredTables.length === 0 && tables.length > 0 && (
                  <div className="flex items-center justify-center py-8">
                     <span className="text-[12px] text-text-muted">No matching tables</span>
                  </div>
               )}

               {/* Table Tree */}
               {filteredTables.map((tableName) => (
                  <div key={tableName}>
                     <button
                        onClick={() => toggleTable(tableName)}
                        className={cn(
                           "flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors outline-none",
                           activeTableId === tableName
                              ? "bg-bg-quaternary/50 text-accent"
                              : "text-text-secondary hover:text-text-primary hover:bg-bg-quaternary/30",
                        )}
                     >
                        <IconChevronRight
                           className={cn(
                              "h-3 w-3 shrink-0 transition-transform text-text-muted",
                              expandedTables.has(tableName) && "rotate-90",
                           )}
                        />
                        <IconTable className="h-3.5 w-3.5 shrink-0 opacity-70" />
                        <span className="truncate flex-1 text-left">{tableName}</span>
                        {tableColumns[tableName] && (
                           <span className="text-[10px] text-text-muted font-mono">{tableColumns[tableName].length}</span>
                        )}
                        {loadingColumns.has(tableName) && (
                           <div className="h-3 w-3 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                        )}
                     </button>

                     {/* Expanded Columns */}
                     {expandedTables.has(tableName) && tableColumns[tableName] && (
                        <div className="ml-4 border-l border-[#1e1e1e] ml-5">
                           {tableColumns[tableName].length === 0 && !loadingColumns.has(tableName) && (
                              <div className="py-2 px-4 text-[10px] text-text-muted italic">No columns</div>
                           )}
                           {tableColumns[tableName].map((col) => (
                              <div
                                 key={col.name}
                                 className="flex items-center gap-2 px-4 py-1 hover:bg-bg-quaternary/20 transition-colors group"
                              >
                                 {col.primaryKey ? (
                                    <IconKey className="h-2.5 w-2.5 shrink-0 text-warning" />
                                 ) : (
                                    <div className="h-2 w-2 shrink-0 rounded-[2px] bg-accent/40" />
                                 )}
                                 <span className="text-[11px] font-mono text-text-primary truncate">{col.name}</span>
                                 <span className="text-[10px] font-mono text-text-muted truncate ml-auto">{col.type}</span>
                                 <span className={cn(
                                    "text-[9px] font-mono px-1 rounded shrink-0",
                                    col.nullable ? "text-text-muted/60" : "text-error/70",
                                 )}>
                                    {col.nullable ? "NULL" : "NN"}
                                 </span>
                              </div>
                           ))}
                        </div>
                     )}

                     {/* Loading Columns */}
                     {expandedTables.has(tableName) && loadingColumns.has(tableName) && (
                        <div className="flex items-center gap-2 px-6 py-2">
                           <div className="h-3 w-3 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                           <span className="text-[10px] text-text-muted">Loading columns...</span>
                        </div>
                     )}
                  </div>
               ))}
            </div>
         </div>
      </div>
   )
}
