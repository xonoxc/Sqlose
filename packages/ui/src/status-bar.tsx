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
            "flex h-6 items-center justify-between border-t border-border bg-bg-tertiary px-3 text-xs text-text-muted",
            className
         )}
      >
         <div className="flex items-center gap-3">
            {vimMode && <VimIndicator mode={vimMode} />}
            {leftItems}
         </div>
         <div className="flex items-center gap-3">
            {connectionStatus && (
               <Badge variant={connectionLabels[connectionStatus].variant} className="text-[10px] px-1.5 py-0">
                  {connectionLabels[connectionStatus].label}
               </Badge>
            )}
            {dbType && (
               <span className="font-mono text-[10px] text-text-muted uppercase">
                  {dbTypeLabels[dbType]}
               </span>
            )}
         </div>
      </div>
   )
}
