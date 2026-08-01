import { IconSearch, IconArrowLeft } from "@tabler/icons-react"
import type { PaletteMode } from "~/hooks/useCommandPaletteLogic"

interface PaletteSearchHeaderProps {
   mode: PaletteMode
   query: string
   onQueryChange: (value: string) => void
   inputRef: React.RefObject<HTMLInputElement | null>
   onExitThemes: () => void
   onExitDatabases: () => void
}

export function PaletteSearchHeader({
   mode,
   query,
   onQueryChange,
   inputRef,
   onExitThemes,
   onExitDatabases,
}: PaletteSearchHeaderProps) {
   const isSubMode = mode === "themes" || mode === "databases"

   return (
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border/50">
         {isSubMode ? (
            <button
               onClick={mode === "themes" ? onExitThemes : onExitDatabases}
               className="flex items-center justify-center h-8 w-8 rounded bg-bg-secondary text-text-muted hover:text-text-primary transition-colors focus:outline-none"
            >
               <IconArrowLeft className="h-4 w-4" />
            </button>
         ) : (
            <IconSearch className="h-4.5 w-4.5 text-text-muted shrink-0" />
         )}
         <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => onQueryChange(e.target.value)}
            placeholder={
               mode === "themes"
                  ? "Search themes..."
                  : mode === "databases"
                    ? "Search databases..."
                    : "Search tables, queries, commands..."
            }
            className="flex-1 bg-transparent text-[14.5px] font-medium text-text-primary outline-none placeholder:text-text-muted/50"
         />
         <kbd className="hidden sm:inline-flex items-center justify-center rounded px-2 py-1 border border-border bg-bg-secondary text-[10px] font-mono text-text-muted">
            ESC
         </kbd>
      </div>
   )
}
