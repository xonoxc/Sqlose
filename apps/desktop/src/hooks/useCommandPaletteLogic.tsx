import { useState, useEffect, useRef, useMemo } from "react"
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

interface ModeAccessor {
   visibleCount: number
   onHover: (index: number) => void
   onEnter: (index: number) => boolean
   onExit: () => void
}

export function useCommandPaletteLogic(
   isOpen: boolean,
   onClose: () => void,
   onExecuteQuery?: () => void,
   onClearResults?: () => void,
   onOpenQuery?: (sql: string, savedQueryId?: string, savedQueryName?: string) => void,
   onNukeConfirm?: () => void,
   onSaveQuery?: () => void,
   onRenameQuery?: () => void,
   onOpenSettings?: () => void
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
      onOpenSettings,
   })

   const groupedItems = groupPaletteItems(actions, query)
   const flatFiltered = flattenGrouped(groupedItems)

   const modeAccessors = useMemo<Record<PaletteMode, ModeAccessor>>(
      () => ({
         default: {
            visibleCount: Math.min(flatFiltered.length, 7),
            onHover: () => {},
            onEnter: index => {
               const action = flatFiltered[index]
               if (!action) return false
               action.onSelect()
               if (action.id !== "switch-theme" && action.id !== "switch-db") {
                  onClose()
               }
               return true
            },
            onExit: () => onClose(),
         },
         themes: {
            visibleCount: Math.min(filteredThemes.length, 10),
            onHover: index => {
               const theme = filteredThemes[index]
               if (theme) handleThemeHover(theme.id)
            },
            onEnter: index => {
               const theme = filteredThemes[index]
               if (!theme) return false
               handleThemeSelect(theme.id)
               onClose()
               return true
            },
            onExit: () => exitThemeMode(),
         },
         databases: {
            visibleCount: Math.min(filteredEnvironments.length, 10),
            onHover: () => {},
            onEnter: index => {
               const env = filteredEnvironments[index]
               if (!env) return false
               handleDatabaseSelect(env.id)
               onClose()
               return true
            },
            onExit: () => exitDatabaseMode(),
         },
      }),
      [
         flatFiltered,
         filteredThemes,
         filteredEnvironments,
         handleThemeHover,
         handleThemeSelect,
         handleDatabaseSelect,
         exitThemeMode,
         exitDatabaseMode,
         onClose,
      ]
   )

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
      modeAccessors[mode].onHover(selectedIndex)
   }, [selectedIndex, mode, modeAccessors])

   useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
         if (!isOpen) {
            return
         }
         if (e.key === "Escape") {
            e.preventDefault()
            modeAccessors[mode].onExit()
            return
         }
         const accessor = modeAccessors[mode]
         if (e.key === "ArrowDown") {
            e.preventDefault()
            setSelectedIndex(p => Math.min(p + 1, accessor.visibleCount - 1))
            return
         }
         if (e.key === "ArrowUp") {
            e.preventDefault()
            setSelectedIndex(p => Math.max(p - 1, 0))
            return
         }
         if (e.key === "Enter") {
            if (accessor.onEnter(selectedIndex)) {
               e.preventDefault()
            }
            return
         }
      }
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
   }, [isOpen, onClose, selectedIndex, modeAccessors, mode])

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
