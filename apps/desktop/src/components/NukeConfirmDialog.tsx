import { IconBomb, IconLoader2 } from "@tabler/icons-react"
import { Button } from "@sqlose/ui"

interface NukeConfirmDialogProps {
   open: boolean
   onCancel: () => void
   onConfirm: () => Promise<void>
   isLoading?: boolean
}

export function NukeConfirmDialog({ open, onCancel, onConfirm, isLoading }: NukeConfirmDialogProps) {
   if (!open) return null

   return (
      <div
         className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
         onClick={onCancel}
      >
         <div
            className="w-full max-w-md rounded-xl border border-border bg-bg-secondary p-8 shadow-2xl"
            onClick={e => e.stopPropagation()}
         >
            <div className="flex flex-col items-center text-center">
               <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border-2 border-warning/25 bg-warning/15">
                  <IconBomb className="h-6 w-6 text-warning" />
               </div>

               <h2 className="mb-2 text-lg font-semibold text-warning">Nuke Environment</h2>
               <p className="mb-6 text-sm text-text-muted">
                  Are you sure you want to nuke this environment? This will permanently delete the
                  container, all data, and the environment record. This action cannot be undone.
               </p>

               <div className="flex w-full gap-3">
                  <Button
                     variant="secondary"
                     size="default"
                     onClick={onCancel}
                     disabled={isLoading}
                     className="flex flex-1 items-center justify-center gap-2"
                  >
                     Cancel
                  </Button>
                  <Button
                     variant="destructive"
                     size="default"
                     onClick={onConfirm}
                     disabled={isLoading}
                     className="flex flex-1 items-center justify-center gap-2"
                  >
                     {isLoading ? (
                        <IconLoader2 className="h-4 w-4 animate-spin" />
                     ) : (
                        <IconBomb className="h-4 w-4" />
                     )}
                     {isLoading ? "Nuking..." : "Nuke"}
                  </Button>
               </div>
            </div>
         </div>
      </div>
   )
}
