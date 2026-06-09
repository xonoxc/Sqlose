import { useState } from "react"

export type ResultsTab = "results" | "messages" | "stats" | "plan"

export function useAppUIState() {
   const [sidebarOpen] = useState(true)
   const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
   const [paletteOpen, setPaletteOpen] = useState(false)
   const [settingsOpen, setSettingsOpen] = useState(false)
   const [shortcutsOpen, setShortcutsOpen] = useState(false)
   const [resultsCollapsed, setResultsCollapsed] = useState(false)
   const [resultsActiveTab, setResultsActiveTab] = useState<ResultsTab>("results")
   const [isResultsMaximized, setIsResultsMaximized] = useState(false)
   const [nukeConfirmOpen, setNukeConfirmOpen] = useState(false)

   return {
      sidebarOpen,
      sidebarCollapsed,
      setSidebarCollapsed,
      toggleSidebarCollapse: () => setSidebarCollapsed(v => !v),
      paletteOpen,
      openPalette: () => setPaletteOpen(true),
      closePalette: () => setPaletteOpen(false),
      settingsOpen,
      openSettings: () => setSettingsOpen(true),
      closeSettings: () => setSettingsOpen(false),
      shortcutsOpen,
      openShortcuts: () => setShortcutsOpen(true),
      closeShortcuts: () => setShortcutsOpen(false),
      resultsCollapsed,
      toggleResultsCollapse: () => setResultsCollapsed(v => !v),
      resultsActiveTab,
      setResultsActiveTab,
      isResultsMaximized,
      toggleResultsMaximize: () => setIsResultsMaximized(v => !v),
      nukeConfirmOpen,
      openNukeConfirm: () => setNukeConfirmOpen(true),
      closeNukeConfirm: () => setNukeConfirmOpen(false),
   }
}
