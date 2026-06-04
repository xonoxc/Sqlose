import { useState, useEffect, useRef } from "react"
import { Toaster } from "sonner"
import { QueryClientProvider } from "@tanstack/react-query"
import { motion, AnimatePresence } from "motion/react"
import { StatusBar, cn, Button } from "@sqlose/ui"
import { queryClient } from "./lib/query/queryClient"
import { api } from "./lib/api"
import type { QueryResult } from "@sqlose/shared"
import {
   TabBar,
   AppSidebar,
   SQLEditor,
   ResultsPanel,
   CommandPalette,
   SettingsPanel,
   Dashboard,
   TableBrowser,
   ShortcutsDialog,
   SchemaDiagram,
} from "./components"
import { useEnvironmentStore } from "./stores/environmentStore"
import { useEditorStore } from "./stores/editorStore"
import { useWorkspaceStore } from "./stores/workspaceStore"
import { useSettingsStore } from "./stores/settingsStore"
import { useDatabaseStore } from "./stores/databaseStore"
import { useHistoryStore } from "./stores/historyStore"
import { useSavedQueriesStore } from "./stores/savedQueriesStore"
import { useThemeStore } from "./stores/theme-store"
import { isMac } from "./lib/types"
import {
   IconDotsVertical,
   IconCopy,
   IconDownload,
   IconPlayerPlay,
   IconLoader2,
   IconSquareRoundedX,
   IconChevronDown,
   IconMaximize,
   IconMinimize,
   IconTrash,
   IconBomb,
   IconLogout,
} from "@tabler/icons-react"

async function copyResultsToClipboard(result: QueryResult, withHeaders: boolean): Promise<void> {
   const headers = result.columns.join("\t")
   const rows = result.rows
      .map(r =>
         result.columns
            .map(c => {
               const v = r[c]
               return v === null ? "NULL" : String(v)
            })
            .join("\t")
      )
      .join("\n")

   const text = withHeaders ? `${headers}\n${rows}` : rows

   if (navigator.clipboard?.writeText) {
      try {
         await navigator.clipboard.writeText(text)
         return
      } catch (err) {
         console.warn("Clipboard API failed, trying fallback:", err)
      }
   }

   const ta = document.createElement("textarea")
   ta.value = text
   ta.style.position = "fixed"
   ta.style.opacity = "0"

   document.body.appendChild(ta)
   ta.select()

   try {
      ;(document as HTMLDocument & { execCommand(name: string): boolean }).execCommand("copy")
   } catch (err) {
      console.error("All clipboard copy methods failed:", err)
   } finally {
      document.body.removeChild(ta)
   }
}

