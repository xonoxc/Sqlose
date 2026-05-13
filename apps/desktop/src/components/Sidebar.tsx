import { useState, useCallback, useMemo, useEffect } from "react"
import { cn, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@sqlose/ui"
import {
   IconChevronRight, IconDatabase, IconTable, IconRefresh, IconKey, IconSearch,
   IconHistory, IconBookmark, IconCode, IconFileCode,
   IconLayoutSidebarLeftCollapse, IconSettings, IconClock, IconStar,
} from "@tabler/icons-react"
import type { Environment, DBType } from "@sqlose/shared"
import { useEnvironmentStore } from "../stores/environmentStore"
import { useEditorStore } from "../stores/editorStore"
import { useWorkspaceStore } from "../stores/workspaceStore"
import { useHistoryStore } from "../stores/historyStore"
import { useSavedQueriesStore } from "../stores/savedQueriesStore"
import { listTables, getTableColumns, type ColumnInfo } from "../lib/schema"

interface AppSidebarProps {
   onSettingsOpen: () => void
   onClose: () => void
   onOpenTable: (tableName: string) => void
   onOpenQuery: (sql: string) => void
   collapsed: boolean
   onToggleCollapse: () => void
}

interface TableCache {
   [tableName: string]: ColumnInfo[]
}

type NavTab = "playground" | "saved" | "history" | null

export function AppSidebar({ onSettingsOpen, onClose, onOpenTable, onOpenQuery, collapsed, onToggleCollapse }: AppSidebarProps) {
   const environments = useEnvironmentStore((s) => s.environments)
   const selectedEnvironmentId = useEnvironmentStore((s) => s.selectedEnvironmentId)
   const selectEnvironment = useEnvironmentStore((s) => s.selectEnvironment)
   const setSelectedEnvironment = useEditorStore((s) => s.setSelectedEnvironment)
   const openTab = useWorkspaceStore((s) => s.openTab)
   const historyEntries = useHistoryStore((s) => s.entries)
   const savedQueries = useSavedQueriesStore((s) => s.queries)

   const [search, setSearch] = useState("")
   const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set())
   const [tableColumns, setTableColumns] = useState<TableCache>({})
   const [schemaLoading, setSchemaLoading] = useState(false)
   const [schemaError, setSchemaError] = useState<string | null>(null)
   const [loadingColumns, setLoadingColumns] = useState<Set<string>>(new Set())
   const [activeTableId, setActiveTableId] = useState<string | null>(null)
   const [activeNav, setActiveNav] = useState<NavTab>(null)
   const [tableTreeExpanded, setTableTreeExpanded] = useState(true)

   const selectedEnv = selectedEnvironmentId
      ? environments.find((e: Environment) => e.id === selectedEnvironmentId) ?? null
      : null
   const [tables, setTables] = useState<string[]>([])

   useEffect(() => {
      if (!selectedEnvironmentId || !selectedEnv) {
         setTables([])
         setTableColumns({})
         setExpandedTables(new Set())
         setSchemaError(null)
         return
      }

      let cancelled = false

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
      return () => { cancelled = true }
   }, [selectedEnvironmentId, selectedEnv])

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

   const handleTableDoubleClick = useCallback((tableName: string) => {
      onOpenTable(tableName)
   }, [onOpenTable])

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

   const handleNavClick = useCallback((tab: NavTab) => {
      setActiveNav(prev => prev === tab ? null : tab)
      setActiveTableId(null)
   }, [])

   if (collapsed) {
      return (
         <div className="flex h-full flex-col bg-bg-secondary text-text-secondary w-full border-r border-border/50 items-center py-2 gap-1">
            <button
               onClick={onToggleCollapse}
               className="h-8 w-8 rounded flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-quaternary transition-colors"
               aria-label="Expand sidebar"
            >
               <IconLayoutSidebarLeftCollapse className="h-4 w-4 rotate-180" />
            </button>
            <div className="w-6 h-px bg-border/60 my-1" />

            <button
               onClick={() => setActiveNav("playground")}
               className={cn("h-8 w-8 rounded flex items-center justify-center transition-colors",
                  activeNav === "playground" ? "text-accent bg-accent/10" : "text-text-muted hover:text-text-primary hover:bg-bg-quaternary"
               )}
               aria-label="Playground"
            >
               <IconCode className="h-4 w-4" />
            </button>
            <button
               onClick={() => setActiveNav("saved")}
               className={cn("h-8 w-8 rounded flex items-center justify-center transition-colors",
                  activeNav === "saved" ? "text-accent bg-accent/10" : "text-text-muted hover:text-text-primary hover:bg-bg-quaternary"
               )}
               aria-label="Saved Queries"
            >
               <IconBookmark className="h-4 w-4" />
            </button>
            <button
               onClick={() => setActiveNav("history")}
               className={cn("h-8 w-8 rounded flex items-center justify-center transition-colors",
                  activeNav === "history" ? "text-accent bg-accent/10" : "text-text-muted hover:text-text-primary hover:bg-bg-quaternary"
               )}
               aria-label="History"
            >
               <IconHistory className="h-4 w-4" />
            </button>
            <div className="w-6 h-px bg-border/60 my-1" />
            <button
               onClick={() => setTableTreeExpanded(!tableTreeExpanded)}
               className={cn("h-8 w-8 rounded flex items-center justify-center transition-colors",
                  tableTreeExpanded ? "text-accent bg-accent/10" : "text-text-muted hover:text-text-primary hover:bg-bg-quaternary"
               )}
               aria-label="Tables"
            >
               <IconTable className="h-4 w-4" />
            </button>
         </div>
      )
   }

   return (
      <div className="flex h-full flex-col bg-bg-secondary text-text-secondary w-full border-r border-border/50">
         {/* Header: DB Selector + Actions */}
         <div className="flex items-center justify-between w-full app-no-drag gap-1 px-3 pt-3 pb-2 shrink-0 app-drag-region">
            <Select
               value={selectedEnvironmentId ?? ""}
               onValueChange={handleSelect}
            >
               <SelectTrigger className="w-full bg-transparent border-transparent shadow-none hover:bg-bg-quaternary/30 focus:ring-0 px-2 h-9 transition-colors truncate">
                  <div className="flex items-center gap-2 truncate">
                     <div className="h-6 w-6 rounded bg-bg-tertiary border border-border flex items-center justify-center text-accent shrink-0">
                        <IconDatabase className="h-3.5 w-3.5" />
                     </div>
                     <SelectValue placeholder="Select Database" />
                  </div>
               </SelectTrigger>
               <SelectContent className="border-border/80 bg-bg-tertiary min-w-[200px] shadow-2xl">
                  {environments.map((env: Environment) => (
                     <SelectItem key={env.id} value={env.id} className="text-[12px] hover:bg-bg-quaternary">
                        {env.name || `${env.dbType} ${env.port}`}
                     </SelectItem>
                  ))}
               </SelectContent>
            </Select>
            <div className="flex items-center shrink-0">
               <button onClick={onSettingsOpen} className="h-7 w-7 rounded flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-quaternary transition-colors" aria-label="Settings">
                  <IconSettings className="h-3.5 w-3.5" />
               </button>
               <button onClick={onToggleCollapse} className="h-7 w-7 rounded flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-quaternary transition-colors" aria-label="Collapse sidebar">
                  <IconLayoutSidebarLeftCollapse className="h-3.5 w-3.5" />
               </button>
               <button onClick={onClose} className="h-7 w-7 rounded flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-quaternary transition-colors" aria-label="Close sidebar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
               </button>
            </div>
         </div>

         <div className="flex-1 flex flex-col min-h-0 custom-scrollbar overflow-y-auto">
            {/* WORKSPACE Section */}
            <div className="px-3 pt-1 pb-0.5">
               <div className="flex items-center gap-1.5 px-2 py-1.5 mb-0.5">
                  <span className="text-[10px] font-semibold tracking-widest uppercase text-text-muted/60">Workspace</span>
               </div>
               <div className="flex flex-col gap-0.5">
                  <NavItem
                     icon={<IconCode className="h-3.5 w-3.5" />}
                     label="Playground"
                     active={activeNav === "playground"}
                     onClick={() => handleNavClick("playground")}
                  />
                  <NavItem
                     icon={<IconBookmark className="h-3.5 w-3.5" />}
                     label="Saved Queries"
                     badge={savedQueries.length > 0 ? String(savedQueries.length) : undefined}
                     active={activeNav === "saved"}
                     onClick={() => handleNavClick("saved")}
                  />
                  <NavItem
                     icon={<IconHistory className="h-3.5 w-3.5" />}
                     label="History"
                     badge={historyEntries.length > 0 ? String(historyEntries.length) : undefined}
                     active={activeNav === "history"}
                     onClick={() => handleNavClick("history")}
                  />
               </div>
            </div>

            {/* Active nav panel */}
            {activeNav === "playground" && (
               <div className="mx-3 mb-2 p-2 rounded-md bg-bg-tertiary/50 border border-border/40">
                  <button
                     onClick={() => { openTab(); setActiveNav(null) }}
                     className="flex w-full items-center gap-2 px-2 py-1.5 rounded text-[11px] text-text-secondary hover:text-text-primary hover:bg-bg-quaternary/50 transition-colors"
                  >
                     <IconFileCode className="h-3.5 w-3.5" />
                     <span>New Query</span>
                  </button>
               </div>
            )}

            {activeNav === "saved" && (
               <div className="mx-3 mb-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {savedQueries.length === 0 ? (
                     <div className="px-2 py-4 text-center">
                        <IconBookmark className="h-5 w-5 text-text-muted/30 mx-auto mb-1" />
                        <p className="text-[10px] text-text-muted/60">No saved queries yet</p>
                     </div>
                  ) : (
                     savedQueries.map((q) => (
                        <button
                           key={q.id}
                           onClick={() => { onOpenQuery(q.sql); setActiveNav(null) }}
                           className="flex w-full items-center gap-2 px-2 py-1.5 rounded text-[11px] text-text-secondary hover:text-text-primary hover:bg-bg-quaternary/40 transition-colors text-left"
                        >
                           <IconStar className="h-3 w-3 text-warning shrink-0" />
                           <span className="truncate flex-1">{q.name}</span>
                           {q.tags.length > 0 && (
                              <span className="text-[9px] text-text-muted/60 font-mono">{q.tags[0]}</span>
                           )}
                        </button>
                     ))
                  )}
               </div>
            )}

            {activeNav === "history" && (
               <div className="mx-3 mb-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {historyEntries.length === 0 ? (
                     <div className="px-2 py-4 text-center">
                        <IconClock className="h-5 w-5 text-text-muted/30 mx-auto mb-1" />
                        <p className="text-[10px] text-text-muted/60">No query history yet</p>
                     </div>
                  ) : (
                     historyEntries.slice(0, 15).map((entry) => (
                        <button
                           key={entry.id}
                           onClick={() => { onOpenQuery(entry.sql); setActiveNav(null) }}
                           className="flex w-full items-center gap-2 px-2 py-1.5 rounded text-[11px] text-text-secondary hover:text-text-primary hover:bg-bg-quaternary/40 transition-colors text-left"
                        >
                           <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", entry.status === "success" ? "bg-success" : "bg-error")} />
                           <span className="truncate flex-1 font-mono text-[10px]">{entry.sql.slice(0, 40)}{entry.sql.length > 40 ? "..." : ""}</span>
                           <span className="text-[9px] text-text-muted/60 font-mono shrink-0">{entry.duration}ms</span>
                        </button>
                     ))
                  )}
               </div>
            )}

            {/* DATABASE Section */}
            <div className="flex-1 flex flex-col min-h-0 border-t border-border/40 mt-1">
               <div className="flex items-center justify-between px-4 py-2 group sticky top-0 bg-bg-secondary z-10">
                  <button
                     onClick={() => setTableTreeExpanded(!tableTreeExpanded)}
                     className="flex items-center gap-1.5"
                  >
                     <IconChevronRight className={cn("h-3 w-3 text-text-muted transition-transform", tableTreeExpanded && "rotate-90")} />
                     <span className="text-[10px] font-semibold tracking-widest uppercase text-text-muted/60">Database</span>
                  </button>
                  {tableTreeExpanded && (
                     <div className="flex items-center gap-0.5">
                        <button
                           onClick={handleRefresh}
                           disabled={schemaLoading}
                           className="h-6 w-6 rounded flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-quaternary transition-colors disabled:opacity-40"
                           aria-label="Refresh tables"
                        >
                           <IconRefresh className={cn("h-3 w-3", schemaLoading && "animate-spin")} />
                        </button>
                     </div>
                  )}
               </div>

               {tableTreeExpanded && (
                  <div className="flex-1 flex flex-col min-h-0 px-2">
                     {/* Section Tabs: Tables | Views | Indexes */}
                     <div className="flex items-center gap-0.5 px-1 mb-2">
                        {(["Tables", "Views", "Indexes"] as const).map((section) => (
                           <button
                              key={section}
                              className={cn(
                                 "flex-1 text-[10px] font-semibold tracking-wide py-1 px-2 rounded transition-colors",
                                 section === "Tables" ? "text-accent bg-accent/10" : "text-text-muted hover:text-text-secondary hover:bg-bg-quaternary/30"
                              )}
                           >
                              {section}
                           </button>
                        ))}
                     </div>

                     {/* Search */}
                     <div className="pb-2 px-1">
                        <div className="flex items-center gap-2 bg-bg-tertiary rounded border border-border px-2.5 py-1.5">
                           <IconSearch className="h-3 w-3 text-text-muted shrink-0" />
                           <input
                              type="text"
                              value={search}
                              onChange={e => setSearch(e.target.value)}
                              placeholder="Search tables..."
                              className="flex-1 bg-transparent text-[11px] text-text-primary outline-none placeholder:text-text-muted/60"
                           />
                        </div>
                     </div>

                     {/* Table List */}
                     <div className="flex-1 overflow-y-auto custom-scrollbar pb-2">
                        {schemaLoading && tables.length === 0 && (
                           <div className="flex items-center justify-center py-6">
                              <div className="flex flex-col items-center gap-2">
                                 <div className="h-3 w-3 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                                 <span className="text-[10px] text-text-muted">Loading tables...</span>
                              </div>
                           </div>
                        )}

                        {schemaError && !schemaLoading && (
                           <div className="mx-1 mt-2 p-2 rounded bg-error/5 border border-error/20">
                              <p className="text-[10px] text-error font-medium mb-1">Failed to load schema</p>
                              <p className="text-[9px] text-text-muted leading-relaxed">{schemaError}</p>
                           </div>
                        )}

                        {!schemaLoading && !schemaError && tables.length === 0 && selectedEnvironmentId && (
                           <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                              <IconTable className="h-6 w-6 text-text-muted/30 mb-1" />
                              <span className="text-[11px] text-text-muted">No tables found</span>
                           </div>
                        )}

                        {!schemaLoading && filteredTables.length === 0 && tables.length > 0 && (
                           <div className="flex items-center justify-center py-6">
                              <span className="text-[11px] text-text-muted">No matching tables</span>
                           </div>
                        )}

                        {filteredTables.map((tableName) => (
                           <div key={tableName}>
                              <button
                                 onClick={() => toggleTable(tableName)}
                                 onDoubleClick={() => handleTableDoubleClick(tableName)}
                                 className={cn(
                                    "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors outline-none focus-visible:ring-1 focus-visible:ring-accent",
                                    activeTableId === tableName
                                       ? "bg-bg-quaternary/50 text-accent"
                                       : "text-text-secondary hover:text-text-primary hover:bg-bg-quaternary/30",
                                 )}
                              >
                                 <IconChevronRight
                                    className={cn(
                                       "h-2.5 w-2.5 shrink-0 transition-transform text-text-muted",
                                       expandedTables.has(tableName) && "rotate-90",
                                    )}
                                 />
                                 <IconTable className="h-3.5 w-3.5 shrink-0 opacity-70" />
                                 <span className="truncate flex-1 text-left">{tableName}</span>
                                 {tableColumns[tableName] && (
                                    <span className="text-[9px] text-text-muted font-mono">{tableColumns[tableName].length}</span>
                                 )}
                                 {loadingColumns.has(tableName) && (
                                    <div className="h-2.5 w-2.5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                                 )}
                              </button>

                              {expandedTables.has(tableName) && tableColumns[tableName] && (
                                 <div className="ml-4 border-l border-border/60 ml-5">
                                    {tableColumns[tableName].length === 0 && !loadingColumns.has(tableName) && (
                                       <div className="py-1.5 px-3 text-[9px] text-text-muted italic">No columns</div>
                                    )}
                                    {tableColumns[tableName].map((col) => (
                                       <div
                                          key={col.name}
                                          className="flex items-center gap-2 px-3 py-0.5 hover:bg-bg-quaternary/20 transition-colors group"
                                       >
                                          {col.primaryKey ? (
                                             <IconKey className="h-2 w-2 shrink-0 text-warning" />
                                          ) : (
                                             <div className="h-1.5 w-1.5 shrink-0 rounded-[2px] bg-accent/40" />
                                          )}
                                          <span className="text-[10px] font-mono text-text-primary truncate">{col.name}</span>
                                          <span className="text-[9px] font-mono text-text-muted/60 truncate ml-auto">{col.type}</span>
                                          <span className={cn(
                                             "text-[8px] font-mono px-1 rounded shrink-0",
                                             col.nullable ? "text-text-muted/50" : "text-error/60",
                                          )}>
                                             {col.nullable ? "NULL" : "NN"}
                                          </span>
                                       </div>
                                    ))}
                                 </div>
                              )}

                              {expandedTables.has(tableName) && loadingColumns.has(tableName) && (
                                 <div className="flex items-center gap-2 px-5 py-1.5">
                                    <div className="h-2.5 w-2.5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                                    <span className="text-[9px] text-text-muted">Loading columns...</span>
                                 </div>
                              )}
                           </div>
                        ))}
                     </div>
                  </div>
               )}
            </div>
         </div>
      </div>
   )
}

function NavItem({ icon, label, badge, active, onClick }: {
   icon: React.ReactNode
   label: string
   badge?: string
   active?: boolean
   onClick: () => void
}) {
   return (
      <button
         onClick={onClick}
         className={cn(
            "flex w-full items-center gap-2.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all outline-none focus-visible:ring-1 focus-visible:ring-accent",
            active
               ? "bg-accent/10 text-accent"
               : "text-text-secondary hover:text-text-primary hover:bg-bg-quaternary/40",
         )}
      >
         <span className={cn("shrink-0", active ? "text-accent" : "text-text-muted")}>{icon}</span>
         <span className="truncate flex-1 text-left">{label}</span>
         {badge && (
            <span className="text-[9px] font-mono text-text-muted bg-bg-tertiary px-1.5 py-0.5 rounded">{badge}</span>
         )}
      </button>
   )
}
