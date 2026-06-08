import { cn } from "@sqlose/ui"
import { IconCheck } from "@tabler/icons-react"

const STEPS = ["Source", "Identity", "Review"]

interface StepIndicatorProps {
   currentStepIndex: number
}

export function StepIndicator({ currentStepIndex }: StepIndicatorProps) {
   return (
      <div className="flex items-center gap-3 border-dashed px-6 py-2 rounded-md">
         {STEPS.map((label, index) => {
            const isCompleted = index < currentStepIndex
            const isActive = index === currentStepIndex

            return (
               <div key={label} className="flex items-center gap-3 flex-1 min-w-0 last:flex-none">
                  <div className="flex items-center gap-3 min-w-0">
                     <div
                        className={cn(
                           "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[12px] font-black transition-all",
                           isActive
                              ? "border-accent bg-accent text-white shadow-[0_0_0_4px_rgba(var(--color-accent),0.12)]"
                              : isCompleted
                                ? "border-accent/70 bg-accent/15 text-accent"
                                : "border-border bg-bg-secondary text-text-muted/70"
                        )}
                     >
                        {isCompleted ? (
                           <IconCheck className="h-3.5 w-3.5" strokeWidth={3} />
                        ) : (
                           index + 1
                        )}
                     </div>
                     <span
                        className={cn(
                           "truncate text-[11px] font-semibold uppercase transition-colors",
                           isActive
                              ? "text-white/50"
                              : isCompleted
                                ? "text-text-primary"
                                : "text-text-muted/60"
                        )}
                     >
                        {label}
                     </span>
                  </div>
                  {index < STEPS.length - 1 && (
                     <div
                        className={cn(
                           "h-px flex-1 min-w-8 transition-colors",
                           index < currentStepIndex ? "bg-accent/60" : "bg-white/10"
                        )}
                     />
                  )}
               </div>
            )
         })}
      </div>
   )
}
