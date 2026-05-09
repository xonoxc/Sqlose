import { useCallback } from "react"
import { Sidebar as SidebarUI } from "@sqlose/ui"
import type { Environment } from "@sqlose/shared"
import type { SidebarItem } from "@sqlose/ui"
import { useEnvironmentStore } from "../stores/environmentStore"
import { useEditorStore } from "../stores/editorStore"

interface AppSidebarProps {
   onSettingsOpen: () => void
}

const statusVariant: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
   running: "success",
   creating: "warning",
   stopped: "secondary",
   error: "destructive",
   destroyed: "destructive",
}

export function AppSidebar({ onSettingsOpen }: AppSidebarProps) {
   const environments = useEnvironmentStore((s) => s.environments)
   const selectedEnvironmentId = useEnvironmentStore((s) => s.selectedEnvironmentId)
   const selectEnvironment = useEnvironmentStore((s) => s.selectEnvironment)
   const setSelectedEnvironment = useEditorStore((s) => s.setSelectedEnvironment)

   const handleSelect = useCallback(
      (id: string) => {
         selectEnvironment(id)
         setSelectedEnvironment(id)
      },
      [selectEnvironment, setSelectedEnvironment],
   )

   const environmentItems: SidebarItem[] = environments.map((env: Environment) => ({
      id: env.id,
      label: env.name || `${env.dbType} ${env.port}`,
      badge: env.status,
      badgeVariant: statusVariant[env.status] ?? "secondary",
   }))

   return (
      <SidebarUI
         items={environmentItems}
         selectedId={selectedEnvironmentId ?? undefined}
         onSelect={handleSelect}
         searchPlaceholder=""
         header={
            <div className="flex items-center justify-between w-full app-no-drag cursor-pointer group" onClick={onSettingsOpen}>
               <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded bg-[#222] border border-[#333] flex items-center justify-center text-accent">
                     <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m8 17 4 4 4-4"/></svg>
                  </div>
                  <span className="text-[13px] font-semibold text-text-primary tracking-wide">Demo Database</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted group-hover:text-text-primary transition-colors ml-1"><path d="m6 9 6 6 6-6"/></svg>
               </div>
               <div className="flex gap-1">
                  <button className="h-6 w-6 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors" aria-label="Collapse sidebar">
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  </button>
               </div>
            </div>
         }
      />
   )
}
