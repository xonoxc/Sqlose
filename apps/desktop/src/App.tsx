import { useEffect } from "react"
import { Toaster } from "sonner"
import { QueryClientProvider } from "@tanstack/react-query"
import { StatusBar } from "@sqlose/ui"
import { queryClient } from "~/lib/query/queryClient"
import {
   TabBar,
   AppSidebar,
   CommandPalette,
   SettingsPanel,
   Dashboard,
   ShortcutsDialog,
   TopBar,
   ContainerHaltedDialog,
   ErrorBoundary,
   EditorWorkspace,
} from "~/components"
import {
   useEditorStore,
   useWorkspaceStore,
   useSettingsStore,
   useEnvironmentStore,
   useDatabaseStore,
   useHistoryStore,
   useSavedQueriesStore,
   useThemeStore,
} from "~/stores"
import { useAppUIState } from "~/hooks/useAppUIState"
import { useResizeHandler } from "~/hooks/useResizeHandler"
import { useContainerHalted } from "~/hooks/useContainerHalted"
import { useKeyboardShortcuts } from "~/hooks/useKeyboardShortcuts"
import { useWorkspaceActions } from "~/hooks/useWorkspaceActions"

const RESULTS_MIN_HEIGHT = 80
const RESULTS_MAX_HEIGHT = 800
const SIDEBAR_MIN_WIDTH = 200
const SIDEBAR_MAX_WIDTH = 400

