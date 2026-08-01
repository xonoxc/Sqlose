import { Button, Badge } from "@sqlose/ui"
import {
   IconPlayerPlay,
   IconPlayerStopFilled,
   IconRotate,
   IconTrash,
   IconBomb,
   IconLoader2,
} from "@tabler/icons-react"
import type { Environment } from "@sqlose/shared"
import { useEnvironmentActionsLogic } from "~/hooks/useEnvironmentActionsLogic"
import { DestroyConfirmDialog } from "~/components/DestroyConfirmDialog"
import { NukeConfirmDialog } from "~/components/NukeConfirmDialog"

interface EnvironmentActionsProps {
   environment: Environment | null
}

export function EnvironmentActions({ environment }: EnvironmentActionsProps) {
   const {
      showDestroyConfirm,
      setShowDestroyConfirm,
      showNukeConfirm,
      setShowNukeConfirm,
      isLoading,
      handleStart,
      handleStop,
      handleRestart,
      handleDestroy,
      handleNuke,
   } = useEnvironmentActionsLogic(environment)

   if (!environment) {
      return (
         <div className="flex items-center justify-center h-full text-text-muted text-sm">
            No environment selected
         </div>
      )
   }

   return (
      <div className="p-3 space-y-3">
         <div className="flex items-center justify-between">
            <div>
               <h3 className="text-sm font-medium text-text-primary">
                  {environment.name || environment.dbType}
               </h3>
               <div className="flex items-center gap-2 mt-0.5">
                  <Badge
                     variant={
                        environment.status === "running"
                           ? "success"
                           : environment.status === "error"
                             ? "destructive"
                             : "secondary"
                     }
                     className="text-[11px] px-1.5 py-0"
                  >
                     {environment.status}
                  </Badge>
                  <span className="text-[11px] text-text-muted font-mono">
                     {environment.dbType}
                  </span>
               </div>
            </div>
         </div>

         <div className="flex flex-wrap gap-1.5">
            <Button
               variant="success"
               size="sm"
               onClick={handleStart}
               disabled={
                  environment.status === "running" || environment.status === "creating" || isLoading
               }
               className="h-7 text-xs gap-1"
            >
               {isLoading ? (
                  <IconLoader2 className="h-3 w-3 animate-spin" />
               ) : (
                  <IconPlayerPlay className="h-3 w-3" />
               )}
               Start
            </Button>
            <Button
               variant="secondary"
               size="sm"
               onClick={handleStop}
               disabled={environment.status !== "running" || isLoading}
               className="h-7 text-xs gap-1"
            >
               <IconPlayerStopFilled className="h-3 w-3" />
               Stop
            </Button>
            <Button
               variant="secondary"
               size="sm"
               onClick={handleRestart}
               disabled={environment.status !== "running" || isLoading}
               className="h-7 text-xs gap-1"
            >
               <IconRotate className="h-3 w-3" />
               Restart
            </Button>
            <Button
               variant="destructive"
               size="sm"
               onClick={() => setShowDestroyConfirm(true)}
               disabled={isLoading}
               className="h-7 text-xs gap-1"
            >
               <IconTrash className="h-3 w-3" />
               Destroy
            </Button>
            <Button
               variant="destructive"
               size="sm"
               onClick={() => setShowNukeConfirm(true)}
               disabled={environment.status === "creating" || isLoading}
               className="h-7 text-xs gap-1"
            >
               <IconBomb className="h-3 w-3" />
               Nuke
            </Button>
         </div>

         {environment.status === "running" && environment.uptime !== null && (
            <p className="text-[11px] text-text-muted font-mono">
               Uptime: {Math.floor(environment.uptime / 60)}m {environment.uptime % 60}s
            </p>
         )}

         <DestroyConfirmDialog
            environment={environment}
            open={showDestroyConfirm}
            isLoading={isLoading}
            onOpenChange={setShowDestroyConfirm}
            onConfirm={handleDestroy}
         />

         <NukeConfirmDialog
            environment={environment}
            open={showNukeConfirm}
            isLoading={isLoading}
            onOpenChange={setShowNukeConfirm}
            onConfirm={handleNuke}
         />
      </div>
   )
}
