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

export function ResultsPanel({
   result,
   error,
   isExecuting,
   executionTimeMs,
   rowCount,
   activeTab,
}: ResultsPanelProps) {
   const tabContent = () => {
      switch (activeTab) {
         case "results":
            return <ResultsTab result={result} error={error} isExecuting={isExecuting} />
         case "messages":
            return <MessagesTab result={result} error={error} isExecuting={isExecuting} />
         case "stats":
            return (
               <StatsTab
                  result={result}
                  error={error}
                  isExecuting={isExecuting}
                  executionTimeMs={executionTimeMs}
                  rowCount={rowCount}
               />
            )
         case "plan":
            return <PlanTab />
      }
   }

   return (
      <div className="h-full bg-bg-results flex flex-col">
         <div className="flex-1 min-h-0 overflow-hidden">{tabContent()}</div>
      </div>
   )
}
