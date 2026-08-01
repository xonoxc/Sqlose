import { cn } from "@sqlose/ui"
import type { ExecutionMode } from "~/stores/settingsStore"
import { SectionHeader, SettingRow } from "~/components/settings/primitives"

interface ExecutionSectionProps {
   executionMode: ExecutionMode
   setExecutionMode: (mode: ExecutionMode) => void
}

export function ExecutionSection({ executionMode, setExecutionMode }: ExecutionSectionProps) {
   return (
      <section>
         <SectionHeader title="Execution" />
         <SettingRow
            title="Execution Mode"
            description="Review Mode queues changes for review before applying. Direct Mode applies changes immediately."
         >
            <div className="flex gap-1 bg-bg-tertiary border border-border rounded-lg p-0.5">
               <button
                  onClick={() => setExecutionMode("review")}
                  className={cn(
                     "px-3 py-1.5 rounded-md text-[12px] font-medium transition-all",
                     executionMode === "review"
                        ? "bg-accent/15 text-accent shadow-sm"
                        : "text-text-muted hover:text-text-primary"
                  )}
               >
                  Review Mode
               </button>
               <button
                  onClick={() => setExecutionMode("direct")}
                  className={cn(
                     "px-3 py-1.5 rounded-md text-[12px] font-medium transition-all",
                     executionMode === "direct"
                        ? "bg-accent/15 text-accent shadow-sm"
                        : "text-text-muted hover:text-text-primary"
                  )}
               >
                  Direct Mode
               </button>
            </div>
         </SettingRow>
      </section>
   )
}
