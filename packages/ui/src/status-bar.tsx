import { type ReactNode } from "react"
import { cn } from "./cn"
import { VimIndicator, type VimMode } from "./vim-indicator"
import { Badge } from "./badge"
import type { DBType, EnvironmentStatus } from "@sqlose/shared"

interface StatusBarProps {
   vimMode?: VimMode
   connectionStatus?: EnvironmentStatus
   dbType?: DBType
   leftItems?: ReactNode
   className?: string
}

const connectionLabels: Record<EnvironmentStatus, { label: string; variant: "success" | "warning" | "destructive" | "secondary" }> = {
   creating: { label: "Creating...", variant: "warning" },
   running: { label: "Connected", variant: "success" },
   stopped: { label: "Disconnected", variant: "secondary" },
   error: { label: "Error", variant: "destructive" },
   destroyed: { label: "Destroyed", variant: "destructive" },
}

const dbTypeLabels: Record<DBType, string> = {
   postgres: "PG",
   mysql: "MySQL",
   sqlite: "SQLite",
}

export function StatusBar({
   vimMode,
   connectionStatus,
   dbType,
   leftItems,
   className,
}: StatusBarProps) {
   return (
      <div
         className={cn(
            "flex h-6 items-center justify-between border-t border-border bg-bg-primary px-3 text-[11px] font-sans text-text-muted shadow-[0_-1px_2px_rgba(0,0,0,0.1)] z-50 shrink-0",
            className
         )}
      >
         <div className="flex items-center gap-3 h-full">
            {leftItems}
         </div>
         <div className="flex items-center h-full">
            {vimMode && (
               <div className="flex items-center h-full border-l border-border/50 px-3">
                  <VimIndicator mode={vimMode} />
               </div>
            )}
            <div className="flex items-center h-full border-l border-border/50 px-3 tracking-wide">
               UTF-8
            </div>
            {dbType && (
               <div className="flex items-center h-full border-l border-border/50 px-3 tracking-wide font-medium">
                  {dbTypeLabels[dbType] ?? dbType}
               </div>
            )}
            <div className="flex items-center h-full border-l border-border/50 px-3 font-mono tracking-wide">
               Ln 1, Col 1
            </div>
         </div>
      </div>
   )
}
