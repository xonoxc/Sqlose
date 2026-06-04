import { useSettingsStore } from "../stores/settingsStore"

export function useSettingsPanelState() {
   const vimModeEnabled = useSettingsStore(s => s.vimModeEnabled)
   const toggleVimMode = useSettingsStore(s => s.toggleVimMode)
   const keybindings = useSettingsStore(s => s.keybindings)
   const resetKeybindings = useSettingsStore(s => s.resetKeybindings)
   const autoSave = useSettingsStore(s => s.autoSave)
   const setAutoSaveAction = useSettingsStore(s => s.setAutoSave)
   const appearanceMode = useSettingsStore(s => s.appearanceMode)
   const setAppearanceMode = useSettingsStore(s => s.setAppearanceMode)
   const rowSpacing = useSettingsStore(s => s.rowSpacing)
   const setRowSpacing = useSettingsStore(s => s.setRowSpacing)
   const alternatingRowColors = useSettingsStore(s => s.alternatingRowColors)
   const setAlternatingRowColors = useSettingsStore(s => s.setAlternatingRowColors)
   const tableColumnPreview = useSettingsStore(s => s.tableColumnPreview)
   const setTableColumnPreview = useSettingsStore(s => s.setTableColumnPreview)
   const editorFontSize = useSettingsStore(s => s.editorFontSize)
   const setEditorFontSize = useSettingsStore(s => s.setEditorFontSize)
   const executionMode = useSettingsStore(s => s.executionMode)
   const setExecutionMode = useSettingsStore(s => s.setExecutionMode)

   const handleToggleVim = () => {
      toggleVimMode()
   }

   const handleToggleAutoSave = () => {
      setAutoSaveAction(!autoSave)
   }

   const handleResetKeybindings = () => {
      resetKeybindings()
   }

   const handleFontSizeChange = (delta: number) => {
      const next = Math.min(32, Math.max(8, editorFontSize + delta))
      setEditorFontSize(next)
   }

   return {
      vimModeEnabled,
      handleToggleVim,
      keybindings,
      autoSave,
      handleToggleAutoSave,
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
   }
}
