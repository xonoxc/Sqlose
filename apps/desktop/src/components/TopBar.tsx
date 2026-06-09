import { IconLogout, IconSchema } from "@tabler/icons-react"
import { isMac } from "~/lib/types"

interface TopBarProps {
   onOpenPalette: () => void
   onBackToDashboard: () => void
   onOpenDiagram: () => void
}

export function TopBar({ onOpenPalette, onBackToDashboard, onOpenDiagram }: TopBarProps) {
   return (
      <div className="h-14 flex items-center justify-between px-4 border-b border-border/30 bg-bg-secondary/90 shrink-0 shadow-sm z-20 relative">
         <div />
         <div className="flex-1 max-w-md mx-4">
            <button
               onClick={onOpenPalette}
               className="w-full flex items-center gap-2.5 bg-bg-tertiary hover:bg-bg-quaternary border border-border shadow-inner rounded-md px-3 py-2.5 text-[13.5px] text-text-muted transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
            >
               <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-60"
               >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
               </svg>
               <span className="opacity-80 font-medium">Search tables, queries, commands...</span>
               <div className="ml-auto flex items-center gap-1 opacity-50">
                  {isMac() ? (
                     <>
                        <kbd className="bg-bg-primary text-[11.5px] font-mono px-1.5 py-[2px] rounded border border-border/60 shadow-sm leading-none shrink-0">
                           ⌘
                        </kbd>
                        <kbd className="bg-bg-primary text-[11.5px] font-mono px-1.5 py-[2px] rounded border border-border/60 shadow-sm leading-none shrink-0">
                           K
                        </kbd>
                     </>
                  ) : (
                     <kbd className="bg-bg-primary text-[11.5px] font-mono px-1.5 py-[2px] rounded border border-border/60 shadow-sm leading-none shrink-0">
                        Ctrl+K
                     </kbd>
                  )}
               </div>
            </button>
         </div>

         <div className="flex items-center gap-1">
            <button
               onClick={onOpenDiagram}
               className="h-9 w-9 rounded flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-quaternary transition-colors"
               aria-label="View schema diagram"
            >
               <IconSchema className="h-4.5 w-4.5" />
            </button>
            <button
               onClick={onBackToDashboard}
               className="h-9 w-9 rounded flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-quaternary transition-colors border-2 rounded-md border-border/25"
               aria-label="Back to dashboard"
            >
               <IconLogout className="h-4.5 w-4.5" />
            </button>
         </div>
      </div>
   )
}
