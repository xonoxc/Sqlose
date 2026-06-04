import { motion, AnimatePresence } from "motion/react"
import {
   Button,
   Separator,
   Select,
   SelectTrigger,
   SelectValue,
   SelectContent,
   SelectItem,
   cn,
} from "@sqlose/ui"
import {
   IconRotate,
   IconToggleLeft,
   IconToggleRight,
   IconX,
   IconCheck,
   IconSun,
   IconMoon,
   IconDeviceDesktop,
   IconMinus,
   IconPlus,
} from "@tabler/icons-react"
import { useSettingsPanelState } from "~/hooks/useSettingsPanelState"
import { useThemeStore } from "~/stores/theme-store"
import { themes } from "~/themes"
import { isMac, formatShortcut } from "~/lib/types"

interface SettingsPanelProps {
   isOpen: boolean
   onClose: () => void
}

const appearanceOptions = [
   { value: "light" as const, icon: IconSun, label: "Light" },
   { value: "dark" as const, icon: IconMoon, label: "Dark" },
   { value: "system" as const, icon: IconDeviceDesktop, label: "System" },
]

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
   const {
      vimModeEnabled,
      handleToggleVim,
      keybindings,
      handleResetKeybindings,
      appearanceMode,
      setAppearanceMode,
      rowSpacing,
      setRowSpacing,
      alternatingRowColors,
      setAlternatingRowColors,
      tableColumnPreview,
      setTableColumnPreview,
      editorFontSize,
      handleFontSizeChange,
      executionMode,
      setExecutionMode,
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

   const platformKeybindings = keybindings.filter(kb =>
      isMac() ? kb.meta : kb.ctrl
   )
   const agnostic = keybindings.filter(kb => !kb.meta && !kb.ctrl)
   platformKeybindings.push(...agnostic)
   const seen = new Set<string>()
   const deduped = platformKeybindings.filter(kb => {
      if (seen.has(kb.action)) return false
      seen.add(kb.action)
      return true
   })

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
                        <h3 className="text-[12px] font-semibold tracking-wider uppercase text-text-muted/80 mb-4">
                           Appearance
                        </h3>
                        <p className="text-[13px] text-text-muted mb-3">
                           Select how Sqlose looks on your device.
                        </p>
                        <div className="flex gap-1.5 mb-5">
                           {appearanceOptions.map(opt => {
                              const Icon = opt.icon
                              const isActive = appearanceMode === opt.value
                              return (
                                 <button
                                    key={opt.value}
                                    onClick={() => setAppearanceMode(opt.value)}
                                    className={cn(
                                       "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all border",
                                       isActive
                                          ? "bg-accent/15 text-accent border-accent/40 shadow-sm"
                                          : "bg-bg-tertiary text-text-secondary border-border/50 hover:bg-bg-quaternary hover:text-text-primary"
                                    )}
                                 >
                                    <Icon className={cn("h-4 w-4", isActive && "text-accent")} />
                                    {opt.label}
                                 </button>
                              )
                           })}
                        </div>
                        <div className="flex items-center justify-between">
                           <div>
                              <p className="text-sm text-text-primary">Theme</p>
                              <p className="text-xs text-text-muted mt-0.5">
                                 Color theme for the current appearance
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
                                    <SelectItem key={t.id} value={t.id}>
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

                     {/* Table */}
                     <section>
                        <h3 className="text-[12px] font-semibold tracking-wider uppercase text-text-muted/80 mb-4">
                           Table
                        </h3>
                        <div className="space-y-4">
                           <div className="flex items-center justify-between">
                              <div>
                                 <p className="text-sm text-text-primary">Row Spacing</p>
                                 <p className="text-xs text-text-muted mt-0.5">
                                    Adjust the vertical spacing between rows in data tables.
                                 </p>
                              </div>
                              <Select value={rowSpacing} onValueChange={v => setRowSpacing(v as "comfortable" | "compact")}>
                                 <SelectTrigger className="w-[150px]">
                                    <SelectValue />
                                 </SelectTrigger>
                                 <SelectContent>
                                    <SelectItem value="comfortable">Comfortable</SelectItem>
                                    <SelectItem value="compact">Compact</SelectItem>
                                 </SelectContent>
                              </Select>
                           </div>
                           <div className="flex items-center justify-between">
                              <div>
                                 <p className="text-sm text-text-primary">Alternating Row Colors</p>
                                 <p className="text-xs text-text-muted mt-0.5">
                                    Apply alternating background colors to rows in data tables for easier reading.
                                 </p>
                              </div>
                              <button
                                 onClick={() => setAlternatingRowColors(!alternatingRowColors)}
                                 className="transition-all duration-200"
                                 aria-label="Toggle alternating row colors"
                              >
                                 {alternatingRowColors ? (
                                    <IconToggleRight className="h-5 w-5 text-accent brightness-150" />
                                 ) : (
                                    <IconToggleLeft className="h-5 w-5 text-text-muted" />
                                 )}
                              </button>
                           </div>
                           <div className="flex items-center justify-between">
                              <div>
                                 <p className="text-sm text-text-primary">Table Column Preview</p>
                                 <p className="text-xs text-text-muted mt-0.5">
                                    Show expandable column details in the sidebar table list.
                                 </p>
                              </div>
                              <button
                                 onClick={() => setTableColumnPreview(!tableColumnPreview)}
                                 className="transition-all duration-200"
                                 aria-label="Toggle table column preview"
                              >
                                 {tableColumnPreview ? (
                                    <IconToggleRight className="h-5 w-5 text-accent brightness-150" />
                                 ) : (
                                    <IconToggleLeft className="h-5 w-5 text-text-muted" />
                                 )}
                              </button>
                           </div>
                        </div>
                     </section>

                     <Separator />

                     {/* Editor */}
                     <section>
                        <h3 className="text-[12px] font-semibold tracking-wider uppercase text-text-muted/80 mb-4">
                           Editor
                        </h3>
                        <div className="space-y-4">
                           <div className="flex items-center justify-between">
                              <div>
                                 <p className="text-sm text-text-primary">Editor Font Size</p>
                                 <p className="text-xs text-text-muted mt-0.5">
                                    Adjust the font size for query editors.
                                 </p>
                              </div>
                              <div className="flex items-center gap-2 bg-bg-tertiary border border-border rounded-lg px-2 py-1">
                                 <button
                                    onClick={() => handleFontSizeChange(-1)}
                                    className="h-6 w-6 rounded flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-quaternary transition-colors"
                                    aria-label="Decrease font size"
                                 >
                                    <IconMinus className="h-3.5 w-3.5" />
                                 </button>
                                 <span className="text-[13px] font-mono text-text-primary min-w-[36px] text-center tabular-nums">
                                    {editorFontSize}px
                                 </span>
                                 <button
                                    onClick={() => handleFontSizeChange(1)}
                                    className="h-6 w-6 rounded flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-quaternary transition-colors"
                                    aria-label="Increase font size"
                                 >
                                    <IconPlus className="h-3.5 w-3.5" />
                                 </button>
                              </div>
                           </div>
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
                        </div>
                     </section>

                     <Separator />

                     {/* Execution */}
                     <section>
                        <h3 className="text-[12px] font-semibold tracking-wider uppercase text-text-muted/80 mb-4">
                           Execution
                        </h3>
                        <div className="flex items-center justify-between">
                           <div>
                              <p className="text-sm text-text-primary">Execution Mode</p>
                              <p className="text-xs text-text-muted mt-0.5">
                                 Review Mode queues changes for review before applying. Direct Mode applies changes immediately.
                              </p>
                           </div>
                           <div className="flex gap-1 bg-bg-tertiary border border-border rounded-lg p-0.5">
                              <button
                                 onClick={() => setExecutionMode("review")}
                                 className={cn(
                                    "px-3 py-1.5 rounded-md text-[12px] font-medium transition-all",
                                    executionMode === "review"
                                       ? "bg-accent/15 text-accent shadow-sm"
                                       : "text-text-muted hover:text-text-primary"
                                 )}
                              >
                                 Review Mode
                              </button>
                              <button
                                 onClick={() => setExecutionMode("direct")}
                                 className={cn(
                                    "px-3 py-1.5 rounded-md text-[12px] font-medium transition-all",
                                    executionMode === "direct"
                                       ? "bg-accent/15 text-accent shadow-sm"
                                       : "text-text-muted hover:text-text-primary"
                                 )}
                              >
                                 Direct Mode
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
                           {deduped.map((kb, index) => (
                              <div
                                 key={index}
                                 className="flex items-center justify-between py-1.5 px-2.5 rounded-lg hover:bg-bg-quaternary/50 transition-colors"
                              >
                                 <span className="text-[13px] text-text-primary">
                                    {actionLabels[kb.action] || kb.action}
                                 </span>
                                 <kbd className="text-[11px] font-mono text-text-muted bg-bg-tertiary border border-border rounded-md px-1.5 py-0.5">
                                    {formatShortcut(kb.meta || kb.ctrl, kb.shift, kb.alt, kb.key)}
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
