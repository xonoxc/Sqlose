import { useState, useEffect, useRef } from "react"
import { useEnvironmentStore } from "~/stores/environmentStore"
import { useWorkspaceStore } from "~/stores/workspaceStore"
import { useSettingsStore } from "~/stores/settingsStore"
import { useSavedQueriesStore } from "~/stores/savedQueriesStore"
import { useHistoryStore } from "~/stores/historyStore"
import { useThemeStore, applyTheme } from "~/stores/theme-store"
import { themes } from "~/themes"
import { buildPaletteActions } from "~/components/CommandPalette/paletteActions"
import { groupPaletteItems, flattenGrouped } from "~/components/CommandPalette/paletteFilter"

export type PaletteMode = "default" | "themes" | "databases"

export function useCommandPaletteLogic(
   isOpen: boolean,
   onClose: () => void,
   onExecuteQuery?: () => void,
   onClearResults?: () => void,
   onOpenQuery?: (sql: string, savedQueryId?: string, savedQueryName?: string) => void,
   onNukeConfirm?: () => void,
   onSaveQuery?: () => void,
   onRenameQuery?: () => void
) {
   const [query, setQuery] = useState("")
   const [selectedIndex, setSelectedIndex] = useState(0)
   const [mode, setMode] = useState<PaletteMode>("default")
   const inputRef = useRef<HTMLInputElement>(null)
   const previousThemeIdRef = useRef<string | null>(null)
   const previousEnvIdRef = useRef<string | null>(null)

   const environments = useEnvironmentStore(s => s.environments)
   const selectedEnvironmentId = useEnvironmentStore(s => s.selectedEnvironmentId)
   const selectEnvironment = useEnvironmentStore(s => s.selectEnvironment)
   const openTab = useWorkspaceStore(s => s.openTab)
   const tabs = useWorkspaceStore(s => s.tabs)
   const activeTabId = useWorkspaceStore(s => s.activeTabId)
   const setActiveTab = useWorkspaceStore(s => s.setActiveTab)
   const setActiveWorkspace = useWorkspaceStore(s => s.setActiveWorkspace)
   const vimModeEnabled = useSettingsStore(s => s.vimModeEnabled)
   const setVimModeEnabled = useSettingsStore(s => s.setVimModeEnabled)
   const savedQueriesAll = useSavedQueriesStore(s => s.queries)
   const historyEntriesAll = useHistoryStore(s => s.entries)
   const savedQueries = selectedEnvironmentId
      ? savedQueriesAll.filter(q => q.environmentId === selectedEnvironmentId)
      : savedQueriesAll
   const historyEntries = selectedEnvironmentId
      ? historyEntriesAll.filter(h => h.environmentId === selectedEnvironmentId)
      : historyEntriesAll
   const { themeId, setTheme } = useThemeStore()

   const handleSelectEnvironment = (envId: string) => {
      selectEnvironment(envId)
      setActiveWorkspace(envId)
   }

   const enterThemeMode = () => {
      previousThemeIdRef.current = themeId
      setMode("themes")
      setQuery("")
      const currentIdx = themes.findIndex(t => t.id === themeId)
      setSelectedIndex(currentIdx >= 0 ? currentIdx : 0)
   }

   const handleThemeHover = (themeId: string | null) => {
      if (themeId) {
         const theme = themes.find(t => t.id === themeId)
         if (theme) applyTheme(theme)
      } else {
         const current = useThemeStore.getState().currentTheme
         applyTheme(current)
      }
   }

   const handleThemeSelect = (id: string) => {
      previousThemeIdRef.current = null
      setTheme(id)
      setMode("default")
      setQuery("")
   }

   const exitThemeMode = () => {
      if (previousThemeIdRef.current) {
         const original = themes.find(t => t.id === previousThemeIdRef.current)
         if (original) applyTheme(original)
      }
      previousThemeIdRef.current = null
      setMode("default")
      setQuery("")
   }

   const enterDatabaseMode = () => {
      previousEnvIdRef.current = selectedEnvironmentId
      setMode("databases")
      setQuery("")
      const currentIdx = environments.findIndex(e => e.id === selectedEnvironmentId)
      setSelectedIndex(currentIdx >= 0 ? currentIdx : 0)
   }

   const handleDatabaseSelect = (id: string) => {
      previousEnvIdRef.current = null
      handleSelectEnvironment(id)
      setMode("default")
      setQuery("")
   }

   const exitDatabaseMode = () => {
      previousEnvIdRef.current = null
      setMode("default")
      setQuery("")
   }

   const filteredEnvironments = !query
      ? environments
      : environments.filter(
           e =>
              e.name.toLowerCase().includes(query.toLowerCase()) ||
              e.dbType.toLowerCase().includes(query.toLowerCase())
        )

   const filteredThemes = !query
      ? themes
      : themes.filter(
           t =>
              t.name.toLowerCase().includes(query.toLowerCase()) ||
              t.id.toLowerCase().includes(query.toLowerCase())
        )

   const actions = buildPaletteActions({
      environments,
      tabs,
      activeTabId,
      savedQueries,
      historyEntries,
      vimModeEnabled,
      openTab,
      setActiveTab,
      onSelectEnvironment: handleSelectEnvironment,
      enterThemeMode,
      enterDatabaseMode,
      setVimModeEnabled,
      onExecuteQuery,
      onClearResults,
      onOpenQuery,
      onNukeConfirm,
      onSaveQuery,
      onRenameQuery,
   })

   const groupedItems = groupPaletteItems(actions, query)
   const flatFiltered = flattenGrouped(groupedItems)

   useEffect(() => {
      if (isOpen) {
         if (mode !== "themes" && mode !== "databases") {
            setQuery("")
            setSelectedIndex(0)
         }
         setTimeout(() => inputRef.current?.focus(), 50)
      }
   }, [isOpen, mode])

   useEffect(() => {
      if (mode === "themes") {
         const theme = filteredThemes[selectedIndex]
         if (theme) handleThemeHover(theme.id)
      }
   }, [selectedIndex, mode, filteredThemes, handleThemeHover])

   useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
         if (!isOpen) {
            return
         }
         if (e.key === "Escape") {
            e.preventDefault()
            if (mode === "themes") {
               exitThemeMode()
            } else if (mode === "databases") {
               exitDatabaseMode()
            } else {
               onClose()
            }
            return
         }
         const next = () => {
            const visible =
               mode === "themes"
                  ? Math.min(filteredThemes.length, 10)
                  : mode === "databases"
                    ? Math.min(filteredEnvironments.length, 10)
                    : Math.min(flatFiltered.length, 7)
            setSelectedIndex(p => Math.min(p + 1, visible - 1))
         }
         const prev = () => {
            setSelectedIndex(p => Math.max(p - 1, 0))
         }
         if (e.key === "ArrowDown") {
            e.preventDefault()
            next()
            return
         }
         if (e.key === "ArrowUp") {
            e.preventDefault()
            prev()
            return
         }
         if (e.key === "Enter") {
            if (mode === "themes") {
               if (filteredThemes[selectedIndex]) {
                  e.preventDefault()
                  handleThemeSelect(filteredThemes[selectedIndex].id)
                  onClose()
                  return
               }
               return
            }
            if (mode === "databases") {
               if (filteredEnvironments[selectedIndex]) {
                  e.preventDefault()
                  handleDatabaseSelect(filteredEnvironments[selectedIndex].id)
                  onClose()
                  return
               }
               return
            }
            if (flatFiltered[selectedIndex]) {
               e.preventDefault()
               const action = flatFiltered[selectedIndex]
               action.onSelect()
               if (action.id !== "switch-theme" && action.id !== "switch-db") {
                  onClose()
               }
               return
            }
         }
      }
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
   }, [
      isOpen,
      onClose,
      selectedIndex,
      flatFiltered,
      mode,
      filteredThemes,
      filteredEnvironments,
      exitThemeMode,
      exitDatabaseMode,
      handleThemeSelect,
      handleDatabaseSelect,
      vimModeEnabled,
   ])

   return {
      query,
      setQuery,
      selectedIndex,
      setSelectedIndex,
      inputRef,
      groupedItems,
      flatFiltered,
      activeTabId,
      mode,
      setMode,
      exitThemeMode,
      themes,
      filteredThemes,
      themeId,
      handleThemeHover,
      handleThemeSelect,
      filteredEnvironments,
      handleDatabaseSelect,
      exitDatabaseMode,
   }
}
