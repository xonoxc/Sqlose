import { cn } from "@sqlose/ui"
import type { Theme } from "~/types/theme"

interface ThemeResultsProps {
   filteredThemes: Theme[]
   selectedIndex: number
   onSelectIndex: (index: number) => void
   onHover: (id: string | null) => void
   onSelect: (id: string) => void
   onClose: () => void
}

export function ThemeResults({
   filteredThemes,
   selectedIndex,
   onSelectIndex,
   onHover,
   onSelect,
   onClose,
}: ThemeResultsProps) {
   return (
      <div className="flex flex-col">
         <div className="px-5 py-2 text-[10.5px] font-bold uppercase tracking-widest text-text-muted/70">
            Themes
         </div>
         {filteredThemes.slice(0, 10).map((theme, index) => {
            const isActive = index === selectedIndex
            return (
               <button
                  key={theme.id}
                  onClick={() => {
                     onSelect(theme.id)
                     onClose()
                  }}
                  onMouseEnter={() => {
                     onSelectIndex(index)
                     onHover(theme.id)
                  }}
                  onMouseLeave={() => onHover(null)}
                  className={cn(
                     "flex w-full items-center gap-4 px-5 py-2.5 transition-all outline-none",
                     isActive
                        ? "bg-accent text-white"
                        : "text-text-secondary hover:bg-bg-secondary/50"
                  )}
               >
                  <div className="flex -space-x-1.5 shrink-0">
                     <div
                        className="h-5 w-5 rounded-full border border-bg-primary shadow-xs"
                        style={{ background: theme.colors.accent }}
                     />
                     <div
                        className="h-5 w-5 rounded-full border border-bg-primary shadow-xs"
                        style={{ background: theme.colors.background }}
                     />
                  </div>
                  <div className="flex-1 flex items-center justify-between min-w-0 font-medium">
                     <span className="text-[14.5px] truncate">{theme.name}</span>
                     <span
                        className={cn(
                           "text-[11px] ml-2",
                           isActive ? "text-white/70" : "text-text-muted/60"
                        )}
                     >
                        {theme.id}
                     </span>
                  </div>
               </button>
            )
         })}
      </div>
   )
}
