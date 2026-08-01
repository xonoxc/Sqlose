import { cn } from "@sqlose/ui"
import type { PaletteAction } from "./paletteActions"
import { getIconStyles } from "./getIconStyles"

interface PaletteResultItemProps {
   item: PaletteAction
   isActive: boolean
   onSelect: () => void
   onHover: () => void
}

export function PaletteResultItem({ item, isActive, onSelect, onHover }: PaletteResultItemProps) {
   const style = getIconStyles(item.id)

   return (
      <button
         onClick={onSelect}
         onMouseEnter={onHover}
         className={cn(
            "group flex w-full items-center gap-4 px-5 py-2.5 transition-all outline-none",
            isActive
               ? "bg-accent text-white"
               : "text-text-secondary hover:bg-bg-secondary/40"
         )}
      >
         <div
            className={cn(
               "flex items-center justify-center h-7 w-7 rounded-lg shrink-0 transition-all border border-transparent shadow-sm",
               isActive ? "bg-white/20 text-white" : style
            )}
         >
            <div className="scale-[0.85]">{item.icon}</div>
         </div>

         <div className="flex-1 min-w-0 flex items-center justify-between gap-6">
            <div className="flex flex-col text-left truncate">
               <div className="flex items-baseline gap-2.5 min-w-0 overflow-hidden">
                  <span
                     className={cn(
                        "text-[14px] font-semibold truncate transition-colors",
                        isActive ? "text-text-primary" : "text-text-secondary font-medium"
                     )}
                  >
                     {item.label}
                  </span>
                  <span
                     className={cn(
                        "text-[11.5px] truncate transition-colors font-medium",
                        isActive ? "text-white/70" : "text-text-muted/70"
                     )}
                  >
                     {item.description}
                  </span>
               </div>
            </div>

            {item.shortcut && (
               <div className="flex items-center gap-4 shrink-0">
                  <div className="flex items-center gap-1.5">
                     {item.shortcut.split("+").map((key, ki) => (
                        <kbd
                           key={ki}
                           className={cn(
                              "min-w-[20px] h-5.5 flex items-center justify-center px-1.5 rounded-md border text-[10px] font-mono shadow-xs transition-colors",
                              isActive
                                 ? "bg-white/20 border-white/20 text-white"
                                 : "bg-bg-secondary border-border text-text-muted"
                           )}
                        >
                           {key}
                        </kbd>
                     ))}
                  </div>
               </div>
            )}
         </div>
      </button>
   )
}
