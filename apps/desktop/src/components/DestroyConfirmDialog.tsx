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

interface DestroyConfirmDialogProps {
   environment: Environment | null
   open: boolean
   isLoading: boolean
   onOpenChange: (open: boolean) => void
   onConfirm: () => void
}

export function DestroyConfirmDialog({
   environment,
   open,
   isLoading,
   onOpenChange,
   onConfirm,
}: DestroyConfirmDialogProps) {
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
                     <ModalTitle>Destroy Environment</ModalTitle>
                     <ModalDescription>
                        Are you sure you want to destroy{" "}
                        <strong>{environment.name || environment.dbType}</strong>? This will remove
                        the container and all data. This action cannot be undone.
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
                        {isLoading ? "Destroying..." : "Destroy"}
                     </Button>
                  </ModalFooter>
               </ModalContent>
            </ModalPortal>
         )}
      </Modal>
   )
}
