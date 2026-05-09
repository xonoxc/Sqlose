import { useState, useCallback, useEffect, useRef } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { ResizablePane } from "@sqlose/ui"
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
import {
   IconX, IconChevronRight, IconChevronDown,
   IconCopy, IconDownload, IconTrash,
} from "@tabler/icons-react"
import { cn } from "@sqlose/ui"

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
            <div className="flex h-full w-full bg-[#0c0c0c] text-text-primary overflow-hidden rounded-xl selection:bg-accent/30 font-sans border border-white/[0.07] shadow-2xl relative">
               <ResizablePane
                  className="flex-1 min-w-0"
                  left={
                     sidebarOpen ? (
                        <div className="flex flex-col h-full bg-[#111111] border-r border-[#1e1e1e]">
                           <AppSidebar
                              onSettingsOpen={() => setSettingsOpen(true)}
                              onClose={() => setSidebarOpen(false)}
                           />
                        </div>
                     ) : undefined
                  }
                  right={
                     <div className="flex flex-col h-full bg-[#0c0c0c] w-full relative">
                        {/* Top bar */}
                        <div className="h-9 flex items-center justify-between px-3 border-b border-[#1e1e1e] shrink-0 app-drag-region">
                           <div className="flex items-center gap-2 app-no-drag">
                              {!sidebarOpen && (
                                 <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="h-6 w-6 rounded flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-[#1a1a1a] transition-colors"
                                    aria-label="Open sidebar"
                                 >
                                    <ChevronRightIcon className="h-3.5 w-3.5" />
                                 </button>
                              )}
                              <span className="text-[10px] font-semibold tracking-wider text-text-muted uppercase border border-[#222] bg-[#161616] px-2 py-0.5 rounded">
                                 {selectedEnv?.dbType ?? "SQL"}
                              </span>
                           </div>

                           {/* Command palette trigger */}
                           <div className="flex-1 max-w-sm mx-3 app-no-drag">
                              <button
                                 onClick={() => setPaletteOpen(true)}
                                 className="w-full flex items-center gap-2 bg-[#111111] hover:bg-[#161616] border border-[#222] rounded px-3 py-1 text-[12px] text-text-muted transition-colors"
                              >
                                 <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                                 <span className="opacity-70">Commands...</span>
                                 <div className="ml-auto flex items-center gap-1 opacity-40">
                                    <kbd className="bg-[#1c1c1c] text-[9px] font-mono px-1 py-[1px] rounded border border-[#333]">⌘</kbd>
                                    <kbd className="bg-[#1c1c1c] text-[9px] font-mono px-1 py-[1px] rounded border border-[#333]">K</kbd>
                                 </div>
                              </button>
                           </div>

                           <div className="flex items-center gap-1 app-no-drag">
                              <button
                                 onClick={() => selectEnvironment(null)}
                                 className="h-6 w-6 rounded flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-[#1a1a1a] transition-colors"
                                 aria-label="Back to dashboard"
                              >
                                 <IconX className="h-3.5 w-3.5" />
                              </button>
                           </div>
                        </div>

                        {/* Tab bar */}
                        <div className="flex items-end h-8 border-b border-[#1e1e1e] bg-[#0c0c0c] px-1 shrink-0 w-full">
                           <TabBar />
                        </div>

                        {/* Editor + Results */}
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

                           {/* Resize divider */}
                           <div
                              className={cn(
                                 "h-[3px] cursor-row-resize shrink-0 relative z-10 flex items-center justify-center group transition-colors",
                                 isExecuting ? "bg-accent/30" : "bg-[#1e1e1e] hover:bg-accent/30"
                              )}
                              onMouseDown={handleResultsDividerMouseDown}
                           >
                              <div className="h-[1px] w-6 rounded-full bg-[#333] group-hover:bg-accent/50 transition-colors" />
                           </div>

                           {/* Results */}
                           <div
                              className={cn(
                                 "flex flex-col shrink-0 bg-[#0c0c0c]",
                                 resultsCollapsed && "overflow-hidden"
                              )}
                              style={{
                                 height: resultsCollapsed ? "32px" : `${paneSizes.resultsHeight}px`,
                                 minHeight: resultsCollapsed ? "32px" : `${RESULTS_MIN_HEIGHT}px`,
                              }}
                           >
                              {/* Results header */}
                              <div className="flex items-center justify-between px-3 py-1 border-b border-[#1e1e1e] shrink-0 bg-[#0c0c0c] min-h-[28px]">
                                 <div className="flex items-center gap-2">
                                    <button
                                       onClick={() => setResultsCollapsed(!resultsCollapsed)}
                                       className="h-5 w-5 flex items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-[#1a1a1a] transition-colors"
                                    >
                                       {resultsCollapsed ? <IconChevronRight className="h-3 w-3" /> : <IconChevronDown className="h-3 w-3" />}
                                    </button>
                                    <span className="text-[11px] font-medium text-text-muted">Results</span>
                                    {activeTab?.result && (
                                       <span className="text-[10px] text-text-muted/70 font-mono">
                                          {activeTab.result.rowCount} row{activeTab.result.rowCount !== 1 ? "s" : ""}
                                          {executionTimeMs !== null && ` · ${executionTimeMs}ms`}
                                       </span>
                                    )}
                                    {isExecuting && (
                                       <div className="flex items-center gap-1.5 text-accent">
                                          <div className="h-2.5 w-2.5 rounded-full border-[2px] border-accent border-t-transparent animate-spin" />
                                          <span className="text-[10px] font-mono">running</span>
                                       </div>
                                    )}
                                 </div>
                                 <div className="flex items-center gap-0.5">
                                    {activeTab?.result && (
                                       <>
                                          <button
                                             onClick={() => handleCopyResults(true)}
                                             className="h-5 px-1.5 flex items-center gap-1 rounded text-[10px] text-text-muted hover:text-text-primary hover:bg-[#1a1a1a] transition-colors"
                                             title="Copy results with headers"
                                          >
                                             <IconCopy className="h-3 w-3" />
                                             Copy
                                          </button>
                                          <button
                                             className="h-5 px-1.5 flex items-center gap-1 rounded text-[10px] text-text-muted hover:text-text-primary hover:bg-[#1a1a1a] transition-colors"
                                             title="Export results"
                                          >
                                             <IconDownload className="h-3 w-3" />
                                             Export
                                          </button>
                                          <button
                                             onClick={handleClearResults}
                                             className="h-5 w-5 flex items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-[#1a1a1a] transition-colors"
                                             title="Clear results"
                                          >
                                             <IconTrash className="h-3 w-3" />
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
