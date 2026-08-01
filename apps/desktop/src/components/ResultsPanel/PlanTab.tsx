import { IconFileCode } from "@tabler/icons-react"

export function PlanTab() {
   return (
      <div className="flex flex-col items-center justify-center h-full text-text-muted/40">
         <div className="h-10 w-10 rounded-xl bg-bg-secondary border border-border/40 flex items-center justify-center mb-4 text-text-muted/20">
            <IconFileCode className="h-6 w-6" />
         </div>
         <span className="text-[13px] font-bold text-text-primary/70 mb-1">Execution Plan</span>
         <span className="text-[12px] max-w-xs text-center leading-relaxed">
            Optimization statistics require EXPLAIN support from your database driver.
         </span>
      </div>
   )
}
