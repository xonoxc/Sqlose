import { motion, AnimatePresence } from "motion/react"
import { useCommandPaletteLogic } from "~/hooks/useCommandPaletteLogic"
import { PaletteSearchHeader } from "./PaletteSearchHeader"
import { PaletteFooter } from "./PaletteFooter"
import { CommandResults } from "./CommandResults"
import { ThemeResults } from "./ThemeResults"
import { DatabaseResults } from "./DatabaseResults"

interface CommandPaletteProps {
   isOpen: boolean
   onClose: () => void
   onExecuteQuery?: () => void
   onClearResults?: () => void
   onOpenTable?: (tableName: string) => void
   onOpenQuery?: (sql: string) => void
   onNukeConfirm?: () => void
   onSaveQuery?: () => void
   onRenameQuery?: () => void
}

export function CommandPalette({
   isOpen,
   onClose,
   onExecuteQuery,
   onClearResults,
   onOpenQuery,
   onNukeConfirm,
   onSaveQuery,
   onRenameQuery,
}: CommandPaletteProps) {
   const {
      query,
      setQuery,
      selectedIndex,
      setSelectedIndex,
      inputRef,
      flatFiltered,
      groupedItems,
      mode,
      exitThemeMode,
      filteredThemes,
      handleThemeHover,
      handleThemeSelect,
      filteredEnvironments,
      handleDatabaseSelect,
      exitDatabaseMode,
   } = useCommandPaletteLogic(
      isOpen,
      onClose,
      onExecuteQuery,
      onClearResults,
      onOpenQuery,
      onNukeConfirm,
      onSaveQuery,
      onRenameQuery
   )

   const handleQueryChange = (value: string) => {
      setQuery(value)
      setSelectedIndex(0)
   }

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
                  if (mode !== "themes" && mode !== "databases") onClose()
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
                  <PaletteSearchHeader
                     mode={mode}
                     query={query}
                     onQueryChange={handleQueryChange}
                     inputRef={inputRef}
                     onExitThemes={exitThemeMode}
                     onExitDatabases={exitDatabaseMode}
                  />

                  <div className="flex-1 overflow-y-auto py-2.5 custom-scrollbar">
                     {mode === "themes" ? (
                        <ThemeResults
                           filteredThemes={filteredThemes}
                           selectedIndex={selectedIndex}
                           onSelectIndex={setSelectedIndex}
                           onHover={handleThemeHover}
                           onSelect={handleThemeSelect}
                           onClose={onClose}
                        />
                     ) : mode === "databases" ? (
                        <DatabaseResults
                           filteredEnvironments={filteredEnvironments}
                           selectedIndex={selectedIndex}
                           onSelectIndex={setSelectedIndex}
                           onSelect={handleDatabaseSelect}
                           onClose={onClose}
                        />
                     ) : (
                        <CommandResults
                           groupedItems={groupedItems}
                           flatFiltered={flatFiltered}
                           selectedIndex={selectedIndex}
                           query={query}
                           onSelectIndex={setSelectedIndex}
                           onClose={onClose}
                        />
                     )}
                  </div>

                  <PaletteFooter />
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
   )
}
