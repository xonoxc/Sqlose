import { useSettingsStore } from "../stores/settingsStore"
import { useEditorStore } from "../stores/editorStore"

export function useSettingsPanelState() {
   const vimModeEnabled = useSettingsStore(s => s.vimModeEnabled)
   const toggleVimMode = useSettingsStore(s => s.toggleVimMode)
   const keybindings = useSettingsStore(s => s.keybindings)
   const resetKeybindings = useSettingsStore(s => s.resetKeybindings)
   const setVimEnabled = useEditorStore(s => s.setVimEnabled)

   const handleToggleVim = () => {
      const next = !vimModeEnabled
      toggleVimMode()
      setVimEnabled(next)
   }

   const handleResetKeybindings = () => {
      resetKeybindings()
   }

   return {
      vimModeEnabled,
      handleToggleVim,
      keybindings,
      handleResetKeybindings,
   }
}
