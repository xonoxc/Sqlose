import { useSettingsStore } from "../stores/settingsStore"
import { useEditorStore } from "../stores/editorStore"

export function useSettingsPanelState() {
   const vimModeEnabled = useSettingsStore(s => s.vimModeEnabled)
   const toggleVimMode = useSettingsStore(s => s.toggleVimMode)
   const keybindings = useSettingsStore(s => s.keybindings)
   const resetKeybindings = useSettingsStore(s => s.resetKeybindings)
   const autoSave = useSettingsStore(s => s.autoSave)
   const setAutoSaveAction = useSettingsStore(s => s.setAutoSave)
   const setVimEnabled = useEditorStore(s => s.setVimEnabled)

   const handleToggleVim = () => {
      const next = !vimModeEnabled
      toggleVimMode()
      setVimEnabled(next)
   }

   const handleToggleAutoSave = () => {
      setAutoSaveAction(!autoSave)
   }

   const handleResetKeybindings = () => {
      resetKeybindings()
   }

   return {
      vimModeEnabled,
      handleToggleVim,
      keybindings,
      autoSave,
      handleToggleAutoSave,
      handleResetKeybindings,
   }
}
