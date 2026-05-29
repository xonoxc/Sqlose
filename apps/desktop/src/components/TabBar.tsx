import { motion, AnimatePresence } from "motion/react"
import { cn } from "@sqlose/ui"
import { IconX, IconPlus, IconLoader2, IconTable } from "@tabler/icons-react"
import type { Tab } from "../lib/types"
import { useTabBarLogic } from "../hooks/useTabBarLogic"

export function TabBar() {
   const {
      tabs,
      activeTabId,
      handleOpenTab,
      handleCloseTab,
      handleSetActiveTab,
      handleDragStart,
      handleDragOver,
      handleDragEnd,
   } = useTabBarLogic()

   return (
      <div className="flex h-full w-full items-end gap-2 overflow-hidden">
         <div className="flex-1 flex items-center gap-1.5 overflow-x-auto scrollbar-custom-subtle px-1 min-h-[44px]">
            <style>{`
               .scrollbar-custom-subtle::-webkit-scrollbar {
                  height: 2px;
               }
               .scrollbar-custom-subtle::-webkit-scrollbar-track {
                  background: transparent;
               }
               .scrollbar-custom-subtle::-webkit-scrollbar-thumb {
                  background: transparent;
                  border-radius: 10px;
               }
               .scrollbar-custom-subtle:hover::-webkit-scrollbar-thumb {
                  background: var(--color-border);
               }
            `}</style>
            <AnimatePresence mode="popLayout">
               {tabs.map((tab, index) => (
                  <TabItem
                     key={tab.id}
                     tab={tab}
                     isActive={tab.id === activeTabId}
                     onSelect={() => handleSetActiveTab(tab.id)}
                     onClose={e => {
                        e.stopPropagation()
                        handleCloseTab(tab.id)
                     }}
                     onDragStart={() => handleDragStart(index)}
                     onDragOver={() => handleDragOver(index)}
                     onDragEnd={handleDragEnd}
                  />
               ))}
            </AnimatePresence>
         </div>

         <button
            onClick={() => handleOpenTab()}
            className="flex items-center justify-center h-8 w-8 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-quaternary/50 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent mb-[7px]"
            aria-label="New tab"
         >
            <IconPlus className="h-4 w-4" />
         </button>
      </div>
   )
}

function TabItem({
   tab,
   isActive,
   onSelect,
   onClose,
   onDragStart,
   onDragOver,
   onDragEnd,
}: {
   tab: Tab
   isActive: boolean
   onSelect: () => void
   onClose: (e: React.MouseEvent) => void
   onDragStart: () => void
   onDragOver: () => void
   onDragEnd: () => void
}) {
   return (
      <motion.div
         layout
         initial={{ opacity: 0, x: -6 }}
         animate={{ opacity: 1, x: 0 }}
         exit={{ opacity: 0, x: 6 }}
         transition={{ duration: 0.2, ease: [0.25, 0, 0, 1] }}
         draggable
         onDragStart={onDragStart}
         onDragOver={onDragOver}
         onDragEnd={onDragEnd}
         onClick={onSelect}
         className={cn(
            "group relative flex items-center gap-2.5 px-4 py-1.5 text-[13.5px] cursor-pointer select-none shrink-0 rounded-lg transition-all duration-300 border shadow-sm",
            isActive
               ? "bg-bg-tertiary border-border text-text-primary font-bold translate-y-[-1px]"
               : "bg-transparent border-transparent text-text-muted hover:text-text-primary hover:bg-white/5"
         )}
      >
         {/* Status indicators */}
         {tab.isExecuting && (
            <IconLoader2 className="h-3.5 w-3.5 animate-spin text-accent shrink-0" />
         )}
         {!tab.isExecuting && tab.isDirty && (
            <span className="h-2 w-2 rounded-full bg-accent/60 shrink-0" />
         )}

         {/* Icon */}
         {tab.tableName ? (
            <IconTable className={cn("h-4 w-4 shrink-0", isActive ? "opacity-90" : "opacity-45")} />
         ) : (
            <svg
               xmlns="http://www.w3.org/2000/svg"
               width="15"
               height="15"
               viewBox="0 0 24 24"
               fill="none"
               stroke="currentColor"
               strokeWidth="2"
               strokeLinecap="round"
               strokeLinejoin="round"
               className={cn("shrink-0", isActive ? "opacity-80" : "opacity-35")}
            >
               <polyline points="16 18 22 12 16 6" />
               <polyline points="8 6 2 12 8 18" />
            </svg>
         )}

         <span className="truncate max-w-40 leading-tight">{tab.title}</span>

         {/* Close button */}
         <button
            onClick={onClose}
            className="flex items-center justify-center p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 focus-visible:opacity-100 focus-visible:outline-none hover:bg-white/10 text-white/40 hover:text-white/80"
            aria-label="Close tab"
         >
            <IconX className="h-3.5 w-3.5" strokeWidth={2} />
         </button>
      </motion.div>
   )
}
