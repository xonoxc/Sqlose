import type { ReactNode } from "react"
import { IconCode, IconBookmark, IconHistory } from "@tabler/icons-react"

interface WorkspaceNavProps {
   savedQueriesCount: number
   historyCount: number
   handleNavClick: (type: "playground" | "saved" | "history") => void
}

function NavItem({
   icon,
   label,
   badge,
   onClick,
}: {
   icon: ReactNode
   label: string
   badge?: string
   onClick: () => void
}) {
   return (
      <button
         onClick={onClick}
         className="flex w-full items-center gap-2.5 px-3 py-1.5 rounded-md text-[13px] font-medium text-white/65 hover:text-white hover:bg-bg-quaternary/40 transition-all outline-none focus-visible:ring-1 focus-visible:ring-white/40"
      >
         <span className="shrink-0 text-text-muted">{icon}</span>
         <span className="truncate flex-1 text-left">{label}</span>
         {badge && (
            <span className="text-[10px] font-mono text-text-muted bg-bg-tertiary px-1.5 py-0.5 rounded">
               {badge}
            </span>
         )}
      </button>
   )
}

export function WorkspaceNav({
   savedQueriesCount,
   historyCount,
   handleNavClick,
}: WorkspaceNavProps) {
   return (
      <div className="px-3 pt-1 pb-0.5">
         <div className="flex items-center gap-1.5 px-2 py-1.5 mb-0.5">
            <span className="text-[12px] font-semibold tracking-widest uppercase text-text-muted/60">
               Workspace
            </span>
         </div>
         <div className="flex flex-col gap-0.5">
            <NavItem
               icon={<IconCode className="h-3.5 w-3.5" />}
               label="New Query"
               onClick={() => handleNavClick("playground")}
            />
            <NavItem
               icon={<IconBookmark className="h-3.5 w-3.5" />}
               label="Saved Queries"
               badge={savedQueriesCount > 0 ? String(savedQueriesCount) : undefined}
               onClick={() => handleNavClick("saved")}
            />
            <NavItem
               icon={<IconHistory className="h-3.5 w-3.5" />}
               label="History"
               badge={historyCount > 0 ? String(historyCount) : undefined}
               onClick={() => handleNavClick("history")}
            />
         </div>
      </div>
   )
}
