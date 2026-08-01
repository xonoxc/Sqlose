import type { QueryResult } from "@sqlose/shared"
import { ResultsTab } from "./ResultsTab"
import { MessagesTab } from "./MessagesTab"
import { StatsTab } from "./StatsTab"
import { PlanTab } from "./PlanTab"

export type ResultsTabId = "results" | "messages" | "stats" | "plan"

interface ResultsPanelProps {
   result: QueryResult | null
   error: string | null
   isExecuting: boolean
   executionTimeMs: number | null
   rowCount: number | null
   activeTab: ResultsTabId
}

const TAB_COMPONENTS: Record<ResultsTabId, (props: ResultsPanelProps) => React.ReactNode> = {
   results: ({ result, error, isExecuting }) => (
      <ResultsTab result={result} error={error} isExecuting={isExecuting} />
   ),
   messages: ({ result, error, isExecuting }) => (
      <MessagesTab result={result} error={error} isExecuting={isExecuting} />
   ),
   stats: ({ result, error, isExecuting, executionTimeMs, rowCount }) => (
      <StatsTab
         result={result}
         error={error}
         isExecuting={isExecuting}
         executionTimeMs={executionTimeMs}
         rowCount={rowCount}
      />
   ),
   plan: () => <PlanTab />,
}

export function ResultsPanel(props: ResultsPanelProps) {
   const renderTab = TAB_COMPONENTS[props.activeTab]

   return (
      <div className="h-full bg-bg-results flex flex-col">
         <div className="flex-1 min-h-0 overflow-hidden">{renderTab(props)}</div>
      </div>
   )
}
