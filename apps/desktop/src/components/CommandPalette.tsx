import { motion, AnimatePresence } from "motion/react"
import { cn } from "@sqlose/ui"
import {
   IconSearch,
   IconArrowLeft,
   IconSettings,
   IconCornerDownLeft,
   IconArrowLeftRight,
} from "@tabler/icons-react"
import { useCommandPaletteLogic } from "~/hooks/useCommandPaletteLogic"

interface CommandPaletteProps {
   isOpen: boolean
   onClose: () => void
   onExecuteQuery?: () => void
   onClearResults?: () => void
   onOpenTable?: (tableName: string) => void
   onOpenQuery?: (sql: string) => void
   onNukeConfirm?: () => void
}

export function CommandPalette({
   isOpen,
   onClose,
   onExecuteQuery,
   onClearResults,
   onOpenQuery,
   onNukeConfirm,
}: CommandPaletteProps) {
   const {
      query,
      setQuery,
      selectedIndex,
      setSelectedIndex,
      inputRef,
      flatFiltered,
      mode,
      exitThemeMode,
      filteredThemes,
      handleThemeHover,
      handleThemeSelect,
      groupedItems,
   } = useCommandPaletteLogic(
      isOpen,
      onClose,
      onExecuteQuery,
      onClearResults,
      onOpenQuery,
      onNukeConfirm
   )

   const getIconStyles = (id: string) => {
      if (id === "new-query") return "bg-indigo-500/10 text-indigo-400"
      if (id === "run-query") return "bg-emerald-500/10 text-emerald-400"
      if (id === "save-query") return "bg-blue-500/10 text-blue-400"
      if (id === "clear-results") return "bg-red-500/10 text-red-400"
      if (id === "open-saved") return "bg-purple-500/10 text-purple-400"
      if (id === "open-history") return "bg-purple-500/10 text-purple-400"
      if (id === "view-diagram") return "bg-blue-500/10 text-blue-400"
      if (id === "switch-db") return "bg-teal-500/10 text-teal-400"
      if (id === "toggle-vim") return "bg-violet-500/10 text-violet-400"
      if (id === "switch-theme") return "bg-pink-500/10 text-pink-400"
      if (id === "nuke-env") return "bg-orange-500/10 text-orange-400"
      if (id.startsWith("env-")) return "bg-zinc-500/10 text-zinc-400"
      if (id.startsWith("tab-")) return "bg-indigo-500/10 text-indigo-400"
      if (id.startsWith("sq-")) return "bg-amber-500/10 text-amber-400"
      if (id.startsWith("hist-")) return "bg-zinc-500/10 text-zinc-400"
      return "bg-bg-secondary text-text-muted"
   }

   // Limit the total number of items shown to 7
   const limitedItems = flatFiltered.slice(0, 7)

   return (
      <AnimatePresence>
         {isOpen && (
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.15 }}
               className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-[2px]"
               onClick={() => {
                  if (mode !== "themes") onClose()
               }}
            >
               <motion.div
                  initial={{ opacity: 0, scale: 0.98, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="w-full max-w-2xl bg-bg-primary border border-border shadow-2xl rounded-xl overflow-hidden flex flex-col"
                  onClick={e => e.stopPropagation()}
               >
                  {/* Search Header */}
                  <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border/50">
                     {mode === "themes" ? (
                        <button
                           onClick={exitThemeMode}
                           className="flex items-center justify-center h-8 w-8 rounded bg-bg-secondary text-text-muted hover:text-text-primary transition-colors focus:outline-none"
                        >
                           <IconArrowLeft className="h-4 w-4" />
                        </button>
                     ) : (
                        <IconSearch className="h-4.5 w-4.5 text-text-muted shrink-0" />
                     )}
                     <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => {
                           setQuery(e.target.value)
                           setSelectedIndex(0)
                        }}
                        placeholder={
                           mode === "themes"
                              ? "Search themes..."
                              : "Search tables, queries, commands..."
                        }
                        className="flex-1 bg-transparent text-[14.5px] font-medium text-text-primary outline-none placeholder:text-text-muted/50"
                     />
                     <kbd className="hidden sm:inline-flex items-center justify-center rounded px-2 py-1 border border-border bg-bg-secondary text-[10px] font-mono text-text-muted">
                        ESC
                     </kbd>
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 overflow-y-auto py-2.5 custom-scrollbar">
                     {mode === "themes" ? (
                        <div className="flex flex-col">
                           <div className="px-5 py-2 text-[10.5px] font-bold uppercase tracking-widest text-text-muted/70">
                              Themes
                           </div>
                           {filteredThemes.slice(0, 10).map((theme, index) => {
                              const isActive = index === selectedIndex
                              return (
                                 <button
                                    key={theme.id}
                                    onClick={() => {
                                       handleThemeSelect(theme.id)
                                       onClose()
                                    }}
                                    onMouseEnter={() => {
                                       setSelectedIndex(index)
                                       handleThemeHover(theme.id)
                                    }}
                                    onMouseLeave={() => handleThemeHover(null)}
                                    className={cn(
                                       "flex w-full items-center gap-4 px-5 py-2.5 transition-all outline-none",
                                       isActive
                                          ? "bg-accent text-white"
                                          : "text-text-secondary hover:bg-bg-secondary/50"
                                    )}
                                 >
                                    <div className="flex -space-x-1.5 shrink-0">
                                       <div
                                          className="h-5 w-5 rounded-full border border-bg-primary shadow-xs"
                                          style={{ background: theme.colors.accent }}
                                       />
                                       <div
                                          className="h-5 w-5 rounded-full border border-bg-primary shadow-xs"
                                          style={{ background: theme.colors.background }}
                                       />
                                    </div>
                                    <div className="flex-1 flex items-center justify-between min-w-0 font-medium">
                                       <span className="text-[14.5px] truncate">{theme.name}</span>
                                       <span
                                          className={cn(
                                             "text-[11px] ml-2",
                                             isActive ? "text-white/70" : "text-text-muted/60"
                                          )}
                                       >
                                          {theme.id}
                                       </span>
                                    </div>
                                 </button>
                              )
                           })}
                        </div>
                     ) : (
                        <div className="flex flex-col">
                           {limitedItems.length === 0 && (
                              <div className="py-16 text-center flex flex-col items-center">
                                 <IconSearch className="h-10 w-10 text-text-muted/10 mb-3" />
                                 <p className="text-text-muted text-[14.5px] px-8 font-medium">
                                    No results for &ldquo;{query}&rdquo;
                                 </p>
                              </div>
                           )}

                           {/* Grouped rendering with headers */}
                           {Object.entries(groupedItems).map(([category, items]) => {
                              if (items.length === 0) return null
                              // Only show if the items in this category are within the first 7 items overall
                              const visibleInGroup = items.filter(item =>
                                 limitedItems.some(li => li.id === item.id)
                              )
                              if (visibleInGroup.length === 0) return null

                              return (
                                 <div key={category} className="flex flex-col">
                                    <div className="px-5 py-2 text-[10.5px] font-bold uppercase tracking-widest text-text-muted/70">
                                       {category}
                                    </div>
                                    {visibleInGroup.map(item => {
                                       const indexInFlat = flatFiltered.findIndex(
                                          fi => fi.id === item.id
                                       )
                                       const isActive = indexInFlat === selectedIndex
                                       const style = getIconStyles(item.id)
                                       return (
                                          <button
                                             key={item.id}
                                             onClick={() => {
                                                item.onSelect()
                                                if (item.id !== "switch-theme") onClose()
                                             }}
                                             onMouseEnter={() => setSelectedIndex(indexInFlat)}
                                             className={cn(
                                                "group flex w-full items-center gap-4 px-5 py-2.5 transition-all outline-none",
                                                isActive
                                                   ? "bg-accent text-white"
                                                   : "text-text-secondary hover:bg-bg-secondary/40"
                                             )}
                                          >
                                             <div
                                                className={cn(
                                                   "flex items-center justify-center h-7 w-7 rounded-lg shrink-0 transition-all border border-transparent shadow-sm",
                                                   isActive ? "bg-white/20 text-white" : style
                                                )}
                                             >
                                                <div className="scale-[0.85]">{item.icon}</div>
                                             </div>

                                             <div className="flex-1 min-w-0 flex items-center justify-between gap-6">
                                                <div className="flex flex-col text-left truncate">
                                                   <div className="flex items-baseline gap-2.5 min-w-0 overflow-hidden">
                                                      <span
                                                         className={cn(
                                                            "text-[14px] font-semibold truncate transition-colors",
                                                            isActive
                                                               ? "text-text-primary"
                                                               : "text-text-secondary font-medium"
                                                         )}
                                                      >
                                                         {item.label}
                                                      </span>
                                                      <span
                                                         className={cn(
                                                            "text-[11.5px] truncate transition-colors font-medium",
                                                            isActive
                                                               ? "text-white/70"
                                                               : "text-text-muted/70"
                                                         )}
                                                      >
                                                         {item.description}
                                                      </span>
                                                   </div>
                                                </div>

                                                <div className="flex items-center gap-4 shrink-0">
                                                   {item.shortcut && (
                                                      <div className="flex items-center gap-1.5">
                                                         {item.shortcut
                                                            .split("+")
                                                            .map((key, ki) => (
                                                               <kbd
                                                                  key={ki}
                                                                  className={cn(
                                                                     "min-w-[20px] h-5.5 flex items-center justify-center px-1.5 rounded-md border text-[10px] font-mono shadow-xs transition-colors",
                                                                     isActive
                                                                        ? "bg-white/20 border-white/20 text-white"
                                                                        : "bg-bg-secondary border-border text-text-muted"
                                                                  )}
                                                               >
                                                                  {key}
                                                               </kbd>
                                                            ))}
                                                      </div>
                                                   )}
                                                </div>
                                             </div>
                                          </button>
                                       )
                                    })}
                                 </div>
                              )
                           })}
                        </div>
                     )}
                  </div>

                  {/* Footer */}
                  <div className="px-5 py-3 flex items-center gap-6 border-t border-border/40 bg-bg-secondary/20 font-medium whitespace-nowrap overflow-hidden">
                     <div className="flex items-center gap-5 text-[10.5px] text-text-muted/60">
                        <div className="flex items-center gap-2">
                           <div className="flex items-center justify-center h-4.5 w-4.5 rounded-sm bg-bg-tertiary border border-border p-0.5 opacity-70">
                              <IconArrowLeftRight className="h-full w-full rotate-90" />
                           </div>
                           <span>Select</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="flex items-center justify-center h-4.5 w-4.5 rounded-sm bg-bg-tertiary border border-border p-0.5 opacity-70">
                              <IconCornerDownLeft className="h-full w-full" />
                           </div>
                           <span>Open</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="flex items-center justify-center h-4.5 w-4.5 rounded-sm bg-bg-tertiary border border-border p-0.5 text-[8.5px] font-mono leading-none opacity-70 uppercase">
                              ESC
                           </div>
                           <span>Close</span>
                        </div>
                     </div>
                     <div className="ml-auto shrink-0">
                        <button className="h-7.5 w-7.5 rounded-md hover:bg-bg-quaternary flex items-center justify-center text-text-muted/40 hover:text-text-primary transition-all">
                           <IconSettings className="h-4 w-4" />
                        </button>
                     </div>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
   )
}
