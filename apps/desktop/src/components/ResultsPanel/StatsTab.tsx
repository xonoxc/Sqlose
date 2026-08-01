import { cn } from "@sqlose/ui"
import type { QueryResult } from "@sqlose/shared"

interface StatsTabProps {
   result: QueryResult | null
   error: string | null
   isExecuting: boolean
   executionTimeMs: number | null
   rowCount: number | null
}

export function StatsTab({
   result,
   error,
   isExecuting,
   executionTimeMs,
   rowCount,
}: StatsTabProps) {
   if (isExecuting) {
      return (
         <div className="flex items-center justify-center h-full">
            <span className="text-[12px] text-text-muted/40 animate-pulse">
               Calculating metrics...
            </span>
         </div>
      )
   }

   if (!result && !error) {
      return (
         <div className="flex items-center justify-center h-full">
            <span className="text-[12px] text-text-muted/30 font-medium">
               Session statistics unavailable
            </span>
         </div>
      )
   }

   const stats = [
      {
         label: "Status",
         value: error ? "Failed" : "Success",
         color: error ? "text-error" : "text-success/90",
      },
      { label: "Duration", value: executionTimeMs !== null ? `${executionTimeMs}ms` : "—" },
      { label: "Rows", value: rowCount !== null ? String(rowCount) : "—" },
      { label: "Columns", value: result ? String(result.columns.length) : "—" },
   ]

   return (
      <div className="p-6 h-full overflow-y-auto custom-scrollbar">
         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map(s => (
               <div
                  key={s.label}
                  className="p-3.5 rounded-xl bg-bg-secondary/40 border border-border/30 shadow-sm transition-all hover:border-border/50"
               >
                  <p className="text-[10px] font-semibold text-text-muted/50 uppercase mb-1.5">
                     {s.label}
                  </p>
                  <p
                     className={cn(
                        "text-[15px] font-mono font-semibold",
                        s.color || "text-text-primary"
                     )}
                  >
                     {s.value}
                  </p>
               </div>
            ))}
         </div>
         {result && (
            <div className="p-4 rounded-xl bg-bg-secondary/40 border border-border/30">
               <p className="text-[10px] font-semibold text-text-muted/50 uppercase mb-3">
                  Column Schema
               </p>
               <div className="flex flex-wrap gap-2">
                  {result.columns.map(col => (
                     <span
                        key={col}
                        className="text-[11px] font-mono text-text-secondary/80 bg-white/[0.03] px-2 py-1 rounded-lg border border-white/[0.05] hover:border-white/[0.1] transition-colors"
                     >
                        {col}
                     </span>
                  ))}
               </div>
            </div>
         )}
      </div>
   )
}
