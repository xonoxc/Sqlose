import { useState, useCallback } from "react"
import { Button, Modal, ModalPortal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalTitle, ModalDescription, Badge } from "@sqlose/ui"
import { IconPlayerPlay, IconPlayerStopFilled, IconRotate, IconTrash, IconBomb, IconLoader2 } from "@tabler/icons-react"
import type { Environment } from "@sqlose/shared"
import { useEnvironmentStore } from "../stores/environmentStore"

interface EnvironmentActionsProps {
   environment: Environment | null
}

export function EnvironmentActions({ environment }: EnvironmentActionsProps) {
   const [showDestroyConfirm, setShowDestroyConfirm] = useState(false)
   const [showNukeConfirm, setShowNukeConfirm] = useState(false)
   const startEnvironment = useEnvironmentStore((s) => s.startEnvironment)
   const stopEnvironment = useEnvironmentStore((s) => s.stopEnvironment)
   const restartEnvironment = useEnvironmentStore((s) => s.restartEnvironment)
   const destroyEnvironment = useEnvironmentStore((s) => s.destroyEnvironment)
   const nukeEnvironment = useEnvironmentStore((s) => s.nukeEnvironment)
   const isLoading = useEnvironmentStore((s) => s.isLoading)

   const handleStart = useCallback(() => {
      if (environment) startEnvironment(environment.id)
   }, [environment, startEnvironment])

   const handleStop = useCallback(() => {
      if (environment) stopEnvironment(environment.id)
   }, [environment, stopEnvironment])

   const handleRestart = useCallback(() => {
      if (environment) restartEnvironment(environment.id)
   }, [environment, restartEnvironment])

   const handleDestroy = useCallback(async () => {
      if (environment) {
         await destroyEnvironment(environment.id)
         setShowDestroyConfirm(false)
      }
   }, [environment, destroyEnvironment])

   const handleNuke = useCallback(async () => {
      if (environment) {
         await nukeEnvironment(environment.id)
         setShowNukeConfirm(false)
      }
   }, [environment, nukeEnvironment])

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
               <h3 className="text-sm font-medium text-text-primary">{environment.name || environment.dbType}</h3>
               <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant={environment.status === "running" ? "success" : environment.status === "error" ? "destructive" : "secondary"} className="text-[10px] px-1.5 py-0">
                     {environment.status}
                  </Badge>
                  <span className="text-[10px] text-text-muted font-mono">{environment.dbType}</span>
               </div>
            </div>
         </div>

         <div className="flex flex-wrap gap-1.5">
            <Button
               variant="success"
               size="sm"
               onClick={handleStart}
               disabled={environment.status === "running" || environment.status === "creating" || isLoading}
               className="h-7 text-xs gap-1"
            >
               {isLoading ? <IconLoader2 className="h-3 w-3 animate-spin" /> : <IconPlayerPlay className="h-3 w-3" />}
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
            <p className="text-[10px] text-text-muted font-mono">
               Uptime: {Math.floor(environment.uptime / 60)}m {environment.uptime % 60}s
            </p>
         )}

         <Modal open={showDestroyConfirm} onOpenChange={setShowDestroyConfirm}>
            {showDestroyConfirm && (
               <ModalPortal>
                  <ModalOverlay />
                  <ModalContent>
                     <ModalHeader>
                        <ModalTitle>Destroy Environment</ModalTitle>
                        <ModalDescription>
                           Are you sure you want to destroy <strong>{environment.name || environment.dbType}</strong>?
                           This will remove the container and all data. This action cannot be undone.
                        </ModalDescription>
                     </ModalHeader>
                     <ModalFooter>
                        <Button variant="secondary" size="sm" onClick={() => setShowDestroyConfirm(false)}>
                           Cancel
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleDestroy} disabled={isLoading}>
                           {isLoading ? "Destroying..." : "Destroy"}
                        </Button>
                     </ModalFooter>
                  </ModalContent>
               </ModalPortal>
            )}
         </Modal>

         <Modal open={showNukeConfirm} onOpenChange={setShowNukeConfirm}>
            {showNukeConfirm && (
               <ModalPortal>
                  <ModalOverlay />
                  <ModalContent>
                     <ModalHeader>
                        <ModalTitle>Nuke Environment</ModalTitle>
                        <ModalDescription>
                           Are you sure you want to nuke <strong>{environment.name || environment.dbType}</strong>?
                           This will permanently delete the container and ALL data. The environment will be kept in a clean state so you can start fresh.
                        </ModalDescription>
                     </ModalHeader>
                     <ModalFooter>
                        <Button variant="secondary" size="sm" onClick={() => setShowNukeConfirm(false)}>
                           Cancel
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleNuke} disabled={isLoading}>
                           {isLoading ? "Nuking..." : "Nuke"}
                        </Button>
                     </ModalFooter>
                  </ModalContent>
               </ModalPortal>
            )}
         </Modal>
      </div>
   )
}
