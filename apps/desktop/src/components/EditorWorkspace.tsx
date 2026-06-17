import { motion, AnimatePresence } from "motion/react"
import { cn } from "@sqlose/ui"
import {
   SQLEditor,
   ResultsPanelHeader,
   ResultsPanel,
   EmptyWorkspace,
   SchemaDiagram,
   TableBrowser,
} from "."
import type { Tab } from "~/lib/types"
import type { ResultsTab } from "~/hooks/useAppUIState"

interface EditorWorkspaceProps {
   activeTabId: string | null
   activeTab: Tab | undefined
   queryDraft: string
   isExecuting: boolean
   onQueryChange: (v: string) => void
   onExecute: () => Promise<boolean>
   onSettingsOpen: () => void
   onPaletteOpen: () => void
   onNewQuery: () => void
   onClearResults: () => void
   isResultsMaximized: boolean
   resultsCollapsed: boolean
   resultsActiveTab: ResultsTab
   onResultsActiveTabChange: (tab: ResultsTab) => void
   onToggleResultsCollapse: () => void
   onToggleResultsMaximize: () => void
   resultsHeight: number
   resultsMinHeight: number
   onResultsDividerMouseDown: (e: React.MouseEvent) => void
}

export function EditorWorkspace({
   activeTabId,
   activeTab,
   queryDraft,
   isExecuting,
   onQueryChange,
   onExecute,
   onSettingsOpen,
   onPaletteOpen,
   onNewQuery,
   onClearResults,
   isResultsMaximized,
   resultsCollapsed,
   resultsActiveTab,
   onResultsActiveTabChange,
   onToggleResultsCollapse,
   onToggleResultsMaximize,
   resultsHeight,
   resultsMinHeight,
   onResultsDividerMouseDown,
}: EditorWorkspaceProps) {
   return (
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
                        onChange={onQueryChange}
                        onExecute={onExecute}
                        onSettingsOpen={onSettingsOpen}
                        onCommandMode={onPaletteOpen}
                        isExecuting={isExecuting}
                        executionTimeMs={activeTab?.executionTimeMs || null}
                     />
                  </div>
               )}

               {!isResultsMaximized && (
                  <div
                     className="h-[3px] -mb-[3px] cursor-row-resize shrink-0 relative z-30 group transition-colors flex items-center justify-center select-none"
                     onMouseDown={onResultsDividerMouseDown}
                  >
                     <div
                        className={cn(
                           "absolute inset-x-0 top-0 h-[1px] w-full transition-colors",
                           isExecuting ? "bg-accent/40" : "bg-transparent group-hover:bg-accent/25"
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
                        : "shrink-0 bg-bg-results shadow-[0_-4px_10px_rgba(0,0,0,0.35)] border-t border-border/60",
                     resultsCollapsed && !isResultsMaximized && "overflow-hidden"
                  )}
                  style={{
                     height: isResultsMaximized
                        ? "100%"
                        : resultsCollapsed
                          ? "34px"
                          : `${resultsHeight}px`,
                     minHeight: isResultsMaximized
                        ? "100%"
                        : resultsCollapsed
                          ? "34px"
                          : `${resultsMinHeight}px`,
                  }}
               >
                  <ResultsPanelHeader
                     activeTab={activeTab}
                     isExecuting={isExecuting}
                     resultsActiveTab={resultsActiveTab}
                     onResultsActiveTabChange={onResultsActiveTabChange}
                     resultsCollapsed={resultsCollapsed}
                     onToggleCollapse={onToggleResultsCollapse}
                     isResultsMaximized={isResultsMaximized}
                     onToggleMaximize={onToggleResultsMaximize}
                     onClearResults={onClearResults}
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
            <EmptyWorkspace onNewQuery={onNewQuery} onOpenPalette={onPaletteOpen} />
         )}
      </AnimatePresence>
   )
}
