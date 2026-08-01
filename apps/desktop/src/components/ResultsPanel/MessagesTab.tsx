import { IconAlertCircle } from "@tabler/icons-react"
import type { QueryResult } from "@sqlose/shared"

interface MessagesTabProps {
   result: QueryResult | null
   error: string | null
   isExecuting: boolean
}

export function MessagesTab({ result, error, isExecuting }: MessagesTabProps) {
   if (isExecuting) {
      return (
         <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-2 text-text-muted/40">
               <div className="h-3 w-3 rounded-full border border-t-accent animate-spin" />
               <span className="text-[12px]">Waiting for response...</span>
            </div>
         </div>
      )
   }

   if (error) {
      return (
         <div className="p-5">
            <div className="p-4 rounded-xl bg-error/[0.03] border border-error/10">
               <p className="text-[12.5px] font-bold text-error/80 mb-2.5 flex items-center gap-2">
                  <IconAlertCircle className="h-3.5 w-3.5" />
                  Execution Failed
               </p>
               <pre className="text-[12px] text-text-secondary font-mono leading-relaxed whitespace-pre-wrap">
                  {error}
               </pre>
            </div>
         </div>
      )
   }

   if (!result) {
      return (
         <div className="flex items-center justify-center h-full">
            <span className="text-[12px] text-text-muted/30 font-medium">
               No active session messages
            </span>
         </div>
      )
   }

   return (
      <div className="p-5">
         <div className="p-4 rounded-xl bg-success/[0.03] border border-success/10">
            <p className="text-[12.5px] font-semibold text-success/80 flex items-center gap-2 mb-1.5">
               <div className="h-1.5 w-1.5 rounded-full bg-success" />
               Success
            </p>
            <p className="text-[12px] text-text-secondary/80 leading-relaxed">
               Query processed {result.rowCount} row{result.rowCount !== 1 ? "s" : ""} across{" "}
               {result.columns.length} columns. Total execution time:{" "}
               <span className="text-accent font-mono ml-1">{result.executionTimeMs}ms</span>
            </p>
         </div>
      </div>
   )
}
