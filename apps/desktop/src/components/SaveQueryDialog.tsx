import { IconDeviceFloppy, IconLoader2, IconPencil } from "@tabler/icons-react"
import {
   Button,
   Input,
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@sqlose/ui"
import { useSaveQueryDialog } from "~/hooks/useSaveQueryDialog"

export interface SaveQueryDialogProps {
   open: boolean
   mode: "save" | "rename"
   onClose: () => void
}

export function SaveQueryDialog(props: SaveQueryDialogProps) {
   const {
      name,
      isLoading,
      handleConfirm,
      queries,
      setSelectedId,
      setName,
      selectedId,
      overlayRef,
      inputRef,
   } = useSaveQueryDialog(props)

   const { open, mode, onClose } = props

   if (!open) return null

   return (
      <div
         ref={overlayRef}
         tabIndex={-1}
         className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-[4px]"
         onClick={onClose}
         onKeyDown={e => {
            if (e.key === "Enter" && !isLoading && name.trim()) {
               handleConfirm()
            }
         }}
      >
         <div
            className="w-[420px] overflow-hidden rounded-[10px] border border-border bg-bg-secondary shadow-2xl"
            onClick={e => e.stopPropagation()}
         >
            <div className="flex flex-col items-center px-10 py-8 text-center">
               <div
                  className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${
                     mode === "save"
                        ? "bg-accent/15 text-white/60"
                        : "bg-amber-500/10 text-amber-400"
                  }`}
               >
                  {mode === "save" ? (
                     <IconDeviceFloppy size={34} stroke={1.5} />
                  ) : (
                     <IconPencil size={28} stroke={2} />
                  )}
               </div>

               <h2 className="text-[15px] font-semibold tracking-tight text-text-primary">
                  {mode === "save" ? "Save Query" : "Rename Query"}
               </h2>

               <p className="mt-3 max-w-[320px] text-[13px] leading-relaxed text-text-muted">
                  {mode === "save"
                     ? "Give your query a name to save it for later."
                     : "Enter a new name for this query."}
               </p>
            </div>

            <div className="px-10 pb-5">
               {mode === "rename" && queries.length > 1 && (
                  <div className="mb-3">
                     <Select
                        value={selectedId}
                        onValueChange={val => {
                           const q = queries.find(q => q.id === val)
                           setSelectedId(val)
                           if (q) {
                              setName(q.name)
                           }
                        }}
                     >
                        <SelectTrigger className="w-full h-11 rounded-xl bg-bg-tertiary px-3.5 text-[13px] text-text-primary border-border focus:ring-1 focus:ring-amber-400/20">
                           <SelectValue placeholder="Select a query" />
                        </SelectTrigger>
                        <SelectContent className="z-[110] bg-bg-tertiary border-border text-text-primary shadow-2xl w-full border-none">
                           {queries.map(q => (
                              <SelectItem key={q.id} value={q.id} className="text-[13px]">
                                 {q.name}
                              </SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                  </div>
               )}

               <Input
                  ref={inputRef}
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => {
                     if (e.key === "Enter" && name.trim() && !isLoading) {
                        handleConfirm()
                     }
                  }}
                  placeholder={mode === "save" ? "Query name..." : "New query name..."}
                  className="w-full bg-bg-tertiary text-[14px] text-text-primary px-3.5 py-2.5 rounded-md p-2 border border-border outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all placeholder:text-text-muted/40"
               />
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-border bg-bg-tertiary/40 px-5 py-5">
               <Button
                  variant="outline"
                  disabled={isLoading}
                  onClick={onClose}
                  className="h-11 rounded-lg text-[13px] font-medium"
               >
                  Cancel
               </Button>

               <Button
                  variant="default"
                  disabled={isLoading || !name.trim()}
                  onClick={handleConfirm}
                  className="h-11 gap-2 rounded-lg text-[13px] font-semibold flex items-center justify-center"
               >
                  {isLoading && <IconLoader2 className="h-4 w-4 animate-spin" />}
                  {isLoading
                     ? `${mode === "save" ? "Saving" : "Renaming"}...`
                     : mode === "save"
                       ? "Save"
                       : "Rename"}
               </Button>
            </div>
         </div>
      </div>
   )
}
