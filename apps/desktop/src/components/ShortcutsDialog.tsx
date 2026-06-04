import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import { isMac } from "~/lib/types"

interface Shortcut {
   label: string
   keys: string[]
}

function getShortcuts(): Shortcut[] {
   const mac = isMac()
   return [
      { label: "Open Command Palette", keys: [mac ? "⌘K" : "Ctrl+K"] },
      { label: "Execute Query", keys: [mac ? "⌘↵" : "Ctrl+Enter"] },
      { label: "New Query Tab", keys: [mac ? "⌘N" : "Ctrl+N"] },
      { label: "Close Tab", keys: [mac ? "⌘W" : "Ctrl+W"] },
      { label: "Next Tab", keys: [mac ? "⌘⇥" : "Ctrl+Tab"] },
      { label: "Previous Tab", keys: [mac ? "⌘⇧⇥" : "Ctrl+Shift+Tab"] },
      { label: "Show Keyboard Shortcuts", keys: ["?"] },
   ]
}

interface ShortcutsDialogProps {
   isOpen: boolean
   onClose: () => void
}

export function ShortcutsDialog({ isOpen, onClose }: ShortcutsDialogProps) {
   const ref = useRef<HTMLDivElement>(null)

   useEffect(() => {
      if (!isOpen) return
      const handler = (e: KeyboardEvent) => {
         if (e.key === "Escape") {
            e.preventDefault()
            onClose()
         }
      }
      window.addEventListener("keydown", handler)
      return () => window.removeEventListener("keydown", handler)
   }, [isOpen, onClose])

   return (
      <AnimatePresence>
         {isOpen && (
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.1 }}
               className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
               onClick={onClose}
            >
               <motion.div
                  ref={ref}
                  initial={{ opacity: 0, scale: 0.97, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: -10 }}
                  transition={{ duration: 0.1 }}
                  className="w-full max-w-md bg-bg-primary/95 backdrop-blur-xl rounded-lg border border-border shadow-2xl overflow-hidden"
                  onClick={e => e.stopPropagation()}
               >
                  <div className="flex items-center justify-between px-5 py-3 border-b border-border/50">
                     <h2 className="text-[15px] font-semibold text-text-primary">
                        Keyboard Shortcuts
                     </h2>
                     <kbd className="text-[11px] text-text-muted font-mono border border-border/50 bg-bg-secondary rounded px-1.5 py-0.5">
                        ESC
                     </kbd>
                  </div>
                  <div className="max-h-[55vh] overflow-y-auto py-2 custom-scrollbar">
                     {getShortcuts().map((s, i) => (
                        <div
                           key={i}
                           className="flex items-center justify-between px-5 py-2.5 hover:bg-bg-quaternary/30 transition-colors"
                        >
                           <span className="text-[13px] text-text-primary">{s.label}</span>
                           <div className="flex items-center gap-1">
                              {s.keys.map((k, j) => (
                                 <kbd
                                    key={j}
                                    className="text-[11px] font-mono text-text-muted bg-bg-tertiary border border-border/60 rounded px-1.5 py-0.5 leading-none"
                                 >
                                    {k}
                                 </kbd>
                              ))}
                           </div>
                        </div>
                     ))}
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
   )
}
