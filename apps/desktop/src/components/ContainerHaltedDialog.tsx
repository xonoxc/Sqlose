import { IconBomb, IconPlayerPlay } from "@tabler/icons-react"
import { Button } from "@sqlose/ui"

interface ContainerHaltedDialogProps {
   envName: string
   onRestore: () => void
   onNuke: () => void
}

export function ContainerHaltedDialog({ envName, onRestore, onNuke }: ContainerHaltedDialogProps) {
   return (
      <div
         className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
         onKeyDown={e => e.preventDefault()}
      >
         <div className="w-full max-w-md rounded-xl border border-border bg-bg-secondary p-8 shadow-2xl">
            <div className="flex flex-col items-center text-center">
               <div className="mb-5 h-14 w-14 rounded-full bg-warning/15 border border-warning/25 flex items-center justify-center">
                  <IconBomb className="h-6 w-6 text-warning" />
               </div>
               <h2 className="text-lg font-semibold text-text-primary mb-2">
                  Container Halted
               </h2>
               <p className="text-sm text-text-muted mb-1">
                  The database container for{" "}
                  <strong className="text-text-primary">{envName}</strong>{" "}
                  is available but halted.
               </p>
               <p className="text-sm text-text-muted mb-6">
                  Would you like to restore it or nuke the environment?
               </p>
               <div className="flex gap-3 w-full">
                  <Button
                     variant="destructive"
                     size="default"
                     onClick={onNuke}
                     className="flex-1 gap-2"
                  >
                     <IconBomb className="h-4 w-4" />
                     Exit &amp; Nuke
                  </Button>
                  <Button
                     variant="default"
                     size="default"
                     onClick={onRestore}
                     className="flex-1 gap-2"
                  >
                     <IconPlayerPlay className="h-4 w-4" />
                     Restore
                  </Button>
               </div>
            </div>
         </div>
      </div>
   )
}
