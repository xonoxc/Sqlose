import { motion } from "motion/react"
import { ResultsTable } from "@sqlose/ui"
import { IconAlertCircle, IconDatabase } from "@tabler/icons-react"
import type { QueryResult } from "@sqlose/shared"
import { isMac } from "~/lib/types"
import { useSettingsStore } from "~/stores/settingsStore"

function ExecutingState() {
   return (
      <div className="flex items-center justify-center h-full bg-bg-results">
         <div className="flex flex-col items-center justify-center gap-3 text-text-muted/60">
            <div className="h-6 w-6 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
            <span className="text-[12px] font-medium">Processing your query...</span>
         </div>
      </div>
   )
}

function ErrorState({ error }: { error: string }) {
   return (
      <motion.div
         initial={{ opacity: 0, y: 5 }}
         animate={{ opacity: 1, y: 0 }}
         className="flex flex-col p-6 bg-bg-results h-full max-w-4xl mx-auto"
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

function EmptyState() {
   return (
      <div className="flex items-center justify-center h-full bg-bg-results translate-y-[-10%]">
         <div className="flex flex-col items-center justify-center gap-5">
            <div className="relative group">
               <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
               <div className="relative flex items-center justify-center h-14 w-14 rounded-2xl bg-bg-secondary border border-border/50 text-text-muted/30 group-hover:text-accent/40 group-hover:border-accent/20 transition-all duration-300">
                  <IconDatabase className="h-7 w-7" />
               </div>
            </div>

            <div className="flex flex-col items-center gap-1.5">
               <span className="text-[14px] font-semibold text-text-primary/90">
                  Ready to Execute
               </span>
               <span className="text-[12px] text-text-muted/50 font-medium">
                  Select a query and run to see results
               </span>
            </div>

            <div className="flex flex-col gap-2 mt-2">
               <ShortcutRow keys={[isMac() ? "⌘" : "Ctrl", "↵"]} label="Run Statement" />
               <ShortcutRow keys={[isMac() ? "⌘" : "Ctrl", "K"]} label="Command Palette" />
            </div>
         </div>
      </div>
   )
}

function ShortcutRow({ keys, label }: { keys: string[]; label: string }) {
   return (
      <div className="flex items-center gap-6 px-4 py-2.5 rounded-xl bg-bg-secondary/40 border border-border/30 backdrop-blur-sm shadow-sm transition-all hover:border-border/50 group">
         <div className="flex items-center gap-1.5">
            {keys.map(key => (
               <kbd
                  key={key}
                  className="min-w-[22px] h-5 flex items-center justify-center px-1.5 rounded bg-bg-tertiary border border-border/60 text-[10px] font-mono text-text-muted/80"
               >
                  {key}
               </kbd>
            ))}
         </div>
         <span className="text-[11px] font-medium text-text-muted/60">{label}</span>
      </div>
   )
}

interface ResultsTabProps {
   result: QueryResult | null
   error: string | null
   isExecuting: boolean
}

export function ResultsTab({ result, error, isExecuting }: ResultsTabProps) {
   const rowSpacing = useSettingsStore(s => s.rowSpacing)
   const alternatingRowColors = useSettingsStore(s => s.alternatingRowColors)
   const tableFontSize = useSettingsStore(s => s.tableFontSize)

   if (isExecuting) {
      return <ExecutingState />
   }

   if (error) {
      return <ErrorState error={error} />
   }

   if (!result) {
      return <EmptyState />
   }

   return (
      <div className="h-full bg-bg-results overflow-hidden flex flex-col pt-0.5">
         <div className="flex-1 min-h-0">
            <ResultsTable
               data={result.rows as Record<string, unknown>[]}
               rowHeight={rowSpacing === "compact" ? 22 : 28}
               alternatingRows={alternatingRowColors}
               fontSize={tableFontSize}
            />
         </div>
      </div>
   )
}
