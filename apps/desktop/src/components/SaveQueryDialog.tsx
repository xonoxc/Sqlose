import { useEffect, useRef, useState } from "react"
import { IconDeviceFloppy, IconLoader2, IconPencil } from "@tabler/icons-react"
import { Button } from "@sqlose/ui"
import { useSavedQueriesStore } from "~/stores/savedQueriesStore"
import { useWorkspaceStore } from "~/stores/workspaceStore"
import { useEnvironmentStore } from "~/stores/environmentStore"
import { toast } from "sonner"

interface SaveQueryDialogProps {
   open: boolean
   mode: "save" | "rename"
   onClose: () => void
}

export function SaveQueryDialog({ open, mode, onClose }: SaveQueryDialogProps) {
   const inputRef = useRef<HTMLInputElement>(null)
   const overlayRef = useRef<HTMLDivElement>(null)
   const [name, setName] = useState("")
   const [selectedId, setSelectedId] = useState("")
   const [isLoading, setIsLoading] = useState(false)

   const queries = useSavedQueriesStore(s => s.queries)
   const saveQuery = useSavedQueriesStore(s => s.saveQuery)
   const updateQuery = useSavedQueriesStore(s => s.updateQuery)
   const selectedEnvironmentId = useEnvironmentStore(s => s.selectedEnvironmentId)

   useEffect(() => {
      if (open) {
         overlayRef.current?.focus()
         if (mode === "rename") {
            const activeTab = useWorkspaceStore.getState().tabs.find(
               t => t.id === useWorkspaceStore.getState().activeTabId
            )
            const matchId = activeTab?.savedQueryId
            const match = matchId ? queries.find(q => q.id === matchId) : null
            const initial = match ?? queries[0] ?? null
            setSelectedId(initial?.id ?? "")
            setName(initial?.name ?? "")
         } else {
            const activeTab = useWorkspaceStore.getState().tabs.find(
               t => t.id === useWorkspaceStore.getState().activeTabId
            )
            const matchId = activeTab?.savedQueryId
            const match = matchId ? queries.find(q => q.id === matchId) : null
            setName(match?.name ?? "")
            setSelectedId("")
         }
         setTimeout(() => inputRef.current?.focus(), 50)
      }
   }, [open, mode, queries])

   const handleConfirm = async () => {
      if (!name.trim()) {
         return 
      }      setIsLoading(true)
      try {
         if (mode === "save") {
            const state = useWorkspaceStore.getState()
            const activeTab = state.tabs.find(t => t.id === state.activeTabId)
            const sql = activeTab?.query ?? ""
            const result = await saveQuery(name.trim(), sql, [], selectedEnvironmentId, activeTab?.result ?? null)
            if (result.isOk()) {
               const saved = result.value
               if (activeTab) {
                  useWorkspaceStore.getState().updateTab(activeTab.id, {
                     savedQueryId: saved.id,
                     title: saved.name,
                     isDirty: false,
                  })
               }
               toast.success("Query saved")
               onClose()
            } else {
               toast.error("Failed to save query")
            }
         } else {
            if (!selectedId) {
               return 
            }            const result = await updateQuery(selectedId, { name: name.trim() })
            if (result.isOk()) {
               const state = useWorkspaceStore.getState()
               const tab = state.tabs.find(t => t.savedQueryId === selectedId)
               if (tab) {
                  useWorkspaceStore.getState().updateTab(tab.id, { title: name.trim() })
               }
               toast.success("Query renamed")
               onClose()
            } else {
               toast.error("Failed to rename query")
            }
         }
      } catch {
         toast.error(mode === "save" ? "Failed to save query" : "Failed to rename query")
      } finally {
         setIsLoading(false)
      }
   }

   if (!open) {
      return null
   }

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
            className="w-[420px] overflow-hidden rounded-[20px] border border-border bg-bg-secondary shadow-2xl"
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
                     <select
                        value={selectedId}
                        onChange={e => {
                           const q = queries.find(q => q.id === e.target.value)
                           setSelectedId(e.target.value)
                           if (q) setName(q.name)
                        }}
                        className="w-full bg-bg-tertiary text-[13px] text-text-primary px-3.5 py-2.5 rounded-xl border border-border outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 transition-all"
                     >
                        {queries.map(q => (
                           <option key={q.id} value={q.id}>
                              {q.name}
                           </option>
                        ))}
                     </select>
                  </div>
               )}

               <input
                  ref={inputRef}
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => {
                     if (e.key === "Enter" && name.trim() && !isLoading) {
                        handleConfirm()
                     }
                  }}
                  placeholder={
                     mode === "save" ? "Query name..." : "New query name..."
                  }
                  className="w-full bg-bg-tertiary text-[14px] text-text-primary px-3.5 py-2.5 rounded-xl border border-border outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all placeholder:text-text-muted/40"
               />
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-border bg-bg-tertiary/40 px-5 py-5">
               <Button
                  variant="outline"
                  disabled={isLoading}
                  onClick={onClose}
                  className="h-11 rounded-xl text-[13px] font-medium"
               >
                  Cancel
               </Button>

               <Button
                  variant="default"
                  disabled={isLoading || !name.trim()}
                  onClick={handleConfirm}
                  className="h-11 gap-2 rounded-xl text-[13px] font-semibold flex items-center justify-center"
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
