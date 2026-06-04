import { type ReactNode } from "react"
import { IconLanguage, IconDatabase, IconLineHeight } from "@tabler/icons-react"
import { cn } from "./cn"
import { VimIndicator, type VimMode } from "./vim-indicator"
import type { DBType } from "@sqlose/shared"

interface StatusBarProps {
   vimMode?: VimMode
   dbType?: DBType
   leftItems?: ReactNode
   className?: string
}

const dbTypeLabels: Record<DBType, string> = {
   postgres: "PG",
   mysql: "MySQL",
   sqlite: "SQLite",
}

export function StatusBar({ vimMode, dbType, leftItems, className }: StatusBarProps) {
   return (
      <div
         className={cn(
            "flex h-6 items-center justify-between border-t border-border/60 bg-bg-primary px-3 text-[13.5px] text-text-muted shadow-[0_-1px_2px_rgba(0,0,0,0.1)] z-50 shrink-0 py-3",
            className
         )}
      >
         <div className="flex items-center gap-3 h-full">
            {vimMode && (
               <div className="flex items-center gap-1.5 h-full">
                  -- <VimIndicator mode={vimMode} /> --
               </div>
            )}
            {leftItems}
         </div>
         <div className="flex items-center h-full">
            <div className="flex items-center h-full korder-l border-border/50 px-3 gap-1.5">
               <IconLanguage className="h-3.5 w-3.5" />
               UTF-8
            </div>
            {dbType && (
               <div className="flex items-center h-full border-l border-border/50 px-3 gap-1.5 ">
                  <IconDatabase className="h-3.5 w-3.5" />
                  {dbTypeLabels[dbType] ?? dbType}
               </div>
            )}
            <div className="flex items-center h-full border-l border-border/50 px-3 gap-1.5">
               <IconLineHeight className="h-3.5 w-3.5" />
               Ln 1, Col 1
            </div>
         </div>
      </div>
   )
}
