import { useEffect, useRef, useState } from "react"
import { useSavedQueriesStore } from "~/stores/savedQueriesStore"
import { useWorkspaceStore } from "~/stores/workspaceStore"
import { useEnvironmentStore } from "~/stores/environmentStore"
import { toast } from "sonner"

import type { SaveQueryDialogProps } from "~/components/SaveQueryDialog"

export function useSaveQueryDialog({ open, mode, onClose }: SaveQueryDialogProps) {
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
            const activeTab = useWorkspaceStore
               .getState()
               .tabs.find(t => t.id === useWorkspaceStore.getState().activeTabId)

            const matchId = activeTab?.savedQueryId
            const match = matchId ? queries.find(q => q.id === matchId) : null
            const initial = match ?? queries[0] ?? null
            setSelectedId(initial?.id ?? "")
            setName(initial?.name ?? "")
         } else {
            const activeTab = useWorkspaceStore
               .getState()
               .tabs.find(t => t.id === useWorkspaceStore.getState().activeTabId)

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
      }
      setIsLoading(true)
      try {
         if (mode === "save") {
            const state = useWorkspaceStore.getState()
            const activeTab = state.tabs.find(t => t.id === state.activeTabId)
            const sql = activeTab?.query ?? ""
            const result = await saveQuery(
               name.trim(),
               sql,
               [],
               selectedEnvironmentId,
               activeTab?.result ?? null
            )
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
            }
            const result = await updateQuery(selectedId, { name: name.trim() })
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

   return {
      queries,
      selectedId,
      setSelectedId,
      overlayRef,
      inputRef,

      isLoading,
      handleConfirm,

      name,
      setName,
   }
}
