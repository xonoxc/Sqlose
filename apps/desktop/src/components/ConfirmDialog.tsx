import { IconLoader2, IconTrash } from "@tabler/icons-react"
import { Button } from "@sqlose/ui"
import { useRef, useEffect, type ReactNode } from "react"

interface ConfirmDialogProps {
   open: boolean
   onCancel: () => void
   onConfirm: () => Promise<void>
   isLoading?: boolean
   title?: string
   description?: string | ReactNode
   confirmText?: string
}

export function ConfirmDialog({
   open,
   onCancel,
   onConfirm,
   isLoading,
   title = "Delete environment?",
   description = "This will permanently delete this environment, container data and records. This action cannot be undone.",
   confirmText = "Delete",
}: ConfirmDialogProps) {
   const overlayRef = useRef<HTMLDivElement>(null)

   useEffect(() => {
      if (open) {
         overlayRef.current?.focus()
      }
   }, [open])

   if (!open) return null

   return (
      <div
         ref={overlayRef}
         tabIndex={-1}
         className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-[4px]"
         onClick={onCancel}
         onKeyDown={e => {
            if (e.key === "Enter" && !isLoading) {
               onConfirm()
            }
         }}
      >
         <div
            className="w-[420px] overflow-hidden rounded-[20px] border border-border bg-bg-secondary shadow-2xl"
            onClick={e => e.stopPropagation()}
         >
            <div className="flex flex-col items-center px-10 py-8 text-center">
               <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-error/15 text-error">
                  <IconTrash size={28} stroke={2} />
               </div>

               <h2 className="text-[15px] font-semibold tracking-tight text-text-primary">
                  {title}
               </h2>

               <p className="mt-3 max-w-[320px] text-[13px] leading-relaxed text-text-muted">
                  {description}
               </p>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-border bg-bg-tertiary/40 px-5 py-5">
               <Button
                  variant="outline"
                  disabled={isLoading}
                  onClick={onCancel}
                  className="h-11 rounded-xl text-[13px] font-medium"
               >
                  Cancel
               </Button>

               <Button
                  variant="destructive"
                  disabled={isLoading}
                  onClick={onConfirm}
                  className="h-11 gap-2 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2"
               >
                  {isLoading && <IconLoader2 className="h-4 w-4 animate-spin" />}
                  {isLoading ? `${confirmText}ing...` : confirmText}
               </Button>
            </div>
         </div>
      </div>
   )
}
