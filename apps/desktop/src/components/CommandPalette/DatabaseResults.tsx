import { cn } from "@sqlose/ui"
import { IconDatabase } from "@tabler/icons-react"
import type { Environment } from "@sqlose/shared"

interface DatabaseResultsProps {
   filteredEnvironments: Environment[]
   selectedIndex: number
   onSelectIndex: (index: number) => void
   onSelect: (id: string) => void
   onClose: () => void
}

export function DatabaseResults({
   filteredEnvironments,
   selectedIndex,
   onSelectIndex,
   onSelect,
   onClose,
}: DatabaseResultsProps) {
   return (
      <div className="flex flex-col">
         <div className="px-5 py-2 text-[10.5px] font-bold uppercase tracking-widest text-text-muted/70">
            Databases
         </div>
         {filteredEnvironments.slice(0, 10).map((env, index) => {
            const isActive = index === selectedIndex
            return (
               <button
                  key={env.id}
                  onClick={() => {
                     onSelect(env.id)
                     onClose()
                  }}
                  onMouseEnter={() => onSelectIndex(index)}
                  className={cn(
                     "flex w-full items-center gap-4 px-5 py-2.5 transition-all outline-none",
                     isActive
                        ? "bg-accent text-white"
                        : "text-text-secondary hover:bg-bg-secondary/50"
                  )}
               >
                  <div className="flex items-center justify-center h-6 w-6 rounded-lg shrink-0 border border-border/50 bg-bg-secondary shadow-sm">
                     <IconDatabase className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 flex items-center justify-between min-w-0 font-medium">
                     <span className="text-[14.5px] truncate">
                        {env.name || `${env.dbType} environment`}
                     </span>
                     <span
                        className={cn(
                           "text-[11px] ml-2",
                           isActive ? "text-white/70" : "text-text-muted/60"
                        )}
                     >
                        {env.dbType} · {env.status}
                     </span>
                  </div>
               </button>
            )
         })}
      </div>
   )
}