function AppContent() {
   const ui = useAppUIState()
   const workspace = useWorkspaceActions()
   const { stuckEnvId, stuckEnv, handleRestoreEnv, handleExitAndNuke } = useContainerHalted()

   const vimEnabled = useSettingsStore(s => s.vimModeEnabled)
   const vimMode = useEditorStore(s => s.vimMode)
   const paneSizes = useWorkspaceStore(s => s.paneSizes)
   const updatePaneSizes = useWorkspaceStore(s => s.updatePaneSizes)
   const selectedEnvironmentId = useEnvironmentStore(s => s.selectedEnvironmentId)
   const selectEnvironment = useEnvironmentStore(s => s.selectEnvironment)
   const fetchEnvironments = useEnvironmentStore(s => s.fetchEnvironments)
   const loadHistory = useHistoryStore(s => s.loadHistory)
   const loadQueries = useSavedQueriesStore(s => s.loadQueries)
   const clearActiveTable = useDatabaseStore(s => s.setActiveTable)
   const uiScale = useSettingsStore(s => s.uiScale)
   const tableFontSize = useSettingsStore(s => s.tableFontSize)
   useThemeStore()

   useEffect(() => {
      const root = document.documentElement
      root.style.setProperty("--app-ui-scale", String(uiScale))
      root.style.setProperty("--app-table-font-size", `${tableFontSize}px`)
   }, [uiScale, tableFontSize])

   const resultsResize = useResizeHandler({
      axis: "y",
      min: RESULTS_MIN_HEIGHT,
      max: RESULTS_MAX_HEIGHT,
      onResize: v => updatePaneSizes({ resultsHeight: v }),
   })
   const sidebarResize = useResizeHandler({
      axis: "x",
      min: SIDEBAR_MIN_WIDTH,
      max: SIDEBAR_MAX_WIDTH,
      onResize: v => updatePaneSizes({ sidebarWidth: v }),
   })

   useKeyboardShortcuts({
      onShortcuts: ui.openShortcuts,
      onPalette: ui.openPalette,
      onExecute: workspace.execute,
   })

   useEffect(() => {
      fetchEnvironments()
      loadHistory()
      loadQueries()
   }, [fetchEnvironments, loadHistory, loadQueries])

   useEffect(() => {
      if (workspace.activeTab) {
         if (workspace.activeTab.tableName) {
            clearActiveTable(workspace.activeTab.tableName)
         } else {
            clearActiveTable(null)
            workspace.setQueryDraft(workspace.activeTab.query)
         }
      }
   }, [workspace.activeTabId])

   return (
      <div className="h-screen w-screen overflow-hidden bg-bg-primary">
         {selectedEnvironmentId ? (
            <div className="flex h-full w-full bg-bg-primary text-text-primary font-sans overflow-hidden relative">
               <div className="flex-1 min-w-0 flex">
                  {ui.sidebarOpen && (
                     <div
                        style={{ width: ui.sidebarCollapsed ? 56 : paneSizes.sidebarWidth }}
                        className="flex flex-col h-full bg-bg-secondary border-r border-border/80 overflow-hidden shrink-0 transition-all duration-150"
                     >
                        <AppSidebar
                           onSettingsOpen={ui.openSettings}
                           onOpenTable={workspace.handleOpenTable}
                           onOpenQuery={workspace.handleOpenQuery}
                           collapsed={ui.sidebarCollapsed}
                           onToggleCollapse={ui.toggleSidebarCollapse}
                        />
                     </div>
                  )}
                  {ui.sidebarOpen && !ui.sidebarCollapsed && (
                     <div
                        className="relative w-0.4 cursor-col-resize bg-transparent hover:bg-accent/30 transition-colors shrink-0"
                        onMouseDown={e => sidebarResize.handleMouseDown(e, paneSizes.sidebarWidth)}
                     >
                        <div className="absolute inset-y-0 -left-1 -right-1" />
                     </div>
                  )}
                  <div className="flex-1 min-w-0 overflow-hidden">
                     <div className="flex flex-col h-full bg-bg-primary w-full relative py-1">
                        <TopBar
                           onOpenPalette={ui.openPalette}
                           onBackToDashboard={() => selectEnvironment(null)}
                        />
                        <div className="flex items-end border-b border-border/20 bg-bg-secondary/40 px-3 py-0.5 shrink-0 w-full z-10 relative min-h-[52px]">
                           <TabBar />
                        </div>
                        <div className="flex-1 min-h-0 overflow-hidden">
                           <EditorWorkspace
                              activeTabId={workspace.activeTabId}
                              activeTab={workspace.activeTab}
                              queryDraft={workspace.queryDraft}
                              isExecuting={workspace.isExecuting}
                              onQueryChange={workspace.handleQueryChange}
                              onExecute={workspace.execute}
                              onSettingsOpen={ui.openSettings}
                              onPaletteOpen={ui.openPalette}
                              onNewQuery={workspace.handleNewQuery}
                              onClearResults={workspace.handleClearResults}
                              isResultsMaximized={ui.isResultsMaximized}
                              resultsCollapsed={ui.resultsCollapsed}
                              resultsActiveTab={ui.resultsActiveTab}
                              onResultsActiveTabChange={ui.setResultsActiveTab}
                              onToggleResultsCollapse={ui.toggleResultsCollapse}
                              onToggleResultsMaximize={ui.toggleResultsMaximize}
                              resultsHeight={paneSizes.resultsHeight}
                              resultsMinHeight={RESULTS_MIN_HEIGHT}
                              onResultsDividerMouseDown={e =>
                                 resultsResize.handleMouseDown(e, paneSizes.resultsHeight)
                              }
                           />
                        </div>
                        <StatusBar
                           vimMode={vimEnabled ? vimMode : undefined}
                           dbType={workspace.selectedEnv?.dbType}
                        />
                     </div>
                  </div>
               </div>
            </div>
         ) : (
            <Dashboard />
         )}
         <CommandPalette
            isOpen={ui.paletteOpen}
            onClose={ui.closePalette}
            onExecuteQuery={workspace.execute}
            onClearResults={workspace.handleClearResults}
            onOpenTable={workspace.handleOpenTable}
            onOpenQuery={workspace.handleOpenQuery}
         />
         <SettingsPanel isOpen={ui.settingsOpen} onClose={ui.closeSettings} />
         <ShortcutsDialog isOpen={ui.shortcutsOpen} onClose={ui.closeShortcuts} />
         {stuckEnvId && (
            <ContainerHaltedDialog
               envName={stuckEnv?.name || stuckEnv?.dbType || "Unknown"}
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
