import { motion, AnimatePresence } from "motion/react"
import { Button, Separator } from "@sqlose/ui"
import { IconCheck, IconX } from "@tabler/icons-react"
import { useSettingsPanelState } from "~/hooks/useSettingsPanelState"
import { useThemeStore } from "~/stores/theme-store"
import {
   AppearanceSection,
   DisplaySection,
   TableSection,
   EditorSection,
   ExecutionSection,
   KeybindingsSection,
} from "~/components/settings"

interface SettingsPanelProps {
   isOpen: boolean
   onClose: () => void
}

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
      editorFontFamily,
      handleFontFamilyChange,
      tableFontSize,
      handleTableFontSizeChange,
      uiScale,
      handleUiScaleChange,
      executionMode,
      setExecutionMode,
   } = useSettingsPanelState()

   const themeId = useThemeStore(s => s.themeId)
   const setTheme = useThemeStore(s => s.setTheme)

   return (
      <AnimatePresence>
         {isOpen && (
            <div
               className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] bg-black/40 backdrop-blur-[2px]"
               onClick={onClose}
               onKeyDown={e => e.key === "Escape" && onClose()}
            >
               <motion.div
                  initial={{ opacity: 0, scale: 0.97, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: -10 }}
                  transition={{ duration: 0.1 }}
                  className="w-full max-w-6xl bg-bg-primary backdrop-blur-xl rounded-lg border border-border shadow-2xl overflow-hidden"
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
                  <div className="max-h-[65vh] overflow-y-auto scrollbar-none px-5 py-5 space-y-6">
                     <AppearanceSection
                        appearanceMode={appearanceMode}
                        setAppearanceMode={setAppearanceMode}
                        themeId={themeId}
                        setTheme={setTheme}
                     />

                     <Separator />

                     <DisplaySection uiScale={uiScale} handleUiScaleChange={handleUiScaleChange} />

                     <Separator />

                     <TableSection
                        rowSpacing={rowSpacing}
                        setRowSpacing={setRowSpacing}
                        tableFontSize={tableFontSize}
                        handleTableFontSizeChange={handleTableFontSizeChange}
                        alternatingRowColors={alternatingRowColors}
                        setAlternatingRowColors={setAlternatingRowColors}
                        tableColumnPreview={tableColumnPreview}
                        setTableColumnPreview={setTableColumnPreview}
                     />

                     <Separator />

                     <EditorSection
                        isOpen={isOpen}
                        editorFontSize={editorFontSize}
                        handleFontSizeChange={handleFontSizeChange}
                        editorFontFamily={editorFontFamily}
                        handleFontFamilyChange={handleFontFamilyChange}
                        vimModeEnabled={vimModeEnabled}
                        handleToggleVim={handleToggleVim}
                     />

                     <Separator />

                     <ExecutionSection
                        executionMode={executionMode}
                        setExecutionMode={setExecutionMode}
                     />

                     <Separator />

                     <KeybindingsSection
                        keybindings={keybindings}
                        onReset={handleResetKeybindings}
                     />
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
            </div>
         )}
      </AnimatePresence>
   )
}
