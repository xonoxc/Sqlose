import { AnimatePresence } from "motion/react"
import { EmptyWorkspace } from "~/components/EmptyWorkspace"
import { SchemaDiagram } from "~/components/SchemaDiagram"
import { TableBrowser } from "~/components/TableBrowser"
import { SavedQueriesView } from "~/components/SavedQueriesView"
import { HistoryView } from "~/components/HistoryView"
import type { Tab } from "~/lib/types"
import type { ResultsTab } from "~/hooks/useAppUIState"
import { AnimatedTabContent } from "./AnimatedTabContent"
import { QueryTabView } from "./QueryTabView"

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
   onSaveQuery?: () => void
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
   onSaveQuery,
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
            <AnimatedTabContent key="schema-diagram" className="h-full z-10 relative">
               <SchemaDiagram />
            </AnimatedTabContent>
         ) : activeTab?.type === "saved" ? (
            <AnimatedTabContent key="saved-queries" className="h-full">
               <SavedQueriesView />
            </AnimatedTabContent>
         ) : activeTab?.type === "history" ? (
            <AnimatedTabContent key="query-history" className="h-full">
               <HistoryView />
            </AnimatedTabContent>
         ) : activeTab?.tableName ? (
            <AnimatedTabContent key="table-browser" className="h-full">
               <TableBrowser />
            </AnimatedTabContent>
         ) : activeTabId ? (
            <QueryTabView
               key="editor"
               activeTab={activeTab}
               queryDraft={queryDraft}
               isExecuting={isExecuting}
               onQueryChange={onQueryChange}
               onExecute={onExecute}
               onSettingsOpen={onSettingsOpen}
               onPaletteOpen={onPaletteOpen}
               onSaveQuery={onSaveQuery}
               isResultsMaximized={isResultsMaximized}
               resultsCollapsed={resultsCollapsed}
               resultsActiveTab={resultsActiveTab}
               onResultsActiveTabChange={onResultsActiveTabChange}
               onToggleResultsCollapse={onToggleResultsCollapse}
               onToggleResultsMaximize={onToggleResultsMaximize}
               onClearResults={onClearResults}
               resultsHeight={resultsHeight}
               resultsMinHeight={resultsMinHeight}
               onResultsDividerMouseDown={onResultsDividerMouseDown}
            />
         ) : (
            <EmptyWorkspace onNewQuery={onNewQuery} onOpenPalette={onPaletteOpen} />
         )}
      </AnimatePresence>
   )
}