function AppContent() {
   const [sidebarOpen] = useState(true)
   const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
   const [paletteOpen, setPaletteOpen] = useState(false)
   const [settingsOpen, setSettingsOpen] = useState(false)
   const [shortcutsOpen, setShortcutsOpen] = useState(false)
   const [executingTabId, setExecutingTabId] = useState<string | null>(null)
   const [executionTimeMs, setExecutionTimeMs] = useState<number | null>(null)
   const [resultsCollapsed, setResultsCollapsed] = useState(false)
   const [resultsActiveTab, setResultsActiveTab] = useState<"results" | "messages" | "stats" | "plan">("results")
   const [isResultsMaximized, setIsResultsMaximized] = useState(false)
   const [copyDropdownOpen, setCopyDropdownOpen] = useState(false)
   const [exportDropdownOpen, setExportDropdownOpen] = useState(false)
   const [stuckEnvId, setStuckEnvId] = useState<string | null>(null)
   const prevExecutionRef = useRef<number>(0)

   const fetchEnvironments = useEnvironmentStore(s => s.fetchEnvironments)
   const selectedEnvironmentId = useEnvironmentStore(s => s.selectedEnvironmentId)
   const selectEnvironment = useEnvironmentStore(s => s.selectEnvironment)
   const startEnvironment = useEnvironmentStore(s => s.startEnvironment)
   const nukeEnvironment = useEnvironmentStore(s => s.nukeEnvironment)
   const environments = useEnvironmentStore(s => s.environments)

   const queryDraft = useEditorStore(s => s.queryDraft)
   const setQueryDraft = useEditorStore(s => s.setQueryDraft)
   const vimMode = useEditorStore(s => s.vimMode)
   const vimEnabled = useSettingsStore(s => s.vimModeEnabled)

   const tabs = useWorkspaceStore(s => s.tabs)
   const activeTabId = useWorkspaceStore(s => s.activeTabId)
   const activeTab = tabs.find(t => t.id === activeTabId)
   const updateTab = useWorkspaceStore(s => s.updateTab)
   const openTab = useWorkspaceStore(s => s.openTab)
   const closeTab = useWorkspaceStore(s => s.closeTab)
   const setActiveTab = useWorkspaceStore(s => s.setActiveTab)
   const paneSizes = useWorkspaceStore(s => s.paneSizes)
   const updatePaneSizes = useWorkspaceStore(s => s.updatePaneSizes)

   const addHistoryEntry = useHistoryStore(s => s.addEntry)
   const loadHistory = useHistoryStore(s => s.loadHistory)
   const loadQueries = useSavedQueriesStore(s => s.loadQueries)
   const clearActiveTable = useDatabaseStore(s => s.setActiveTable)
   useThemeStore() // subscribe to persist rehydration for theme

   const RESULTS_MIN_HEIGHT = 80
   const RESULTS_MAX_HEIGHT = 800
   const SIDEBAR_MIN_WIDTH = 200
   const SIDEBAR_MAX_WIDTH = 400

   useEffect(() => {
      fetchEnvironments()
      loadHistory()
      loadQueries()
   }, [fetchEnvironments, loadHistory, loadQueries])

   useEffect(() => {
      if (activeTab) {
         if (activeTab.tableName) {
            clearActiveTable(activeTab.tableName)
         } else {
            clearActiveTable(null)
            setQueryDraft(activeTab.query)
         }
      }
   }, [activeTabId])

   useEffect(() => {
      if (!selectedEnvironmentId) {
         setStuckEnvId(null)
      } else if (stuckEnvId === null) {
         const env = environments.find(e => e.id === selectedEnvironmentId)
         if (env && env.status === "stopped" && env.containerId) {
            setStuckEnvId(env.id)
         }
      }
   }, [selectedEnvironmentId, environments, stuckEnvId])

   const handleNewQuery = () => {
      const result = openTab()
      if (result.isOk()) {
         setQueryDraft("")
      }
   }

   const handleCloseTab = () => {
      if (activeTabId) {
         closeTab(activeTabId)
      }
   }

   const handleSwitchTab = (direction: 1 | -1) => {
      const currentIndex = tabs.findIndex(t => t.id === activeTabId)
      if (currentIndex === -1) return
      const nextIndex = (currentIndex + direction + tabs.length) % tabs.length
      if (nextIndex !== currentIndex) {
         setActiveTab(tabs[nextIndex].id)
      }
   }

   const handleExecuteQuery = async () => {
      if (!selectedEnvironmentId || !queryDraft.trim() || !activeTabId) return

      const executionId = Date.now()
      prevExecutionRef.current = executionId

      setExecutingTabId(activeTabId)
      setExecutionTimeMs(null)

      updateTab(activeTabId, { isExecuting: true, error: null })

      const startTime = performance.now()
      const result = await api.query.execute(selectedEnvironmentId, queryDraft)
      const elapsed = Math.round(performance.now() - startTime)

      if (prevExecutionRef.current !== executionId) return

      setExecutingTabId(null)
      const selectedEnv = environments.find(e => e.id === selectedEnvironmentId)

      if (result.isOk()) {
         const qr = result.value
         updateTab(activeTabId, {
            isExecuting: false,
            result: qr,
            error: null,
            isDirty: false,
            executionTimeMs: elapsed,
         })
         addHistoryEntry(
            queryDraft,
            selectedEnvironmentId,
            selectedEnv?.dbType ?? "sql",
            elapsed,
            qr.rowCount,
            "success",
            null
         )
      } else {
         updateTab(activeTabId, {
            isExecuting: false,
            result: null,
            error: result.error.message,
            executionTimeMs: elapsed,
         })
         addHistoryEntry(
            queryDraft,
            selectedEnvironmentId,
            selectedEnv?.dbType ?? "sql",
            elapsed,
            0,
            "error",
            result.error.message
         )
      }
   }

   const isExecuting = executingTabId === activeTabId

   const handleQueryChange = (value: string) => {
      setQueryDraft(value)
      if (activeTabId) {
         updateTab(activeTabId, { query: value, isDirty: true })
      }
   }

   const handleClearResults = () => {
      if (activeTabId) {
         updateTab(activeTabId, { result: null, error: null })
         setExecutionTimeMs(null)
      }
   }

   const handleCopyResults = (withHeaders: boolean) => {
      if (activeTab?.result) {
         copyResultsToClipboard(activeTab.result, withHeaders)
      }
   }

   const handleOpenTable = (tableName: string) => {
      const result = openTab(selectedEnvironmentId ?? undefined, { tableName, title: tableName })
      if (result.isOk()) {
         const tab = result.value
         setActiveTab(tab.id)
      }
   }

   const handleOpenQuery = (sql: string) => {
      const result = openTab()
      if (result.isOk()) {
         const tab = result.value
         updateTab(tab.id, { query: sql })
         setQueryDraft(sql)
         setActiveTab(tab.id)
      }
   }

   const handleResultsDividerMouseDown = (e: React.MouseEvent) => {
      e.preventDefault()
      const startY = e.clientY
      const startHeight = paneSizes.resultsHeight

      const handleMouseMove = (moveE: MouseEvent) => {
         const delta = startY - moveE.clientY
         const newHeight = Math.max(
            RESULTS_MIN_HEIGHT,
            Math.min(RESULTS_MAX_HEIGHT, startHeight + delta)
         )
         updatePaneSizes({ resultsHeight: Math.round(newHeight) })
      }

      const handleMouseUp = () => {
         document.removeEventListener("mousemove", handleMouseMove)
         document.removeEventListener("mouseup", handleMouseUp)
         document.body.style.cursor = ""
         document.body.style.userSelect = ""
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = "row-resize"
      document.body.style.userSelect = "none"
   }

   const handleSidebarResizeStart = (e: React.MouseEvent) => {
      e.preventDefault()
      const startX = e.clientX
      const startWidth = paneSizes.sidebarWidth

      const handleMouseMove = (moveE: MouseEvent) => {
         const delta = moveE.clientX - startX
         const newWidth = Math.max(
            SIDEBAR_MIN_WIDTH,
            Math.min(SIDEBAR_MAX_WIDTH, startWidth + delta)
         )
         updatePaneSizes({ sidebarWidth: Math.round(newWidth) })
      }

      const handleMouseUp = () => {
         document.removeEventListener("mousemove", handleMouseMove)
         document.removeEventListener("mouseup", handleMouseUp)
         document.body.style.cursor = ""
         document.body.style.userSelect = ""
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = "col-resize"
      document.body.style.userSelect = "none"
   }

   useEffect(() => {
      const isMacPlatform = isMac()

      const handleKeyDown = (e: KeyboardEvent) => {
         if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
            e.preventDefault()
            setShortcutsOpen(true)
            return
         }

         const mod = isMacPlatform ? e.metaKey : e.ctrlKey
         if (!mod) return

         if (e.key === "k") {
            e.preventDefault()
            setPaletteOpen(true)
            return
         }

         if (e.key === "Enter") {
            e.preventDefault()
            handleExecuteQuery()
            return
         }

         if (!e.shiftKey && e.key === "n") {
            e.preventDefault()
            handleNewQuery()
            return
         }

         if (e.key === "w") {
            e.preventDefault()
            handleCloseTab()
            return
         }

         if (e.key === "Tab") {
            e.preventDefault()
            handleSwitchTab(e.shiftKey ? -1 : 1)
            return
         }
      }

      document.addEventListener("keydown", handleKeyDown, true)
      return () => document.removeEventListener("keydown", handleKeyDown, true)
   }, [handleExecuteQuery, handleNewQuery, handleCloseTab, handleSwitchTab])

   const handleRestoreEnv = async () => {
      if (stuckEnvId) {
         await startEnvironment(stuckEnvId)
         setStuckEnvId(null)
      }
   }

   const handleExitAndNuke = async () => {
      if (stuckEnvId) {
         await nukeEnvironment(stuckEnvId)
         selectEnvironment(null)
         setStuckEnvId(null)
      }
   }

   const selectedEnv = selectedEnvironmentId
      ? (environments.find(e => e.id === selectedEnvironmentId) ?? null)
      : null

   return (
      <div className="h-screen w-screen overflow-hidden bg-bg-primary">
         {selectedEnvironmentId ? (
            <div className="flex h-full w-full bg-bg-primary text-text-primary font-sans overflow-hidden relative">
               <div className="flex-1 min-w-0 flex">
                  {sidebarOpen && (
                     <div
                        style={{ width: sidebarCollapsed ? 56 : paneSizes.sidebarWidth }}
                        className="flex flex-col h-full bg-bg-secondary border-r border-border/80 overflow-hidden shrink-0 transition-all duration-150"
                     >
                        <AppSidebar
                           onSettingsOpen={() => setSettingsOpen(true)}
                           onOpenTable={handleOpenTable}
                           onOpenQuery={handleOpenQuery}
                           collapsed={sidebarCollapsed}
                           onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                        />
                     </div>
                  )}
                  {sidebarOpen && !sidebarCollapsed && (
                     <div
                        className="relative w-0.4 cursor-col-resize bg-transparent hover:bg-accent/30 transition-colors shrink-0"
                        onMouseDown={handleSidebarResizeStart}
                     >
                        <div className="absolute inset-y-0 -left-1 -right-1" />
                     </div>
                  )}
                  <div className="flex-1 min-w-0 overflow-hidden">
                     <div className="flex flex-col h-full bg-bg-primary w-full relative">
                        {/* Top bar */}
                        <div className="h-14 flex items-center justify-between px-4 border-b border-border/30 bg-bg-secondary/90 shrink-0 shadow-sm z-20 relative">
                           <div />
                           {/* Command palette trigger */}
                           <div className="flex-1 max-w-md mx-4">
                              <button
                                 onClick={() => setPaletteOpen(true)}
                                 className="w-full flex items-center gap-2.5 bg-bg-tertiary hover:bg-bg-quaternary border border-border shadow-inner rounded-md px-3 py-2.5 text-[13.5px] text-text-muted transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                              >
                                 <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="13"
                                    height="13"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="opacity-60"
                                 >
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.3-4.3" />
                                 </svg>
                                 <span className="opacity-80 font-medium">
                                    Search tables, queries, commands...
                                 </span>
                                 <div className="ml-auto flex items-center gap-1 opacity-50">
                                    {isMac() ? (
                                       <>
                                          <kbd className="bg-bg-primary text-[11.5px] font-mono px-1.5 py-[2px] rounded border border-border/60 shadow-sm leading-none shrink-0">
                                             ⌘
                                          </kbd>
                                          <kbd className="bg-bg-primary text-[11.5px] font-mono px-1.5 py-[2px] rounded border border-border/60 shadow-sm leading-none shrink-0">
                                             K
                                          </kbd>
                                       </>
                                    ) : (
                                       <kbd className="bg-bg-primary text-[11.5px] font-mono px-1.5 py-[2px] rounded border border-border/60 shadow-sm leading-none shrink-0">
                                          Ctrl+K
                                       </kbd>
                                    )}
                                 </div>
                              </button>
                           </div>

                           <div className="flex items-center gap-1">
                              <button
                                 onClick={() => selectEnvironment(null)}
                                 className="h-9 w-9 rounded flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-quaternary transition-colors border-2 rounded-md border-border/25"
                                 aria-label="Back to dashboard"
                              >
                                 <IconLogout className="h-4.5 w-4.5" />
                              </button>
                           </div>
                        </div>

                        {/* Tab bar */}
                        <div className="flex items-end border-b border-border/20 bg-bg-secondary/40 px-3 py-0.5 shrink-0 w-full z-10 relative min-h-[52px]">
                           <TabBar />
                        </div>

                        {/* Content: TableBrowser | Editor+Results | Diagram | Empty */}
                        <div className="flex-1 min-h-0 overflow-hidden">
                           <AnimatePresence mode="wait">
                              {activeTab?.type === "diagram" ? (
                                 <motion.div
                                    key="schema-diagram"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.1 }}
                                    className="h-full z-10 relative"
                                 >
                                    <SchemaDiagram />
                                 </motion.div>
                              ) : activeTab?.tableName ? (
                                 <motion.div
                                    key="table-browser"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.1 }}
                                    className="h-full"
                                 >
                                    <TableBrowser />
                                 </motion.div>
                              ) : activeTabId ? (
                                 <motion.div
                                    key="editor"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.1 }}
                                    className="flex flex-col h-full"
                                 >
                                    {/* Editor */}
                                    {!isResultsMaximized && (
                                       <div className="flex-1 flex flex-col min-h-0">
                                          <SQLEditor
                                             value={queryDraft}
                                             onChange={handleQueryChange}
                                             onExecute={handleExecuteQuery}
                                             onSettingsOpen={() => setSettingsOpen(true)}
                                             onCommandMode={() => setPaletteOpen(true)}
                                             isExecuting={isExecuting}
                                             executionTimeMs={activeTab?.executionTimeMs || null}
                                          />
                                       </div>
                                    )}

                                    {/* Boundary Resize Layer */}
                                    {!isResultsMaximized && (
                                       <div
                                          className="h-[3px] -mb-[3px] cursor-row-resize shrink-0 relative z-30 group transition-colors flex items-center justify-center select-none"
                                          onMouseDown={handleResultsDividerMouseDown}
                                       >
                                          <div
                                             className={cn(
                                                "absolute inset-x-0 top-0 h-[1px] w-full transition-colors",
                                                isExecuting
                                                   ? "bg-accent/40"
                                                   : "bg-transparent group-hover:bg-accent/25"
                                             )}
                                          />
                                          <div
                                             className={cn(
                                                "h-[2px] w-10 rounded-full absolute transition-opacity opacity-0 group-hover:opacity-100",
                                                isExecuting ? "bg-accent" : "bg-accent/50"
                                             )}
                                          />
                                       </div>
                                    )}

                                    {/* Results Panel */}
                                    <div
                                       className={cn(
                                          "flex flex-col relative z-20 transition-all duration-200",
                                          isResultsMaximized ? "flex-1 h-full border-t-0" : "shrink-0 bg-bg-primary shadow-[0_-4px_20px_rgba(0,0,0,0.35)] border-t border-border/60",
                                          resultsCollapsed && !isResultsMaximized && "overflow-hidden"
                                       )}
                                       style={{
                                          height: isResultsMaximized 
                                             ? "100%" 
                                             : (resultsCollapsed ? "34px" : `${paneSizes.resultsHeight}px`),
                                          minHeight: isResultsMaximized
                                             ? "100%"
                                             : (resultsCollapsed ? "34px" : `${RESULTS_MIN_HEIGHT}px`),
                                       }}
                                    >
                                       {/* Unified Bottom Panel Header */}
                                       <div className="flex items-center justify-between px-3 h-9 bg-bg-secondary/40 shrink-0 border-b border-border/20 z-30">
                                          <div className="flex items-center gap-0.5 h-full">
                                             <button
                                                onClick={() =>
                                                   setResultsCollapsed(!resultsCollapsed)
                                                }
                                                className="flex items-center justify-center -ml-1 h-7 w-7 rounded-md hover:bg-white/5 text-text-muted/60 transition-colors"
                                                title={resultsCollapsed ? "Expand" : "Collapse"}
                                             >
                                                <IconChevronDown
                                                   className={cn(
                                                      "h-4 w-4 transition-transform duration-200",
                                                      resultsCollapsed && "-rotate-90"
                                                   )}
                                                />
                                             </button>

                                             <div className="flex items-center ml-2 h-full gap-4">
                                                {[
                                                   { id: "results", label: "Results" },
                                                   { id: "messages", label: "Messages" },
                                                   { id: "stats", label: "Stats" },
                                                   { id: "plan", label: "Query Plan" },
                                                ].map(tab => {
                                                   const isActive = resultsActiveTab === tab.id
                                                   return (
                                                      <button
                                                         key={tab.id}
                                                         onClick={() =>
                                                            setResultsActiveTab(tab.id as any)
                                                         }
                                                         className={cn(
                                                            "relative flex items-center h-[26px] px-3 text-[13px] font-medium transition-all duration-150 rounded-md focus:outline-none select-none",
                                                            isActive
                                                               ? "text-white bg-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
                                                               : "text-text-muted/30 hover:text-text-muted/60 hover:bg-white/[0.03]"
                                                         )}
                                                      >
                                                         {tab.label}
                                                      </button>
                                                   )
                                                })}
                                             </div>
                                          </div>

                                          <div className="flex items-center gap-4">
                                             {/* Panel Metadata */}
                                             <div className="flex items-center gap-3">
                                                {activeTab?.result && (
                                                   <div className="flex items-center gap-1.5 text-[12.5px] font-medium select-none">
                                                      <span className="text-text-primary">{activeTab.result.rowCount} rows</span>
                                                      {activeTab.executionTimeMs !== undefined && (
                                                         <>
                                                            <span className="text-text-muted/30 pb-0.5">•</span>
                                                            <span className="text-text-secondary font-mono tracking-tight flex items-center gap-0.5">
                                                               {activeTab.executionTimeMs}
                                                               <span className="text-[10px] opacity-70">ms</span>
                                                            </span>
                                                         </>
                                                      )}
                                                   </div>
                                                )}
                                                {isExecuting && (
                                                   <div className="flex items-center gap-2 text-accent/80">
                                                      <div className="h-3 w-3 rounded-full border-[2px] border-accent/20 border-t-accent animate-spin" />
                                                      <span className="text-[12px] font-medium">
                                                         Running...
                                                      </span>
                                                   </div>
                                                )}
                                             </div>

                                             <div className="flex items-center gap-0.5">
                                                {activeTab?.result && (
                                                   <>
                                                      <div className="relative">
                                                         <button
                                                            onClick={() => setCopyDropdownOpen(!copyDropdownOpen)}
                                                            className={cn(
                                                               "h-7 flex items-center gap-1 px-1.5 rounded-md text-text-muted/60 hover:text-text-primary hover:bg-white/5 transition-all text-sm",
                                                               copyDropdownOpen && "bg-white/5 text-text-primary"
                                                            )}
                                                            title="Copy results"
                                                         >
                                                            <IconCopy className="h-4 w-4" />
                                                            <IconChevronDown className="h-3 w-3 opacity-60" />
                                                         </button>
                                                         
                                                         <AnimatePresence>
                                                            {copyDropdownOpen && (
                                                               <>
                                                                  <div 
                                                                     className="fixed inset-0 z-40" 
                                                                     onClick={() => setCopyDropdownOpen(false)} 
                                                                  />
                                                                  <motion.div
                                                                     initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                                                     animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                     exit={{ opacity: 0, scale: 0.95, y: 5 }}
                                                                     className="absolute right-0 bottom-full mb-2 w-48 py-1 rounded-lg bg-bg-secondary border border-border shadow-2xl z-50 overflow-hidden"
                                                                  >
                                                                     {["JSON", "CSV", "SQL", "TSV", "Markdown"].map(type => (
                                                                        <button
                                                                           key={type}
                                                                           onClick={() => {
                                                                              handleCopyResults(type === "CSV") // Temporary
                                                                              setCopyDropdownOpen(false)
                                                                           }}
                                                                           className="w-full text-left px-3 py-1.5 text-[13px] text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                                                                        >
                                                                           Copy as {type}
                                                                        </button>
                                                                     ))}
                                                                  </motion.div>
                                                               </>
                                                            )}
                                                         </AnimatePresence>
                                                      </div>

                                                      <div className="relative">
                                                         <button
                                                            onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                                                            className={cn(
                                                               "h-7 flex items-center gap-1 px-1.5 rounded-md text-text-muted/60 hover:text-text-primary hover:bg-white/5 transition-all text-sm",
                                                               exportDropdownOpen && "bg-white/5 text-text-primary"
                                                            )}
                                                            title="Export results"
                                                         >
                                                            <IconDownload className="h-4 w-4" />
                                                            <IconChevronDown className="h-3 w-3 opacity-60" />
                                                         </button>

                                                         <AnimatePresence>
                                                            {exportDropdownOpen && (
                                                               <>
                                                                  <div 
                                                                     className="fixed inset-0 z-40" 
                                                                     onClick={() => setExportDropdownOpen(false)} 
                                                                  />
                                                                  <motion.div
                                                                     initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                                                     animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                     exit={{ opacity: 0, scale: 0.95, y: 5 }}
                                                                     className="absolute right-0 bottom-full mb-2 w-48 py-1 rounded-lg bg-bg-secondary border border-border shadow-2xl z-50 overflow-hidden"
                                                                  >
                                                                     {["JSON", "CSV", "SQL", "TSV", "Markdown"].map(type => (
                                                                        <button
                                                                           key={type}
                                                                           onClick={() => setExportDropdownOpen(false)}
                                                                           className="w-full text-left px-3 py-1.5 text-[13px] text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                                                                        >
                                                                           Export as {type}
                                                                        </button>
                                                                     ))}
                                                                  </motion.div>
                                                               </>
                                                            )}
                                                         </AnimatePresence>
                                                      </div>
                                                   </>
                                                )}
                                                
                                                <button
                                                   onClick={handleClearResults}
                                                   className="h-7 w-7 flex items-center justify-center rounded-md text-text-muted/60 hover:text-error hover:bg-error/5 transition-all"
                                                   title="Clear results"
                                                >
                                                   <IconTrash className="h-3.5 w-3.5" />
                                                </button>
                                                
                                                <div className="w-px h-3.5 bg-border/20 mx-1" />
                                                
                                                <button
                                                   className="h-7 w-7 flex items-center justify-center rounded-md text-text-muted/60 hover:text-text-primary hover:bg-white/5 transition-all"
                                                   title="More options"
                                                >
                                                   <IconDotsVertical className="h-3.5 w-3.5" />
                                                </button>
                                                
                                                <button
                                                   onClick={() => setIsResultsMaximized(!isResultsMaximized)}
                                                   className={cn(
                                                      "h-7 w-7 flex items-center justify-center rounded-md transition-all",
                                                      isResultsMaximized 
                                                         ? "text-accent bg-accent/10" 
                                                         : "text-text-muted/60 hover:text-text-primary hover:bg-white/5"
                                                   )}
                                                   title={isResultsMaximized ? "Restore panel" : "Maximize panel"}
                                                >
                                                   {isResultsMaximized ? (
                                                      <IconMinimize className="h-4 w-4" />
                                                   ) : (
                                                      <IconMaximize className="h-4 w-4" />
                                                   )}
                                                </button>
                                             </div>
                                          </div>
                                       </div>
                                       {!resultsCollapsed && (
                                          <div className="flex-1 overflow-hidden z-0 relative">
                                             <ResultsPanel
                                                result={activeTab?.result || null}
                                                error={activeTab?.error || null}
                                                isExecuting={isExecuting}
                                                executionTimeMs={executionTimeMs}
                                                rowCount={activeTab?.result?.rowCount || null}
                                                activeTab={resultsActiveTab}
                                             />
                                          </div>
                                       )}
                                    </div>
                                 </motion.div>
                              ) : (
                                 <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.1 }}
                                    className="flex flex-col items-center justify-center h-full bg-bg-primary overflow-hidden"
                                 >
                                    <div className="flex flex-col items-center max-w-sm text-center">
                                       <div className="w-16 h-16 rounded-2xl bg-bg-secondary border border-border flex items-center justify-center mb-6 opacity-80">
                                          <svg
                                             xmlns="http://www.w3.org/2000/svg"
                                             width="28"
                                             height="28"
                                             viewBox="0 0 24 24"
                                             fill="none"
                                             stroke="currentColor"
                                             strokeWidth="1.5"
                                             strokeLinecap="round"
                                             strokeLinejoin="round"
                                             className="text-text-muted"
                                          >
                                             <path d="m18 16 4-4-4-4" />
                                             <path d="m6 8-4 4 4 4" />
                                             <path d="m14.5 4-5 16" />
                                          </svg>
                                       </div>
                                       <h2 className="text-[16px] font-semibold text-text-primary mb-2 tracking-wide">
                                          Ready to write queries
                                       </h2>
                                       <p className="text-[14px] text-text-muted mb-8 leading-relaxed">
                                          Start interacting with your database by creating a new
                                          query tab or using the command system.
                                       </p>

                                       <div className="flex flex-col gap-2 w-full max-w-[280px]">
                                          <button
                                             onClick={handleNewQuery}
                                             className="flex items-center justify-between w-full px-4 py-2.5 rounded-lg bg-bg-tertiary hover:bg-bg-quaternary border border-border/80 transition-colors group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                                          >
                                             <span className="text-[13px] font-medium text-text-secondary group-hover:text-text-primary">
                                                New Query Workspace
                                             </span>
                                             <div className="flex items-center gap-1 opacity-60">
                                                {isMac() ? (
                                                   <>
                                                      <kbd className="font-mono text-[11px] bg-bg-primary px-1.5 py-0.5 rounded shadow-sm border border-border/40">
                                                         ⌘
                                                      </kbd>
                                                      <kbd className="font-mono text-[11px] bg-bg-primary px-1.5 py-0.5 rounded shadow-sm border border-border/40">
                                                         N
                                                      </kbd>
                                                   </>
                                                ) : (
                                                   <kbd className="font-mono text-[11px] bg-bg-primary px-1.5 py-0.5 rounded shadow-sm border border-border/40">
                                                      Ctrl+N
                                                   </kbd>
                                                )}
                                             </div>
                                          </button>
                                          <button
                                             onClick={() => setPaletteOpen(true)}
                                             className="flex items-center justify-between w-full px-4 py-2.5 rounded-lg bg-bg-tertiary hover:bg-bg-quaternary border border-border/80 transition-colors group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                                          >
                                             <span className="text-[13px] font-medium text-text-secondary group-hover:text-text-primary">
                                                Global Search
                                             </span>
                                             <div className="flex items-center gap-1 opacity-60">
                                                {isMac() ? (
                                                   <>
                                                      <kbd className="font-mono text-[11px] bg-bg-primary px-1.5 py-0.5 rounded shadow-sm border border-border/40">
                                                         ⌘
                                                      </kbd>
                                                      <kbd className="font-mono text-[11px] bg-bg-primary px-1.5 py-0.5 rounded shadow-sm border border-border/40">
                                                         K
                                                      </kbd>
                                                   </>
                                                ) : (
                                                   <kbd className="font-mono text-[11px] bg-bg-primary px-1.5 py-0.5 rounded shadow-sm border border-border/40">
                                                      Ctrl+K
                                                   </kbd>
                                                )}
                                             </div>
                                          </button>
                                       </div>
                                    </div>
                                 </motion.div>
                              )}
                           </AnimatePresence>
                        </div>
                        <StatusBar
                           vimMode={vimEnabled ? vimMode : undefined}
                           dbType={selectedEnv?.dbType}
                        />
                     </div>
                  </div>
               </div>
            </div>
         ) : (
            <Dashboard />
         )}
         <CommandPalette
            isOpen={paletteOpen}
            onClose={() => setPaletteOpen(false)}
            onExecuteQuery={handleExecuteQuery}
            onClearResults={handleClearResults}
            onOpenTable={handleOpenTable}
            onOpenQuery={handleOpenQuery}
         />
         <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
         <ShortcutsDialog isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />

         {stuckEnvId && (
            <div
               className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
               onKeyDown={e => e.preventDefault()}
            >
               <div className="w-full max-w-md rounded-xl border border-border bg-bg-secondary p-8 shadow-2xl">
                  <div className="flex flex-col items-center text-center">
                     <div className="mb-5 h-14 w-14 rounded-full bg-warning/15 border border-warning/25 flex items-center justify-center">
                        <IconBomb className="h-6 w-6 text-warning" />
                     </div>
                     <h2 className="text-lg font-semibold text-text-primary mb-2">
                        Container Halted
                     </h2>
                     <p className="text-sm text-text-muted mb-1">
                        The database container for{" "}
                        <strong className="text-text-primary">
                           {selectedEnv?.name || selectedEnv?.dbType}
                        </strong>{" "}
                        is available but halted.
                     </p>
                     <p className="text-sm text-text-muted mb-6">
                        Would you like to restore it or nuke the environment?
                     </p>
                     <div className="flex gap-3 w-full">
                        <Button
                           variant="destructive"
                           size="default"
                           onClick={handleExitAndNuke}
                           className="flex-1 gap-2"
                        >
                           <IconBomb className="h-4 w-4" />
                           Exit &amp; Nuke
                        </Button>
                        <Button
                           variant="default"
                           size="default"
                           onClick={handleRestoreEnv}
                           className="flex-1 gap-2"
                        >
                           <IconPlayerPlay className="h-4 w-4" />
                           Restore
                        </Button>
                     </div>
                  </div>
               </div>
            </div>
         )}
         <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
               style: {
                  background: "var(--color-bg-secondary)",
                  color: "var(--color-text-primary)",
                  border: "1px solid var(--color-border)",
               },
            }}
         />
      </div>
   )
}

function App() {
   return (
      <QueryClientProvider client={queryClient}>
         <AppContent />
      </QueryClientProvider>
   )
}

export default App
