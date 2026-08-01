import { AnimatePresence } from "motion/react"
import type { ComponentType } from "react"
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

type SimpleViewKey = "diagram" | "saved" | "history" | "table"

interface SimpleViewEntry {
   animKey: string
   className: string
   Component: ComponentType
}

const SIMPLE_VIEWS: Record<SimpleViewKey, SimpleViewEntry> = {
   diagram: {
      animKey: "schema-diagram",
      className: "h-full z-10 relative",
      Component: SchemaDiagram,
   },
   saved: {
      animKey: "saved-queries",
      className: "h-full",
      Component: SavedQueriesView,
   },
   history: {
      animKey: "query-history",
      className: "h-full",
      Component: HistoryView,
   },
   table: {
      animKey: "table-browser",
      className: "h-full",
      Component: TableBrowser,
   },
}

function resolveSimpleViewKey(activeTab: Tab | undefined): SimpleViewKey | null {
   if (activeTab?.type === "diagram" || activeTab?.type === "saved" || activeTab?.type === "history") {
      return activeTab.type
   }
   return activeTab?.tableName ? "table" : null
}

export function EditorWorkspace(props: EditorWorkspaceProps) {
   const { activeTabId, activeTab } = props
   const simpleViewKey = resolveSimpleViewKey(activeTab)
   const simpleEntry = simpleViewKey ? SIMPLE_VIEWS[simpleViewKey] : null

   return (
      <AnimatePresence mode="wait">
         {simpleEntry ? (
            <AnimatedTabContent key={simpleEntry.animKey} className={simpleEntry.className}>
               <simpleEntry.Component />
            </AnimatedTabContent>
         ) : activeTabId ? (
            <QueryTabView key="editor" {...props} />
         ) : (
            <EmptyWorkspace onNewQuery={props.onNewQuery} onOpenPalette={props.onPaletteOpen} />
         )}
      </AnimatePresence>
   )
}
