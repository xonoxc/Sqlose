import { cn } from "@sqlose/ui"
import {
   IconChevronDown,
   IconTrash,
   IconDotsVertical,
   IconMaximize,
   IconMinimize,
} from "@tabler/icons-react"
import { CopyDropdown } from "~/components/CopyDropdown"
import { ExportDropdown } from "~/components/ExportDropdown"
import { copyResultsToClipboard, exportResultsToFile } from "~/hooks/useQueryExecution"
import type { Tab } from "~/lib/types"

interface ResultsPanelHeaderProps {
   activeTab: Tab | undefined
   isExecuting: boolean
   resultsActiveTab: "results" | "messages" | "stats" | "plan"
   onResultsActiveTabChange: (tab: "results" | "messages" | "stats" | "plan") => void
   resultsCollapsed: boolean
   onToggleCollapse: () => void
   isResultsMaximized: boolean
   onToggleMaximize: () => void
   onClearResults: () => void
}

export function ResultsPanelHeader({
   activeTab,
   isExecuting,
   resultsActiveTab,
   onResultsActiveTabChange,
   resultsCollapsed,
   onToggleCollapse,
   isResultsMaximized,
   onToggleMaximize,
   onClearResults,
}: ResultsPanelHeaderProps) {
   const tabs = [
      { id: "results" as const, label: "Results" },
      { id: "messages" as const, label: "Messages" },
      { id: "stats" as const, label: "Stats" },
      { id: "plan" as const, label: "Query Plan" },
   ]

   return (
      <div className="flex items-center justify-between p-1 h-10 bg-bg-secondary/40 shrink-0 border-b border-border/20 z-30">
         <div className="flex items-center gap-0.5 h-full py-4">
            <button
               onClick={onToggleCollapse}
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

            <div className="flex items-center ml-2 gap-4">
               {tabs.map(tab => {
                  const isActive = resultsActiveTab === tab.id
                  return (
                     <button
                        key={tab.id}
                        onClick={() => onResultsActiveTabChange(tab.id)}
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
                     <span className="text-[12px] font-medium">Running...</span>
                  </div>
               )}
            </div>

            <div className="flex items-center gap-0.5 px-4 flex items-center justify-center gap-3">
               {activeTab?.result && (
                  <>
                     <CopyDropdown
                        onCopy={format => copyResultsToClipboard(activeTab.result!, format)}
                     />

                     <ExportDropdown
                        onExport={format => exportResultsToFile(activeTab.result!, format)}
                     />
                  </>
               )}

               <button
                  onClick={onClearResults}
                  className="h-8 w-8 flex items-center justify-center rounded-md text-text-muted/80 hover:text-error hover:bg-error/5 transition-all"
                  title="Clear results"
               >
                  <IconTrash className="h-4.5 w-4.5" />
               </button>

               <div className="w-px h-3.5 bg-border/70 mx-1" />

               <button
                  className="h-7 w-7 flex items-center justify-center rounded-md text-text-muted/80 hover:text-text-primary hover:bg-white/5 transition-all"
                  title="More options"
               >
                  <IconDotsVertical className="h-4.5 w-4.5" />
               </button>

               <button
                  onClick={onToggleMaximize}
                  className={cn(
                     "h-7 w-7 flex items-center justify-center rounded-md transition-all",
                     "text-text-muted/80 hover:text-text-primary hover:bg-white/5"
                  )}
                  title={isResultsMaximized ? "Restore panel" : "Maximize panel"}
               >
                  {isResultsMaximized ? (
                     <IconMinimize className="h-5 w-5" />
                  ) : (
                     <IconMaximize className="h-5 w-5" />
                  )}
               </button>
            </div>
         </div>
      </div>
   )
}
