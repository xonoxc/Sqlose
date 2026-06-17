import { useEffect, useRef } from "react"
import { useWorkspaceStore } from "~/stores/workspaceStore"
import { useEnvironmentStore } from "~/stores/environmentStore"
import { isMac } from "~/lib/types"

interface ShortcutActions {
   onShortcuts: () => void
   onPalette: () => void
   onExecute: () => void
}

export function useKeyboardShortcuts({ onShortcuts, onPalette, onExecute }: ShortcutActions) {
   const onShortcutsRef = useRef(onShortcuts)
   const onPaletteRef = useRef(onPalette)
   const onExecuteRef = useRef(onExecute)
   onShortcutsRef.current = onShortcuts
   onPaletteRef.current = onPalette
   onExecuteRef.current = onExecute

   useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
         const envId = useEnvironmentStore.getState().selectedEnvironmentId

         if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
            if (!envId) return
            e.preventDefault()
            onShortcutsRef.current()
            return
         }

         const mod = isMac() ? e.metaKey : e.ctrlKey
         if (!mod) return

         if (e.key === "k") {
            if (!envId) return
            e.preventDefault()
            onPaletteRef.current()
            return
         }

         if (e.key === "Enter") {
            e.preventDefault()
            onExecuteRef.current()
            return
         }

         if (!e.shiftKey && e.key === "n") {
            e.preventDefault()
            useWorkspaceStore.getState().openTab()
            return
         }

         if (e.key === "w") {
            e.preventDefault()
            const id = useWorkspaceStore.getState().activeTabId
            if (id) {
               useWorkspaceStore.getState().closeTab(id)
            }
            return
         }

         if (e.key === "Tab") {
            e.preventDefault()
            const { tabs, activeTabId } = useWorkspaceStore.getState()
            const currentIndex = tabs.findIndex(t => t.id === activeTabId)
            if (currentIndex === -1) return
            const nextIndex = (currentIndex + (e.shiftKey ? -1 : 1) + tabs.length) % tabs.length
            if (nextIndex !== currentIndex) {
               useWorkspaceStore.getState().setActiveTab(tabs[nextIndex].id)
            }
            return
         }
      }

      document.addEventListener("keydown", handleKeyDown, true)
      return () => document.removeEventListener("keydown", handleKeyDown, true)
   }, [])
}
