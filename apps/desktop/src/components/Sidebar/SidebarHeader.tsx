import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@sqlose/ui"
import {
   IconDatabase,
   IconSettings,
   IconLayoutSidebarLeftCollapse,
} from "@tabler/icons-react"
import type { Environment } from "@sqlose/shared"

interface SidebarHeaderProps {
   environments: Environment[]
   selectedEnvironmentId: string | null
   handleSelect: (id: string) => void
   onSettingsOpen: () => void
   onToggleCollapse: () => void
}

export function SidebarHeader({
   environments,
   selectedEnvironmentId,
   handleSelect,
   onSettingsOpen,
   onToggleCollapse,
}: SidebarHeaderProps) {
   return (
      <div className="flex items-center justify-between w-full gap-1 px-3 h-12 shrink-0">
         <Select value={selectedEnvironmentId ?? ""} onValueChange={handleSelect}>
            <SelectTrigger className="w-full bg-transparent border-transparent shadow-none hover:bg-bg-quaternary/30 focus:ring-0 px-2 h-9 transition-colors truncate">
               <div className="flex items-center gap-2 truncate">
                  <div className="h-6 w-6 rounded bg-bg-tertiary border border-border/50 flex items-center justify-center text-white/80 shrink-0">
                     <IconDatabase className="h-3.5 w-3.5 text-white/80" />
                  </div>
                  <SelectValue placeholder="Select Database" />
               </div>
            </SelectTrigger>
            <SelectContent className="min-w-[200px] shadow-2xl !border-0 bg-bg-tertiary">
               {environments.map((env: Environment) => (
                  <SelectItem key={env.id} value={env.id} className="text-[13px]">
                     {env.name || `${env.dbType} ${env.port}`}
                  </SelectItem>
               ))}
            </SelectContent>
         </Select>
         <div className="flex items-center shrink-0 gap-2">
            <button
               onClick={onSettingsOpen}
               className="h-7 w-7 rounded flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-quaternary transition-colors"
               aria-label="Settings"
            >
               <IconSettings className="h-4.5 w-4.5" />
            </button>
            <button
               onClick={onToggleCollapse}
               className="h-5 w-5 rounded flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-quaternary transition-colors"
               aria-label="Collapse sidebar"
            >
               <IconLayoutSidebarLeftCollapse className="h-4.2 w-4.2" />
            </button>
         </div>
      </div>
   )
}
