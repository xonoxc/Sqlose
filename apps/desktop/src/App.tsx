import { useState, useCallback, useEffect, useRef } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { ResizablePane, StatusBar, cn } from "@sqlose/ui"
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
} from "./components"
import { useEnvironmentStore } from "./stores/environmentStore"
import { useEditorStore } from "./stores/editorStore"
import { useWorkspaceStore } from "./stores/workspaceStore"
import { useSettingsStore } from "./stores/settingsStore"
import {
   IconX, IconChevronRight, IconChevronDown,
   IconCopy, IconDownload, IconTrash,
} from "@tabler/icons-react"

async function copyResultsToClipboard(result: QueryResult, withHeaders: boolean) {
   const headers = result.columns.join("\t")
   const rows = result.rows.map(r =>
      result.columns.map(c => {
         const v = r[c]
         return v === null ? "NULL" : String(v)
      }).join("\t")
   ).join("\n")
   const text = withHeaders ? `${headers}\n${rows}` : rows
   try {
      await navigator.clipboard.writeText(text)
   } catch {
      const ta = document.createElement("textarea")
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
   }
}

function AppContent() {
   const [sidebarOpen, setSidebarOpen] = useState(true)
   const [paletteOpen, setPaletteOpen] = useState(false)
   const [settingsOpen, setSettingsOpen] = useState(false)
   const [executingTabId, setExecutingTabId] = useState<string | null>(null)
   const [executionTimeMs, setExecutionTimeMs] = useState<number | null>(null)
   const [resultsCollapsed, setResultsCollapsed] = useState(false)
   const prevExecutionRef = useRef<number>(0)

   const fetchEnvironments = useEnvironmentStore(s => s.fetchEnvironments)
   const selectedEnvironmentId = useEnvironmentStore(s => s.selectedEnvironmentId)
   const selectEnvironment = useEnvironmentStore(s => s.selectEnvironment)
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

   const RESULTS_MIN_HEIGHT = 80
   const RESULTS_MAX_HEIGHT = 800

   useEffect(() => {
      fetchEnvironments()
   }, [fetchEnvironments])

   useEffect(() => {
      if (activeTab) {
         setQueryDraft(activeTab.query)
      }
   }, [activeTabId])

   const handleNewQuery = useCallback(() => {
      const result = openTab()
      if (result.isOk()) {
         setQueryDraft("")
      }
   }, [openTab, setQueryDraft])

   const handleCloseTab = useCallback(() => {
      if (activeTabId) {
         closeTab(activeTabId)
      }
   }, [activeTabId, closeTab])

   const handleSwitchTab = useCallback((direction: 1 | -1) => {
      const currentIndex = tabs.findIndex(t => t.id === activeTabId)
      if (currentIndex === -1) return
      const nextIndex = (currentIndex + direction + tabs.length) % tabs.length
      if (nextIndex !== currentIndex) {
         setActiveTab(tabs[nextIndex].id)
      }
   }, [tabs, activeTabId, setActiveTab])

   const handleExecuteQuery = useCallback(async () => {
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

      setExecutionTimeMs(elapsed)
      setExecutingTabId(null)

      if (result.isOk()) {
         const qr = result.value
         updateTab(activeTabId, {
            isExecuting: false,
            result: qr,
            error: null,
            isDirty: false,
         })
      } else {
         updateTab(activeTabId, {
            isExecuting: false,
            result: null,
            error: result.error.message,
         })
      }
   }, [selectedEnvironmentId, queryDraft, activeTabId, updateTab])

   const isExecuting = executingTabId === activeTabId

   const handleQueryChange = useCallback((value: string) => {
      setQueryDraft(value)
      if (activeTabId) {
         updateTab(activeTabId, { query: value, isDirty: true })
      }
   }, [activeTabId, updateTab, setQueryDraft])

   const handleClearResults = useCallback(() => {
      if (activeTabId) {
         updateTab(activeTabId, { result: null, error: null })
         setExecutionTimeMs(null)
      }
   }, [activeTabId, updateTab])

   const handleCopyResults = useCallback((withHeaders: boolean) => {
      if (activeTab?.result) {
         copyResultsToClipboard(activeTab.result, withHeaders)
      }
   }, [activeTab])

   const handleResultsDividerMouseDown = useCallback((e: React.MouseEvent) => {
      e.preventDefault()
      const startY = e.clientY
      const startHeight = paneSizes.resultsHeight

      const handleMouseMove = (moveE: MouseEvent) => {
         const delta = startY - moveE.clientY
         const newHeight = Math.max(RESULTS_MIN_HEIGHT, Math.min(RESULTS_MAX_HEIGHT, startHeight + delta))
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
   }, [paneSizes.resultsHeight, updatePaneSizes])

   useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
         const meta = e.metaKey || e.ctrlKey

         if (meta && e.key === "k") {
            e.preventDefault()
            setPaletteOpen(true)
            return
         }

         if (meta && e.key === "Enter") {
            e.preventDefault()
            handleExecuteQuery()
            return
         }

         if (meta && !e.shiftKey && e.key === "n") {
            e.preventDefault()
            handleNewQuery()
            return
         }

         if (meta && e.key === "w") {
            e.preventDefault()
            handleCloseTab()
            return
         }

         if (meta && e.key === "Tab") {
            e.preventDefault()
            handleSwitchTab(e.shiftKey ? -1 : 1)
            return
         }
      }

      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
   }, [handleExecuteQuery, handleNewQuery, handleCloseTab, handleSwitchTab])

   const selectedEnv = selectedEnvironmentId
      ? environments.find(e => e.id === selectedEnvironmentId) ?? null
      : null

   return (
      <div className="h-screen w-screen overflow-hidden bg-transparent p-2">
         {selectedEnvironmentId ? (
            <div className="flex h-full w-full bg-bg-primary text-text-primary overflow-hidden rounded-xl selection:bg-accent/30 font-sans border border-white/[0.07] shadow-2xl relative">
               <ResizablePane
                  className="flex-1 min-w-0"
                  left={
                     sidebarOpen ? (
                        <div className="flex flex-col h-full bg-bg-secondary border-r border-border shadow-[4px_0_24px_rgba(0,0,0,0.2)] z-30">
                           <AppSidebar
                              onSettingsOpen={() => setSettingsOpen(true)}
                              onClose={() => setSidebarOpen(false)}
                           />
                        </div>
                     ) : undefined
                  }
                  right={
                     <div className="flex flex-col h-full bg-bg-primary w-full relative">
                        {/* Top bar */}
                        <div className="h-10 flex items-center justify-between px-3 border-b border-border bg-bg-secondary shrink-0 app-drag-region shadow-[0_1px_12px_rgba(0,0,0,0.2)] z-20 relative">
                           <div className="flex items-center gap-2 app-no-drag">
                              {!sidebarOpen && (
                                 <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="h-6 w-6 rounded flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-quaternary transition-colors"
                                    aria-label="Open sidebar"
                                 >
                                    <ChevronRightIcon className="h-3.5 w-3.5" />
                                 </button>
                              )}
                              <span className="text-[10px] font-semibold tracking-wider text-text-muted uppercase border border-border bg-bg-tertiary px-2 py-0.5 rounded shadow-sm">
                                 {selectedEnv?.dbType ?? "SQL"}
                              </span>
                           </div>

                           {/* Command palette trigger */}
                           <div className="flex-1 max-w-md mx-4 app-no-drag">
                              <button
                                 onClick={() => setPaletteOpen(true)}
                                 className="w-full flex items-center gap-2.5 bg-bg-tertiary hover:bg-bg-quaternary border border-border shadow-inner rounded-md px-3 py-1.5 text-[12px] text-text-muted transition-all"
                              >
                                 <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                                 <span className="opacity-80 font-medium">Search commands...</span>
                                 <div className="ml-auto flex items-center gap-1 opacity-50">
                                    <kbd className="bg-bg-primary text-[10px] font-mono px-1.5 py-[2px] rounded border border-border/60 shadow-sm leading-none shrink-0">⌘</kbd>
                                    <kbd className="bg-bg-primary text-[10px] font-mono px-1.5 py-[2px] rounded border border-border/60 shadow-sm leading-none shrink-0">K</kbd>
                                 </div>
                              </button>
                           </div>

                           <div className="flex items-center gap-1 app-no-drag">
                              <button
                                 onClick={() => selectEnvironment(null)}
                                 className="h-7 w-7 rounded flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-quaternary transition-colors"
                                 aria-label="Back to dashboard"
                              >
                                 <IconX className="h-4 w-4" />
                              </button>
                           </div>
                        </div>

                        {/* Tab bar */}
                        <div className="flex items-end h-9 border-b border-border bg-bg-secondary px-1 shrink-0 w-full z-10 relative shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                           <TabBar />
                        </div>

                        {/* Editor + Results */}
                        {activeTabId ? (
                           <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                              {/* Editor */}
                              <div className="flex-1 flex flex-col min-h-0">
                                 <SQLEditor
                                    value={queryDraft}
                                    onChange={handleQueryChange}
                                    onExecute={handleExecuteQuery}
                                    onSettingsOpen={() => setSettingsOpen(true)}
                                    isExecuting={isExecuting}
                                    executionTimeMs={executionTimeMs}
                                 />
                              </div>

                              {/* Boundary Resize Layer */}
                              <div
                                 className="h-[4px] -mb-[4px] cursor-row-resize shrink-0 relative z-30 group transition-colors flex items-center justify-center select-none"
                                 onMouseDown={handleResultsDividerMouseDown}
                              >
                                 <div className={cn(
                                    "absolute inset-x-0 top-0 h-[1px] w-full transition-colors",
                                    isExecuting ? "bg-accent/40" : "bg-transparent group-hover:bg-accent/30"
                                 )} />
                                 <div className={cn(
                                    "h-[2px] w-12 rounded-full absolute transition-opacity opacity-0 group-hover:opacity-100",
                                    isExecuting ? "bg-accent" : "bg-accent/60"
                                 )} />
                              </div>

                              {/* Results Panel */}
                              <div
                                 className={cn(
                                    "flex flex-col shrink-0 bg-bg-primary shadow-[0_-8px_30px_rgba(0,0,0,0.5)] relative z-20 border-t border-border/80",
                                    resultsCollapsed && "overflow-hidden"
                                 )}
                                 style={{
                                    height: resultsCollapsed ? "34px" : `${paneSizes.resultsHeight}px`,
                                    minHeight: resultsCollapsed ? "34px" : `${RESULTS_MIN_HEIGHT}px`,
                                 }}
                              >
                                 {/* Dedicated Results Header */}
                                 <div className="flex items-center justify-between px-3 py-1.5 bg-bg-tertiary shrink-0 border-b border-border/60">
                                    <div className="flex items-center gap-3">
                                       <button
                                          onClick={() => setResultsCollapsed(!resultsCollapsed)}
                                          className="flex items-center gap-1.5 rounded text-text-muted hover:text-text-primary transition-colors pr-1"
                                       >
                                          <div className="h-5 w-5 bg-bg-secondary border border-border/40 rounded flex items-center justify-center shadow-sm">
                                             {resultsCollapsed ? <IconChevronRight className="h-3.5 w-3.5" /> : <IconChevronDown className="h-3.5 w-3.5" />}
                                          </div>
                                          <span className="text-[12px] font-semibold tracking-wide text-text-primary">Results</span>
                                       </button>
                                       
                                       {activeTab?.result && (
                                          <div className="flex items-center gap-2 text-[11px] text-text-muted/80 font-sans tracking-wide border-l border-border/60 pl-3">
                                             <span>{activeTab.result.rowCount} row{activeTab.result.rowCount !== 1 ? "s" : ""}</span>
                                             {executionTimeMs !== null && (
                                                <>
                                                   <span className="opacity-40">•</span>
                                                   <span className="font-mono text-[10px]">{executionTimeMs}ms</span>
                                                </>
                                             )}
                                          </div>
                                       )}
                                       {isExecuting && (
                                          <div className="flex items-center gap-1.5 text-accent border-l border-border/60 pl-3">
                                             <div className="h-3 w-3 rounded-full border-[2px] border-accent/30 border-t-accent animate-spin" />
                                             <span className="text-[11px] font-medium tracking-wide">Executing</span>
                                          </div>
                                       )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                       {activeTab?.result && (
                                          <>
                                             <button
                                                onClick={() => handleCopyResults(true)}
                                                className="h-6 px-2 flex items-center gap-1.5 rounded text-[11px] font-medium text-text-muted hover:text-text-primary hover:bg-bg-quaternary transition-colors"
                                                title="Copy results with headers"
                                             >
                                                <IconCopy className="h-3.5 w-3.5 opacity-70" />
                                                Copy
                                             </button>
                                             <button
                                                className="h-6 px-2 flex items-center gap-1.5 rounded text-[11px] font-medium text-text-muted hover:text-text-primary hover:bg-bg-quaternary transition-colors"
                                                title="Export results"
                                             >
                                                <IconDownload className="h-3.5 w-3.5 opacity-70" />
                                                Export
                                             </button>
                                             <div className="w-[1px] h-3.5 bg-border/80 mx-1" />
                                             <button
                                                onClick={handleClearResults}
                                                className="h-6 w-6 flex items-center justify-center rounded text-text-muted hover:text-error hover:bg-error/10 transition-colors"
                                                title="Clear results"
                                             >
                                                <IconTrash className="h-3.5 w-3.5 opacity-70" />
                                             </button>
                                          </>
                                       )}
                                    </div>
                                 </div>
                                 {!resultsCollapsed && (
                                    <div className="flex-1 overflow-hidden z-0 relative">
                                       <ResultsPanel
                                          result={activeTab?.result ?? null}
                                          error={activeTab?.error ?? null}
                                          isExecuting={isExecuting}
                                       />
                                    </div>
                                 )}
                              </div>
                           </div>
                        ) : (
                           <div className="flex-1 flex flex-col items-center justify-center min-h-0 bg-bg-primary overflow-hidden">
                              <div className="flex flex-col items-center max-w-sm text-center">
                                 <div className="w-16 h-16 rounded-2xl bg-bg-secondary border border-border shadow-2xl flex items-center justify-center mb-6 opacity-80">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>
                                 </div>
                                 <h2 className="text-[15px] font-semibold text-text-primary mb-2 tracking-wide">Ready to write queries</h2>
                                 <p className="text-[13px] text-text-muted mb-8 leading-relaxed">Start interacting with your database by creating a new query tab or using the command system.</p>
                                 
                                 <div className="flex flex-col gap-2 w-full max-w-[280px]">
                                    <button 
                                       onClick={handleNewQuery}
                                       className="flex items-center justify-between w-full px-4 py-2.5 rounded-lg bg-bg-tertiary hover:bg-bg-quaternary border border-border/80 transition-colors group"
                                    >
                                       <span className="text-[12px] font-medium text-text-secondary group-hover:text-text-primary">New Query Workspace</span>
                                       <div className="flex items-center gap-1 opacity-60">
                                          <kbd className="font-mono text-[10px] bg-bg-primary px-1.5 py-0.5 rounded shadow-sm border border-border/40">⌘</kbd>
                                          <kbd className="font-mono text-[10px] bg-bg-primary px-1.5 py-0.5 rounded shadow-sm border border-border/40">N</kbd>
                                       </div>
                                    </button>
                                    <button 
                                       onClick={() => setPaletteOpen(true)}
                                       className="flex items-center justify-between w-full px-4 py-2.5 rounded-lg bg-bg-tertiary hover:bg-bg-quaternary border border-border/80 transition-colors group"
                                    >
                                       <span className="text-[12px] font-medium text-text-secondary group-hover:text-text-primary">Global Search</span>
                                       <div className="flex items-center gap-1 opacity-60">
                                          <kbd className="font-mono text-[10px] bg-bg-primary px-1.5 py-0.5 rounded shadow-sm border border-border/40">⌘</kbd>
                                          <kbd className="font-mono text-[10px] bg-bg-primary px-1.5 py-0.5 rounded shadow-sm border border-border/40">K</kbd>
                                       </div>
                                    </button>
                                 </div>
                              </div>
                           </div>
                        )}
                        <StatusBar 
                           vimMode={vimEnabled ? vimMode : undefined} 
                           dbType={selectedEnv?.dbType}
                        />
                     </div>
                  }
                  defaultLeftWidth={paneSizes.sidebarWidth}
                  minLeftWidth={200}
                  maxLeftWidth={400}
                  onResize={w => updatePaneSizes({ sidebarWidth: w })}
               />
            </div>
         ) : (
            <Dashboard />
         )}
         <CommandPalette
            isOpen={paletteOpen}
            onClose={() => setPaletteOpen(false)}
            onExecuteQuery={handleExecuteQuery}
            onClearResults={handleClearResults}
         />
         <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </div>
   )
}

function ChevronRightIcon({ className }: { className?: string }) {
   return (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
         <path d="m9 18 6-6-6-6" />
      </svg>
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
