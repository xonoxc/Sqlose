import {
   Button,
   Modal,
   ModalPortal,
   ModalOverlay,
   ModalContent,
   ModalHeader,
   ModalFooter,
   ModalTitle,
   ModalDescription,
} from "@sqlose/ui"
import type { Environment } from "@sqlose/shared"

interface NukeConfirmDialogProps {
   environment: Environment | null
   open: boolean
   isLoading: boolean
   onOpenChange: (open: boolean) => void
   onConfirm: () => void
}

export function NukeConfirmDialog({
   environment,
   open,
   isLoading,
   onOpenChange,
   onConfirm,
}: NukeConfirmDialogProps) {
   if (!environment) {
      return null
   }

   return (
      <Modal open={open} onOpenChange={onOpenChange}>
         {open && (
            <ModalPortal>
               <ModalOverlay />
               <ModalContent>
                  <ModalHeader>
                     <ModalTitle>Nuke Environment</ModalTitle>
                     <ModalDescription>
                        Are you sure you want to nuke{" "}
                        <strong>{environment.name || environment.dbType}</strong>? This will
                        permanently delete the container and ALL data. The environment will be kept
                        in a clean state so you can start fresh.
                     </ModalDescription>
                  </ModalHeader>
                  <ModalFooter>
                     <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                     >
                        Cancel
                     </Button>
                     <Button variant="destructive" size="sm" onClick={onConfirm} disabled={isLoading}>
                        {isLoading ? "Nuking..." : "Nuke"}
                     </Button>
                  </ModalFooter>
               </ModalContent>
            </ModalPortal>
         )}
      </Modal>
   )
}
