import { IconClock, IconHistory, IconFileCode } from "@tabler/icons-react"
import { cn } from "@sqlose/ui"
import { useHistoryStore } from "~/stores/historyStore"
import { useEnvironmentStore } from "~/stores/environmentStore"
import { useWorkspaceStore } from "~/stores/workspaceStore"
import type { QueryResult } from "@sqlose/shared"

export function HistoryView() {
   const selectedEnvironmentId = useEnvironmentStore(s => s.selectedEnvironmentId)
   const allEntries = useHistoryStore(s => s.entries)
   const entries = selectedEnvironmentId
      ? allEntries.filter(h => h.environmentId === selectedEnvironmentId)
      : allEntries

   const handleOpen = (sql: string, result?: QueryResult | null) => {
      const res = useWorkspaceStore.getState().openTab()
      if (res.isOk()) {
         const tab = res.value
         useWorkspaceStore.getState().updateTab(tab.id, {
            query: sql,
            ...(result ? { result } : {}),
         })
         useWorkspaceStore.getState().setActiveTab(tab.id)
      }
   }

   const formatTime = (timestamp: string) => {
      const d = new Date(timestamp)
      const now = new Date()
      const diffMs = now.getTime() - d.getTime()
      const diffSec = Math.floor(diffMs / 1000)
      const diffMin = Math.floor(diffSec / 60)
      const diffHour = Math.floor(diffMin / 60)
      const diffDay = Math.floor(diffHour / 24)

      if (diffSec < 60) {
         return "just now"
      }
      if (diffMin < 60) {
         return `${diffMin}m ago`
      }
      if (diffHour < 24) {
         return `${diffHour}h ago`
      }
      if (diffDay < 7) {
         return `${diffDay}d ago`
      }
      return d.toLocaleDateString()
   }

   return (
      <div className="h-full flex flex-col bg-bg-primary overflow-hidden">
         <div className="flex items-center gap-3 px-6 py-4 border-b border-border/40 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
               <IconHistory size={20} stroke={1.5} />
            </div>
            <div>
               <h1 className="text-[15px] font-semibold text-text-primary">Query History</h1>
               <p className="text-[12px] text-text-muted">
                  Last {entries.length} {entries.length === 1 ? "execution" : "executions"}
               </p>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto custom-scrollbar">
            {entries.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full text-center px-8">
                  <IconClock className="h-12 w-12 text-text-muted/20 mb-4" />
                  <p className="text-[14px] font-medium text-text-muted">No query history</p>
                  <p className="text-[12px] text-text-muted/60 mt-1 max-w-xs">
                     Run a query and it will appear here for quick access.
                  </p>
               </div>
            ) : (
               <div className="p-4 space-y-1">
                  {entries.map(entry => (
                      <div
                         key={entry.id}
                         className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-bg-tertiary/50 transition-colors cursor-pointer"
                         onClick={() => handleOpen(entry.sql, entry.result)}
                      >
                        <div
                           className={cn(
                              "h-2 w-2 rounded-full shrink-0",
                              entry.status === "success" ? "bg-success" : "bg-error"
                           )}
                        />
                        <div className="flex-1 min-w-0">
                           <div className="text-[13px] font-mono text-text-primary truncate">
                              {entry.sql}
                           </div>
                           <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-[11px] text-text-muted/60">{entry.dbType}</span>
                              <span className="text-[11px] text-text-muted/60">{entry.duration}ms</span>
                              <span className="text-[11px] text-text-muted/60">{formatTime(entry.executedAt)}</span>
                           </div>
                        </div>
                         <button
                            onClick={e => {
                               e.stopPropagation()
                               handleOpen(entry.sql, entry.result)
                            }}
                           className="h-7 w-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-quaternary transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                           title="Open in new tab"
                        >
                           <IconFileCode size={15} stroke={1.5} />
                        </button>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>
   )
}
