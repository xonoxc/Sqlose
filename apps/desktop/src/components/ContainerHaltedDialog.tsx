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
               <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border-2 border-warning/25 bg-warning/15">
                  <IconBomb className="h-6 w-6 text-warning" />
               </div>

               <h2 className="mb-2 text-lg font-semibold text-warning">Container Halted</h2>
               <p className="mb-1 text-sm text-text-muted">
                  The database container for <strong className="text-warning">{envName}</strong> is
                  available but halted.
               </p>
               <p className="mb-6 text-sm text-text-muted">
                  Would you like to restore it or nuke the environment?
               </p>

               <div className="flex w-full gap-3">
                  <Button
                     variant="destructive"
                     size="default"
                     onClick={onNuke}
                     className="flex flex-1 items-center justify-center gap-2"
                  >
                     <IconBomb className="h-4 w-4" />
                     Exit & Nuke
                  </Button>
                  <Button
                     variant="secondary"
                     size="default"
                     onClick={onRestore}
                     className="flex flex-1 items-center justify-center gap-2 text-warning border border-warning/25 bg-warning/15 hover:bg-warning/20"
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
