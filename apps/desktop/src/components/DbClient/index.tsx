import { useEffect } from "react"
import { IconPlugConnected } from "@tabler/icons-react"
import { DbClientConnectionList } from "./DbClientConnectionList"
import { DbClientWorkspace } from "./DbClientWorkspace"
import { useDbClientStore } from "~/stores/dbClientStore"

export function DbClientView() {
   const { selectedConnectionId, loadConnections } = useDbClientStore()

   useEffect(() => {
      loadConnections()
   }, [])

   return (
      <div className="flex h-full overflow-hidden">
         {/* Left sidebar: connection list */}
         <div className="w-[220px] shrink-0 border-r border-border/20 bg-bg-secondary flex flex-col">
            <DbClientConnectionList />
         </div>

         {/* Main area */}
         <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
            {selectedConnectionId ? (
               <DbClientWorkspace connectionId={selectedConnectionId} />
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
                  <div className="h-16 w-16 rounded-3xl bg-bg-tertiary border border-border/50 flex items-center justify-center">
                     <IconPlugConnected className="h-7 w-7 text-text-muted/50" />
                  </div>
                  <div>
                     <p className="text-[15px] font-semibold text-text-primary/80">
                        Select a Connection
                     </p>
                     <p className="text-[13px] text-text-muted mt-1.5 max-w-[280px]">
                        Choose an existing connection from the sidebar, or add a new one to start querying.
                     </p>
                  </div>
               </div>
            )}
         </div>
      </div>
   )
}

export { DbClientConnectionList } from "./DbClientConnectionList"
export { DbClientWorkspace } from "./DbClientWorkspace"
export { AddConnectionDialog } from "./AddConnectionDialog"
