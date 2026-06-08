import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { IconCopy, IconChevronDown } from "@tabler/icons-react"
import { cn } from "@sqlose/ui"

interface CopyDropdownProps {
   onCopy: (format: string) => void
   disabled?: boolean
}

const FORMATS = ["JSON", "CSV", "SQL", "TSV", "Markdown"]

export function CopyDropdown({ onCopy, disabled }: CopyDropdownProps) {
   const [open, setOpen] = useState(false)

   return (
      <div className="relative">
         <button
            onClick={() => setOpen(!open)}
            disabled={disabled}
            className={cn(
               "h-7 flex items-center gap-1 px-1.5 rounded-md text-text-muted/60 hover:text-text-primary hover:bg-white/5 transition-all text-sm",
               open && "bg-white/5 text-text-primary",
               disabled && "opacity-30 pointer-events-none"
            )}
            title="Copy results"
         >
            <IconCopy className="h-4 w-4" />
            <IconChevronDown className="h-3 w-3 opacity-60" />
         </button>

         <AnimatePresence>
            {open && (
               <>
                  <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: 5 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: 5 }}
                     className="absolute right-0 bottom-full mb-2 w-48 py-1 rounded-lg bg-bg-secondary border border-border shadow-2xl z-50 overflow-hidden"
                  >
                     {FORMATS.map(type => (
                        <button
                           key={type}
                           onClick={() => {
                              onCopy(type)
                              setOpen(false)
                           }}
                           className="w-full text-left px-3 py-1.5 text-[13px] text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                        >
                           Copy as {type}
                        </button>
                     ))}
                  </motion.div>
               </>
            )}
         </AnimatePresence>
      </div>
   )
}
