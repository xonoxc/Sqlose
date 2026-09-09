import { useEffect, useState } from "react"
import {
   IconPlus,
   IconX,
   IconLoader2,
   IconTable,
   IconChevronRight,
   IconRefresh,
   IconAlertTriangle,
   IconDatabase,
   IconServer,
} from "@tabler/icons-react"
import { SQLEditor } from "~/components/SQLEditor"
import { ResultsPanel } from "~/components/ResultsPanel"
import { useDbClientStore } from "~/stores/dbClientStore"
import type { DbClientTab } from "~/stores/dbClientStore"
import { useResizeHandler } from "~/hooks/useResizeHandler"
import { CopyDropdown } from "~/components/CopyDropdown"
import { ExportDropdown } from "~/components/ExportDropdown"
import { copyResultsToClipboard, exportResultsToFile } from "~/hooks/useQueryExecution"

const RESULTS_MIN_HEIGHT = 80
const RESULTS_MAX_HEIGHT = 800

interface DbClientWorkspaceProps {
   connectionId: string
}

function TabItem({ tab, isActive, onClick, onClose }: {
   tab: DbClientTab
   isActive: boolean
   onClick: () => void
   onClose: () => void
}) {
   return (
      <div
         className={`flex items-center gap-1.5 px-3 h-full cursor-pointer group border-r border-border/15 select-none transition-colors ${
            isActive
               ? "bg-bg-primary text-text-primary"
               : "text-text-muted/60 hover:text-text-muted hover:bg-bg-tertiary/30"
         }`}
         onClick={onClick}
      >
         {tab.isExecuting && (
            <IconLoader2 className="h-3 w-3 animate-spin shrink-0 text-accent" />
         )}
         <span className="text-[12.5px] font-medium max-w-[160px] truncate">{tab.title || "New Query"}</span>
         <button
            onClick={e => { e.stopPropagation(); onClose() }}
            className="ml-0.5 h-4 w-4 rounded flex items-center justify-center opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-white/10 transition-all"
         >
            <IconX className="h-2.5 w-2.5" />
         </button>
      </div>
   )
}

