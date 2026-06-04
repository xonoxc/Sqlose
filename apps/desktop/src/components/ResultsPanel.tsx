import { motion } from "motion/react"
import { ResultsTable, cn } from "@sqlose/ui"
import {
   IconAlertCircle,
   IconDatabase,
   IconFileCode,
} from "@tabler/icons-react"
import type { QueryResult } from "@sqlose/shared"
import { isMac } from "../lib/types"
import { useSettingsStore } from "../stores/settingsStore"

interface ResultsPanelProps {
   result: QueryResult | null
   error: string | null
   isExecuting: boolean
   executionTimeMs: number | null
   rowCount: number | null
   activeTab: "results" | "messages" | "stats" | "plan"
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
      <div className="h-full bg-bg-primary flex flex-col">
         <div className="flex-1 min-h-0 overflow-hidden">{tabContent()}</div>
      </div>
   )
}

function ResultsTab({
   result,
   error,
   isExecuting,
 }: {
   result: QueryResult | null
   error: string | null
   isExecuting: boolean
 }) {
   const rowSpacing = useSettingsStore(s => s.rowSpacing)
   const alternatingRowColors = useSettingsStore(s => s.alternatingRowColors)
   
   if (isExecuting) {
      return (
         <div className="flex items-center justify-center h-full bg-bg-primary">
            <div className="flex flex-col items-center justify-center gap-3 text-text-muted/60">
               <div className="h-6 w-6 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
               <span className="text-[12px] font-medium">Processing your query...</span>
            </div>
         </div>
      )
   }

   if (error) {
      return (
         <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col p-6 bg-bg-primary h-full max-w-4xl mx-auto"
         >
            <div className="flex items-center gap-3 mb-4 text-error/90">
               <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-error/10 border border-error/20">
                  <IconAlertCircle className="h-4 w-4" />
               </div>
               <span className="text-[14px] font-semibold">Execution Error</span>
            </div>
            <div className="p-4 rounded-xl bg-bg-secondary border border-error/10 shadow-sm">
               <pre className="text-[12.5px] text-text-secondary font-mono leading-relaxed whitespace-pre-wrap selection:bg-error/20">
                  {error}
               </pre>
            </div>
         </motion.div>
      )
   }

   if (!result) {
      return (
         <div className="flex items-center justify-center h-full bg-bg-primary translate-y-[-10%]">
            <div className="flex flex-col items-center justify-center gap-5">
               <div className="relative group">
                  <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
                  <div className="relative flex items-center justify-center h-14 w-14 rounded-2xl bg-bg-secondary border border-border/50 text-text-muted/30 group-hover:text-accent/40 group-hover:border-accent/20 transition-all duration-300">
                     <IconDatabase className="h-7 w-7" />
                  </div>
               </div>
               
               <div className="flex flex-col items-center gap-1.5">
                  <span className="text-[14px] font-semibold text-text-primary/90">Ready to Execute</span>
                  <span className="text-[12px] text-text-muted/50 font-medium">Select a query and run to see results</span>
               </div>

               <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-center gap-6 px-4 py-2.5 rounded-xl bg-bg-secondary/40 border border-border/30 backdrop-blur-sm shadow-sm transition-all hover:border-border/50">
                     <div className="flex items-center gap-1.5">
                        <kbd className="min-w-[22px] h-5 flex items-center justify-center px-1.5 rounded bg-bg-tertiary border border-border/60 text-[10px] font-mono text-text-muted/80">{isMac() ? "⌘" : "Ctrl"}</kbd>
                        <kbd className="min-w-[22px] h-5 flex items-center justify-center px-1.5 rounded bg-bg-tertiary border border-border/60 text-[10px] font-mono text-text-muted/80">↵</kbd>
                     </div>
                     <span className="text-[11px] font-medium text-text-muted/60">Run Statement</span>
                  </div>
                  
                  <div className="flex items-center gap-6 px-4 py-2.5 rounded-xl bg-bg-secondary/40 border border-border/30 backdrop-blur-sm shadow-sm transition-all hover:border-border/50 group">
                     <div className="flex items-center gap-1.5">
                        <kbd className="min-w-[22px] h-5 flex items-center justify-center px-1.5 rounded bg-bg-tertiary border border-border/60 text-[10px] font-mono text-text-muted/80">{isMac() ? "⌘" : "Ctrl"}</kbd>
                        <kbd className="min-w-[22px] h-5 flex items-center justify-center px-1.5 rounded bg-bg-tertiary border border-border/60 text-[10px] font-mono text-text-muted/80">K</kbd>
                     </div>
                     <span className="text-[11px] font-medium text-text-muted/60">Command Palette</span>
                  </div>
               </div>
            </div>
         </div>
      )
   }

   return (
      <div className="h-full bg-bg-primary overflow-hidden flex flex-col pt-0.5">
         <div className="flex-1 min-h-0">
            <ResultsTable
               data={result.rows as Record<string, unknown>[]}
               rowHeight={rowSpacing === "compact" ? 22 : 28}
               alternatingRows={alternatingRowColors}
            />
         </div>
      </div>
   )
}

function MessagesTab({
   result,
   error,
   isExecuting,
}: {
   result: QueryResult | null
   error: string | null
   isExecuting: boolean
}) {
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
            <span className="text-[12px] text-text-muted/30 font-medium">No active session messages</span>
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
               Query processed {result.rowCount} row{result.rowCount !== 1 ? "s" : ""} across {result.columns.length} columns.
               Total execution time: <span className="text-accent font-mono ml-1">{result.executionTimeMs}ms</span>
            </p>
         </div>
      </div>
   )
}

function StatsTab({
   result,
   error,
   isExecuting,
   executionTimeMs,
   rowCount,
}: {
   result: QueryResult | null
   error: string | null
   isExecuting: boolean
   executionTimeMs: number | null
   rowCount: number | null
}) {
   if (isExecuting) {
      return (
         <div className="flex items-center justify-center h-full">
             <span className="text-[12px] text-text-muted/40 animate-pulse">Calculating metrics...</span>
         </div>
      )
   }

   if (!result && !error) {
      return (
         <div className="flex items-center justify-center h-full">
            <span className="text-[12px] text-text-muted/30 font-medium">Session statistics unavailable</span>
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
               <div key={s.label} className="p-3.5 rounded-xl bg-bg-secondary/40 border border-border/30 shadow-sm transition-all hover:border-border/50">
                  <p className="text-[10px] font-semibold text-text-muted/50 uppercase mb-1.5">
                     {s.label}
                  </p>
                  <p className={cn("text-[15px] font-mono font-semibold", s.color || "text-text-primary")}>
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

function PlanTab() {
   return (
      <div className="flex flex-col items-center justify-center h-full text-text-muted/40">
         <div className="h-10 w-10 rounded-xl bg-bg-secondary border border-border/40 flex items-center justify-center mb-4 text-text-muted/20">
            <IconFileCode className="h-6 w-6" />
         </div>
         <span className="text-[13px] font-bold text-text-primary/70 mb-1">Execution Plan</span>
         <span className="text-[12px] max-w-xs text-center leading-relaxed">Optimization statistics require EXPLAIN support from your database driver.</span>
      </div>
   )
}
