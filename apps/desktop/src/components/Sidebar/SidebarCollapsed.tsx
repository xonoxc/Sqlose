import { cn } from "@sqlose/ui"
import {
   IconLayoutSidebarLeftCollapse,
   IconCode,
   IconBookmark,
   IconHistory,
   IconTable,
} from "@tabler/icons-react"

interface SidebarCollapsedProps {
   onToggleCollapse: () => void
   handleNavClick: (type: "playground" | "saved" | "history") => void
   tableTreeExpanded: boolean
   setTableTreeExpanded: (expanded: boolean) => void
}

export function SidebarCollapsed({
   onToggleCollapse,
   handleNavClick,
   tableTreeExpanded,
   setTableTreeExpanded,
}: SidebarCollapsedProps) {
   return (
      <div className="flex h-full flex-col bg-bg-secondary text-text-secondary w-full items-center py-2 gap-1">
         <button
            onClick={onToggleCollapse}
            className="h-8 w-8 rounded flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-quaternary transition-colors"
            aria-label="Expand sidebar"
         >
            <IconLayoutSidebarLeftCollapse className="h-4.5 w-4.5 rotate-180" />
         </button>
         <div className="w-6 h-px bg-border/60 my-1" />

         <button
            onClick={() => handleNavClick("playground")}
            className="h-8 w-8 rounded flex items-center justify-center text-white/65 hover:text-white hover:bg-bg-quaternary transition-colors"
            aria-label="New Query"
         >
            <IconCode className="h-4 w-4" />
         </button>
         <button
            onClick={() => handleNavClick("saved")}
            className="h-8 w-8 rounded flex items-center justify-center text-white/65 hover:text-white hover:bg-bg-quaternary transition-colors"
            aria-label="Saved Queries"
         >
            <IconBookmark className="h-4 w-4" />
         </button>
         <button
            onClick={() => handleNavClick("history")}
            className="h-8 w-8 rounded flex items-center justify-center text-white/65 hover:text-white hover:bg-bg-quaternary transition-colors"
            aria-label="History"
         >
            <IconHistory className="h-4 w-4" />
         </button>
         <div className="w-6 h-px bg-border/60 my-1" />
         <button
            onClick={() => setTableTreeExpanded(!tableTreeExpanded)}
            className={cn(
               "h-8 w-8 rounded flex items-center justify-center transition-colors",
               tableTreeExpanded
                  ? "text-white bg-white/10"
                  : "text-white/65 hover:text-white hover:bg-bg-quaternary"
            )}
            aria-label="Tables"
         >
            <IconTable className="h-4 w-4" />
         </button>
      </div>
   )
}