export function DbClientWorkspace({ connectionId }: DbClientWorkspaceProps) {
   const {
      connections,
      workspaces,
      openTab,
      closeTab,
      setActiveTab,
      updateTab,
      executeQuery,
      loadSchema,
   } = useDbClientStore()

   const [activeResultsTab, setActiveResultsTab] = useState<"results" | "messages" | "stats" | "plan">("results")
   const [resultsHeight, setResultsHeight] = useState(280)
   const [resultsCollapsed, setResultsCollapsed] = useState(false)

   const resultsResize = useResizeHandler({
      axis: "y",
      min: RESULTS_MIN_HEIGHT,
      max: RESULTS_MAX_HEIGHT,
      onResize: v => setResultsHeight(v),
   })

   const conn = connections.find(c => c.id === connectionId)
   const workspace = workspaces[connectionId]
   const activeTab = workspace?.tabs.find(t => t.id === workspace.activeTabId)

   useEffect(() => {
      if (workspace && workspace.tables.length === 0 && !workspace.tablesLoading) {
         loadSchema(connectionId)
      }
   }, [connectionId])

   if (!conn || !workspace) {
      return (
         <div className="flex-1 flex items-center justify-center">
            <div className="text-text-muted text-sm">Loading workspace...</div>
         </div>
      )
   }

   const handleExecute = async () => {
      if (!activeTab || activeTab.isExecuting || !activeTab.query.trim()) return
      await executeQuery(connectionId, activeTab.id, activeTab.query)
   }

   const handleQueryChange = (q: string) => {
      if (!activeTab) return
      let title = "New Query"
      const trimmed = q.trim()
      if (trimmed) {
         const first = trimmed.split("\n")[0].trim()
         title = first.length > 40 ? first.slice(0, 40) + "..." : first
      }
      updateTab(connectionId, activeTab.id, { query: q, title })
   }

   return (
      <div className="flex h-full overflow-hidden">
         {/* Schema sidebar */}
         <div className="w-52 shrink-0 bg-bg-secondary border-r border-border/20 flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/20 shrink-0">
               <div className="flex items-center gap-2">
                  {conn.dbType === "sqlite"
                     ? <IconDatabase className="h-3.5 w-3.5" />
                     : <IconServer className="h-3.5 w-3.5" />
                  }
                  <span
                     className="text-[12px] font-bold truncate max-w-[100px]"
                     style={{ color: conn.color }}
                  >
                     {conn.name}
                  </span>
               </div>
               <button
                  onClick={() => loadSchema(connectionId)}
                  disabled={workspace.tablesLoading}
                  className="h-5 w-5 rounded flex items-center justify-center text-text-muted/40 hover:text-text-muted transition-colors disabled:opacity-30"
                  title="Refresh schema"
               >
                  <IconRefresh className={`h-3 w-3 ${workspace.tablesLoading ? "animate-spin" : ""}`} />
               </button>
            </div>

            <div className="px-2 py-1.5 shrink-0">
               <p className="text-[10px] font-bold text-text-muted/50 uppercase tracking-widest px-1 mb-1">
                  Tables
               </p>
            </div>

            <div className="flex-1 overflow-y-auto px-2 pb-2 min-h-0">
               {workspace.tablesLoading ? (
                  <div className="flex items-center justify-center py-4">
                     <IconLoader2 className="h-4 w-4 text-text-muted animate-spin" />
                  </div>
               ) : workspace.tables.length === 0 ? (
                  <div className="py-4 px-2 text-center">
                     <IconAlertTriangle className="h-4 w-4 text-text-muted/40 mx-auto mb-1" />
                     <p className="text-[11px] text-text-muted/50">No tables found</p>
                  </div>
               ) : (
                  workspace.tables.map(table => (
                     <button
                        key={table}
                        onClick={() => {
                           const tab = openTab(connectionId)
                           updateTab(connectionId, tab.id, {
                              query: `SELECT * FROM ${table} LIMIT 100`,
                              title: `SELECT * FROM ${table}`,
                           })
                        }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-text-muted hover:text-text-primary hover:bg-bg-tertiary/50 transition-all group"
                     >
                        <IconTable className="h-3 w-3 shrink-0 opacity-50 group-hover:opacity-70" />
                        <span className="text-[12px] font-mono truncate">{table}</span>
                        <IconChevronRight className="h-2.5 w-2.5 ml-auto opacity-0 group-hover:opacity-50" />
                     </button>
                  ))
               )}
            </div>
         </div>

         {/* Main editor area */}
         <div className="flex-1 min-w-0 flex flex-col">
            {/* Tab bar */}
            <div className="flex items-center h-9 border-b border-border/20 bg-bg-secondary overflow-x-auto shrink-0">
               {workspace.tabs.map(tab => (
                  <TabItem
                     key={tab.id}
                     tab={tab}
                     isActive={tab.id === workspace.activeTabId}
                     onClick={() => setActiveTab(connectionId, tab.id)}
                     onClose={() => closeTab(connectionId, tab.id)}
                  />
               ))}
               <button
                  onClick={() => openTab(connectionId)}
                  className="h-full px-3 flex items-center text-text-muted/40 hover:text-text-muted hover:bg-bg-tertiary/30 transition-colors shrink-0"
                  title="New query tab"
               >
                  <IconPlus className="h-3 w-3" />
               </button>
            </div>

            {/* Editor + results */}
            <div className="flex-1 min-h-0 flex flex-col">
               {/* Editor */}
               <div className="flex-1 min-h-0 relative">
                  {activeTab ? (
                     <SQLEditor
                        value={activeTab.query}
                        onChange={handleQueryChange}
                        onExecute={handleExecute}
                        onSettingsOpen={() => {}}
                        isExecuting={activeTab.isExecuting}
                        executionTimeMs={activeTab.executionTimeMs ?? null}
                     />
                  ) : (
                     <div className="flex-1 flex items-center justify-center h-full text-text-muted/40">
                        <span className="text-sm">Open a tab to write SQL</span>
                     </div>
                  )}
               </div>

               {/* Results resize handle */}
               {!resultsCollapsed && (
                  <div
                     className="relative h-px cursor-row-resize bg-transparent hover:bg-accent/30 transition-colors shrink-0 group"
                     onMouseDown={e => resultsResize.handleMouseDown(e, resultsHeight)}
                  >
                     <div className="absolute inset-y-[-3px] inset-x-0" />
                  </div>
               )}

               {/* Results panel */}
               <div
                  className="border-t border-border/20 flex flex-col shrink-0"
                  style={{
                     height: resultsCollapsed ? "36px" : resultsHeight,
                  }}
               >
                  {/* Results header */}
                  <div className="flex items-center justify-between h-9 px-2 bg-bg-secondary border-b border-border/20 shrink-0">
                     <div className="flex items-center gap-4 h-full">
                        <button
                           onClick={() => setResultsCollapsed(v => !v)}
                           className="h-6 w-6 rounded flex items-center justify-center text-text-muted/60 hover:text-text-muted hover:bg-white/5 transition-colors"
                        >
                           <IconChevronRight
                              className={`h-3.5 w-3.5 transition-transform ${resultsCollapsed ? "" : "rotate-90"}`}
                           />
                        </button>
                        {(["results", "messages", "stats"] as const).map(t => (
                           <button
                              key={t}
                              onClick={() => setActiveResultsTab(t)}
                              className={`text-[12.5px] font-medium transition-colors capitalize ${
                                 activeResultsTab === t
                                    ? "text-text-primary"
                                    : "text-text-muted/40 hover:text-text-muted"
                              }`}
                           >
                              {t}
                           </button>
                        ))}
                     </div>

                     {activeTab && (
                        <div className="flex items-center gap-3">
                           {activeTab.result && (
                              <div className="flex items-center gap-1.5 text-[12px] font-medium">
                                 <span className="text-text-primary">{activeTab.result.rowCount} rows</span>
                                 {activeTab.executionTimeMs !== undefined && (
                                    <>
                                       <span className="text-text-muted/30 pb-0.5">•</span>
                                       <span className="text-text-secondary font-mono">
                                          {activeTab.executionTimeMs}ms
                                       </span>
                                    </>
                                 )}
                              </div>
                           )}
                           {activeTab.isExecuting && (
                              <div className="flex items-center gap-1.5 text-accent/80">
                                 <IconLoader2 className="h-3 w-3 animate-spin" />
                                 <span className="text-[11px] font-medium">Running...</span>
                              </div>
                           )}
                           {activeTab.result && (
                              <div className="flex items-center gap-1">
                                 <CopyDropdown
                                    onCopy={format => copyResultsToClipboard(activeTab.result!, format)}
                                 />
                                 <ExportDropdown
                                    onExport={format => exportResultsToFile(activeTab.result!, format)}
                                 />
                              </div>
                           )}
                        </div>
                     )}
                  </div>

                  {/* Results body */}
                  {!resultsCollapsed && (
                     <div className="flex-1 min-h-0 overflow-hidden">
                        <ResultsPanel
                           result={activeTab?.result ?? null}
                           error={activeTab?.error ?? null}
                           isExecuting={activeTab?.isExecuting ?? false}
                           executionTimeMs={activeTab?.executionTimeMs ?? null}
                           rowCount={activeTab?.result?.rowCount ?? null}
                           activeTab={activeResultsTab}
                        />
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   )
}
