import { useState, useCallback, useEffect, useRef, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@sqlose/ui"
import { IconSearch, IconDatabase, IconFileCode, IconPackage } from "@tabler/icons-react"
import { api } from "../lib/api"
import { queryKeys, unwrapAsyncResult } from "../lib/query"
import { useEnvironmentStore } from "../stores/environmentStore"
import { useWorkspaceStore } from "../stores/workspaceStore"
import { useEditorStore } from "../stores/editorStore"

interface CommandPaletteProps {
   isOpen: boolean
   onClose: () => void
}

interface PaletteItem {
   id: string
   label: string
   description: string
   icon: React.ReactNode
   onSelect: () => void
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
   const [query, setQuery] = useState("")
   const [selectedIndex, setSelectedIndex] = useState(0)
   const inputRef = useRef<HTMLInputElement>(null)

   const environments = useEnvironmentStore((s) => s.environments)
   const selectEnvironment = useEnvironmentStore((s) => s.selectEnvironment)
   const setSelectedEnvironment = useEditorStore((s) => s.setSelectedEnvironment)
   const openTab = useWorkspaceStore((s) => s.openTab)

   const { data: datasets = [] } = useQuery({
      queryKey: queryKeys.datasets.list(),
      queryFn: () => unwrapAsyncResult(api.dataset.list()),
      enabled: isOpen,
   })

   const handleSelectEnvironment = useCallback(
      (envId: string) => {
         selectEnvironment(envId)
         setSelectedEnvironment(envId)
         openTab(envId)
      },
      [selectEnvironment, setSelectedEnvironment, openTab],
   )

   const items = useMemo<PaletteItem[]>(
      () => [
         ...environments.map((env) => ({
            id: `env-${env.id}`,
            label: env.name || `${env.dbType} environment`,
            description: `${env.dbType} · ${env.status}`,
            icon: <IconDatabase className="h-4 w-4" />,
            onSelect: () => handleSelectEnvironment(env.id),
         })),
         ...datasets.map((ds) => ({
            id: `ds-${ds.id}`,
            label: ds.name,
            description: ds.description,
            icon: <IconPackage className="h-4 w-4" />,
            onSelect: () => openTab(),
         })),
         {
            id: "new-query",
            label: "New Query",
            description: "Open a new query tab",
            icon: <IconFileCode className="h-4 w-4" />,
            onSelect: () => openTab(),
         },
      ],
      [environments, datasets, handleSelectEnvironment, openTab],
   )

   const filteredItems = useMemo(
      () =>
         items.filter(
            (item) =>
               !query ||
               item.label.toLowerCase().includes(query.toLowerCase()) ||
               item.description.toLowerCase().includes(query.toLowerCase()),
         ),
      [items, query],
   )

   useEffect(() => {
      if (isOpen) {
         setQuery("")
         setSelectedIndex(0)
         setTimeout(() => inputRef.current?.focus(), 50)
      }
   }, [isOpen])

   useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
         if (!isOpen) return

         if (e.key === "Escape") {
            e.preventDefault()
            onClose()
            return
         }

         if (e.key === "ArrowDown") {
            e.preventDefault()
            setSelectedIndex((prev) => Math.min(prev + 1, filteredItems.length - 1))
            return
         }

         if (e.key === "ArrowUp") {
            e.preventDefault()
            setSelectedIndex((prev) => Math.max(prev - 1, 0))
            return
         }

         if (e.key === "Enter" && filteredItems[selectedIndex]) {
            e.preventDefault()
            filteredItems[selectedIndex].onSelect()
            onClose()
         }
      }

      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
   }, [isOpen, onClose, selectedIndex, filteredItems])

   return (
      <AnimatePresence>
         {isOpen && (
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.15 }}
               className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-[2px]"
               onClick={onClose}
            >
               <motion.div
                  initial={{ opacity: 0, scale: 0.97, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: -10 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="w-full max-w-2xl bg-bg-primary/95 backdrop-blur-xl rounded-xl border border-border shadow-2xl overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
               >
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50">
                     <IconSearch className="h-5 w-5 text-text-muted shrink-0" />
                     <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => {
                           setQuery(e.target.value)
                           setSelectedIndex(0)
                        }}
                        placeholder="Search environments, datasets, actions..."
                        className="flex-1 bg-transparent text-[15px] font-medium text-text-primary outline-none placeholder:text-text-muted/60"
                     />
                     <kbd className="text-[10px] text-text-muted font-mono border border-border/50 bg-bg-secondary rounded px-1.5 py-0.5 shadow-sm">
                        ESC
                     </kbd>
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto py-2 custom-scrollbar">
                     {filteredItems.length === 0 && (
                        <div className="px-4 py-12 text-center flex flex-col items-center">
                           <IconSearch className="h-8 w-8 text-text-muted/50 mb-3" />
                           <span className="text-sm text-text-muted">No results found for &quot;{query}&quot;</span>
                        </div>
                     )}
                     {filteredItems.map((item, index) => (
                        <button
                           key={item.id}
                           onClick={() => {
                              item.onSelect()
                              onClose()
                           }}
                           onMouseEnter={() => setSelectedIndex(index)}
                           className={cn(
                              "flex w-full items-center gap-4 px-5 py-3 text-left transition-all duration-75 outline-none",
                              index === selectedIndex ? "bg-bg-quaternary/60 text-text-primary border-l-2 border-accent" : "text-text-secondary border-l-2 border-transparent",
                           )}
                        >
                           <div className={cn("flex items-center justify-center h-8 w-8 rounded-md shrink-0 transition-colors", index === selectedIndex ? "bg-bg-primary shadow-sm text-accent" : "bg-bg-quaternary text-text-muted")}>
                              {item.icon}
                           </div>
                           <div className="flex-1 min-w-0 flex flex-col">
                              <span className={cn("text-[13px] font-medium truncate", index === selectedIndex ? "text-text-primary" : "text-text-secondary")}>{item.label}</span>
                              <span className="text-[11px] text-text-muted truncate mt-0.5">{item.description}</span>
                           </div>
                        </button>
                     ))}
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
   )
}
