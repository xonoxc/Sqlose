import { useState, useEffect } from "react"
import { Toaster } from "sonner"
import { QueryClientProvider } from "@tanstack/react-query"
import { motion, AnimatePresence } from "motion/react"
import { StatusBar, cn } from "@sqlose/ui"
import { queryClient } from "./lib/query/queryClient"
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
   TopBar,
   EmptyWorkspace,
   ResultsPanelHeader,
   ContainerHaltedDialog,
   ErrorBoundary,
} from "./components"
import {
   useEditorStore,
   useWorkspaceStore,
   useSettingsStore,
   useEnvironmentStore,
   useDatabaseStore,
   useHistoryStore,
   useSavedQueriesStore,
   useThemeStore,
} from "./stores"
import { useQueryExecution } from "./hooks/useQueryExecution"
import { isMac } from "./lib/types"

function AppContent() {
   const [sidebarOpen] = useState(true)
   const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
   const [paletteOpen, setPaletteOpen] = useState(false)
   const [settingsOpen, setSettingsOpen] = useState(false)
   const [shortcutsOpen, setShortcutsOpen] = useState(false)
   const [resultsCollapsed, setResultsCollapsed] = useState(false)
   const [resultsActiveTab, setResultsActiveTab] = useState<"results" | "messages" | "stats" | "plan">("results")
   const [isResultsMaximized, setIsResultsMaximized] = useState(false)
   const [stuckEnvId, setStuckEnvId] = useState<string | null>(null)

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
   const setActiveTab = useWorkspaceStore(s => s.setActiveTab)
   const paneSizes = useWorkspaceStore(s => s.paneSizes)
   const updatePaneSizes = useWorkspaceStore(s => s.updatePaneSizes)

   const loadHistory = useHistoryStore(s => s.loadHistory)
   const loadQueries = useSavedQueriesStore(s => s.loadQueries)
   const clearActiveTable = useDatabaseStore(s => s.setActiveTable)
   useThemeStore()

   const selectedEnv = selectedEnvironmentId
      ? (environments.find(e => e.id === selectedEnvironmentId) ?? null)
      : null

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

   const { execute } = useQueryExecution()
   const isExecuting = activeTab?.isExecuting ?? false

   const handleNewQuery = () => {
      const result = openTab()
      if (result.isOk()) {
         setQueryDraft("")
      }
   }

   const handleQueryChange = (value: string) => {
      setQueryDraft(value)
      if (activeTabId) {
         updateTab(activeTabId, { query: value, isDirty: true })
      }
   }

   const handleClearResults = () => {
      if (activeTabId) {
         updateTab(activeTabId, { result: null, error: null })
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

   useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
         if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
            e.preventDefault()
            setShortcutsOpen(true)
            return
         }

         const mod = isMac() ? e.metaKey : e.ctrlKey
         if (!mod) return

         if (e.key === "k") {
            e.preventDefault()
            setPaletteOpen(true)
            return
         }

         if (e.key === "Enter") {
            e.preventDefault()
            execute()
            return
         }

         if (!e.shiftKey && e.key === "n") {
            e.preventDefault()
            const result = useWorkspaceStore.getState().openTab()
            if (result.isOk()) {
               useEditorStore.getState().setQueryDraft("")
            }
            return
         }

         if (e.key === "w") {
            e.preventDefault()
            const id = useWorkspaceStore.getState().activeTabId
            if (id) {
               useWorkspaceStore.getState().closeTab(id)
            }
            return
         }

         if (e.key === "Tab") {
            e.preventDefault()
            const { tabs, activeTabId } = useWorkspaceStore.getState()
            const currentIndex = tabs.findIndex(t => t.id === activeTabId)
            if (currentIndex === -1) return
            const nextIndex = (currentIndex + (e.shiftKey ? -1 : 1) + tabs.length) % tabs.length
            if (nextIndex !== currentIndex) {
               useWorkspaceStore.getState().setActiveTab(tabs[nextIndex].id)
            }
            return
         }
      }

      document.addEventListener("keydown", handleKeyDown, true)
      return () => document.removeEventListener("keydown", handleKeyDown, true)
   }, [execute])

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
                        <TopBar
                           onOpenPalette={() => setPaletteOpen(true)}
                           onBackToDashboard={() => selectEnvironment(null)}
                        />

                        <div className="flex items-end border-b border-border/20 bg-bg-secondary/40 px-3 py-0.5 shrink-0 w-full z-10 relative min-h-[52px]">
                           <TabBar />
                        </div>

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
                                    {!isResultsMaximized && (
                                       <div className="flex-1 flex flex-col min-h-0">
                                          <SQLEditor
                                             value={queryDraft}
                                             onChange={handleQueryChange}
                                             onExecute={execute}
                                             onSettingsOpen={() => setSettingsOpen(true)}
                                             onCommandMode={() => setPaletteOpen(true)}
                                             isExecuting={isExecuting}
                                             executionTimeMs={activeTab?.executionTimeMs || null}
                                          />
                                       </div>
                                    )}

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

                                    <div
                                       className={cn(
                                          "flex flex-col relative z-20 transition-all duration-200",
                                          isResultsMaximized
                                             ? "flex-1 h-full border-t-0"
                                             : "shrink-0 bg-bg-primary shadow-[0_-4px_20px_rgba(0,0,0,0.35)] border-t border-border/60",
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
                                       <ResultsPanelHeader
                                          activeTab={activeTab}
                                          isExecuting={isExecuting}
                                          resultsActiveTab={resultsActiveTab}
                                          onResultsActiveTabChange={setResultsActiveTab}
                                          resultsCollapsed={resultsCollapsed}
                                          onToggleCollapse={() => setResultsCollapsed(!resultsCollapsed)}
                                          isResultsMaximized={isResultsMaximized}
                                          onToggleMaximize={() => setIsResultsMaximized(!isResultsMaximized)}
                                          onClearResults={handleClearResults}
                                       />
                                       {!resultsCollapsed && (
                                          <div className="flex-1 overflow-hidden z-0 relative">
                                             <ResultsPanel
                                                result={activeTab?.result || null}
                                                error={activeTab?.error || null}
                                                isExecuting={isExecuting}
                                                executionTimeMs={activeTab?.executionTimeMs || null}
                                                rowCount={activeTab?.result?.rowCount || null}
                                                activeTab={resultsActiveTab}
                                             />
                                          </div>
                                       )}
                                    </div>
                                 </motion.div>
                              ) : (
                                 <EmptyWorkspace
                                    onNewQuery={handleNewQuery}
                                    onOpenPalette={() => setPaletteOpen(true)}
                                 />
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
            onExecuteQuery={execute}
            onClearResults={handleClearResults}
            onOpenTable={handleOpenTable}
            onOpenQuery={handleOpenQuery}
         />
         <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
         <ShortcutsDialog isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />

         {stuckEnvId && (
            <ContainerHaltedDialog
               envName={selectedEnv?.name || selectedEnv?.dbType || "Unknown"}
               onRestore={handleRestoreEnv}
               onNuke={handleExitAndNuke}
            />
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
         <ErrorBoundary>
            <AppContent />
         </ErrorBoundary>
      </QueryClientProvider>
   )
}

export default App
