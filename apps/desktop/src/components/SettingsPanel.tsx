import { motion, AnimatePresence } from "motion/react"
import {
   Button,
   Separator,
   Select,
   SelectTrigger,
   SelectValue,
   SelectContent,
   SelectItem,
} from "@sqlose/ui"
import { IconRotate, IconToggleLeft, IconToggleRight, IconX, IconCheck } from "@tabler/icons-react"
import { useSettingsPanelState } from "../hooks/useSettingsPanelState"
import { useThemeStore } from "../stores/theme-store"
import { themes } from "../themes"

interface SettingsPanelProps {
   isOpen: boolean
   onClose: () => void
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
   const {
      vimModeEnabled,
      handleToggleVim,
      keybindings,
      autoSave,
      handleToggleAutoSave,
      handleResetKeybindings,
   } = useSettingsPanelState()

   const themeId = useThemeStore(s => s.themeId)
   const setTheme = useThemeStore(s => s.setTheme)

   const actionLabels: Record<string, string> = {
      "query.execute": "Execute Query",
      "palette.open": "Open Command Palette",
      "tab.new": "New Tab",
      "tab.close": "Close Tab",
      "tab.next": "Next Tab",
      "tab.prev": "Previous Tab",
      "shortcuts.show": "Show Keyboard Shortcuts",
   }

   const formatKeybinding = (kb: {
      key: string
      ctrl: boolean
      shift: boolean
      alt: boolean
      meta: boolean
   }) => {
      const parts: string[] = []
      if (kb.ctrl) parts.push("Ctrl")
      if (kb.alt) parts.push("Alt")
      if (kb.shift) parts.push("Shift")
      if (kb.meta) parts.push("⌘")
      parts.push(kb.key.charAt(0).toUpperCase() + kb.key.slice(1))
      return parts.join(" + ")
   }

   return (
      <AnimatePresence>
         {isOpen && (
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.1 }}
               className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] bg-black/40 backdrop-blur-[2px]"
               onClick={onClose}
               onKeyDown={e => e.key === "Escape" && onClose()}
            >
               <motion.div
                  initial={{ opacity: 0, scale: 0.97, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: -10 }}
                  transition={{ duration: 0.1 }}
                  className="w-full max-w-xl bg-bg-primary/95 backdrop-blur-xl rounded-xl border border-border shadow-2xl overflow-hidden"
                  onClick={e => e.stopPropagation()}
               >
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
                     <div>
                        <h2 className="text-[15px] font-semibold text-text-primary tracking-tight">
                           Settings
                        </h2>
                        <p className="text-[13px] text-text-muted mt-0.5">
                           Configure your Sqlose preferences
                        </p>
                     </div>
                     <button
                        onClick={onClose}
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-quaternary transition-colors"
                        aria-label="Close settings"
                     >
                        <IconX className="h-4 w-4" />
                     </button>
                  </div>

                  {/* Body */}
                  <div className="max-h-[65vh] overflow-y-auto custom-scrollbar px-5 py-5 space-y-6">
                     {/* Appearance */}
                     <section>
                        <h3 className="text-[12px] font-semibold tracking-wider uppercase text-text-muted/80 mb-3">
                           Appearance
                        </h3>
                        <div className="flex items-center justify-between">
                           <div>
                              <p className="text-sm text-text-primary">Theme</p>
                              <p className="text-xs text-text-muted mt-0.5">
                                 Change the application color theme
                              </p>
                           </div>
                           <Select value={themeId} onValueChange={setTheme}>
                              <SelectTrigger className="w-[180px]">
                                 <div className="flex items-center gap-2">
                                    <div
                                       className="h-3.5 w-3.5 rounded-full border border-border/60 shrink-0"
                                       style={{
                                          background:
                                             themes.find(t => t.id === themeId)?.colors.accent ??
                                             "#6b8bab",
                                       }}
                                    />
                                    <SelectValue />
                                 </div>
                              </SelectTrigger>
                              <SelectContent>
                                 {themes.map(t => (
                                    <SelectItem key={t.id} value={t.id} className="gap-2">
                                       <div className="flex items-center gap-2">
                                          <span
                                             className="h-3 w-3 rounded-full border border-border/60 block shrink-0"
                                             style={{ background: t.colors.accent }}
                                          />
                                          <span>{t.name}</span>
                                       </div>
                                    </SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                        </div>
                     </section>

                     <Separator />

                     {/* Editor */}
                     <section>
                        <h3 className="text-[12px] font-semibold tracking-wider uppercase text-text-muted/80 mb-3">
                           Editor
                        </h3>
                        <div className="space-y-4">
                           <div className="flex items-center justify-between">
                              <div>
                                 <p className="text-sm text-text-primary">Vim Mode</p>
                                 <p className="text-xs text-text-muted mt-0.5">
                                    Enable Vim keybindings in the SQL editor
                                 </p>
                              </div>
                           <button
                                  onClick={handleToggleVim}
                                  className="transition-all duration-200"
                                  aria-label="Toggle Vim mode"
                               >
                                  {vimModeEnabled ? (
                                     <IconToggleRight className="h-5 w-5 text-accent brightness-150" />
                                  ) : (
                                     <IconToggleLeft className="h-5 w-5 text-text-muted" />
                                  )}
                               </button>
                           </div>
                           <div className="flex items-center justify-between">
                              <div>
                                 <p className="text-sm text-text-primary">Auto-save</p>
                                 <p className="text-xs text-text-muted mt-0.5">
                                    Automatically save query drafts
                                 </p>
                              </div>
                           <button
                                  onClick={handleToggleAutoSave}
                                  className="transition-all duration-200"
                                  aria-label="Toggle auto-save"
                               >
                                  {autoSave ? (
                                     <IconToggleRight className="h-5 w-5 text-accent brightness-150" />
                                  ) : (
                                     <IconToggleLeft className="h-5 w-5 text-text-muted" />
                                  )}
                               </button>
                           </div>
                        </div>
                     </section>

                     <Separator />

                     {/* Keybindings */}
                     <section>
                        <div className="flex items-center justify-between mb-3">
                           <h3 className="text-[12px] font-semibold tracking-wider uppercase text-text-muted/80">
                              Keybindings
                           </h3>
                            <Button
                               variant="ghost"
                               size="sm"
                               onClick={handleResetKeybindings}
                               className="h-6 text-xs gap-1 flex"
                            >
                               <IconRotate className="h-3 w-3" />
                               Reset
                            </Button>
                        </div>
                        <div className="space-y-0.5">
                           {keybindings.map((kb, index) => (
                              <div
                                 key={index}
                                 className="flex items-center justify-between py-1.5 px-2.5 rounded-lg hover:bg-bg-quaternary/50 transition-colors"
                              >
                                 <span className="text-[13px] text-text-primary">
                                    {actionLabels[kb.action] || kb.action}
                                 </span>
                                 <kbd className="text-[11px] font-mono text-text-muted bg-bg-tertiary border border-border rounded-md px-1.5 py-0.5">
                                    {formatKeybinding(kb)}
                                 </kbd>
                              </div>
                           ))}
                        </div>
                     </section>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-end px-5 py-3 border-t border-border/50 bg-bg-secondary/40">
                      <Button
                         variant="default"
                         size="sm"
                         onClick={onClose}
                         className="gap-1.5 flex gap-2"
                      >
                         <IconCheck className="h-3.5 w-3.5" />
                         Done
                      </Button>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
   )
}
