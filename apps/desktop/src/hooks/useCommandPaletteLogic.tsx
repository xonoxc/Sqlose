import { useState, useEffect, useRef } from "react"
import { useEnvironmentStore } from "~/stores/environmentStore"
import { useWorkspaceStore } from "~/stores/workspaceStore"
import { useSettingsStore } from "~/stores/settingsStore"
import { useSavedQueriesStore } from "~/stores/savedQueriesStore"
import { useHistoryStore } from "~/stores/historyStore"
import { useThemeStore, applyTheme } from "~/stores/theme-store"
import { themes } from "~/themes"
import { isMac } from "~/lib/types"
import {
   IconDatabase,
   IconFileCode,
   IconPlayerPlay,
   IconDeviceFloppy,
   IconTrash,
   IconHistory,
   IconArrowLeftRight,
   IconEye,
   IconToggleLeft,
   IconToggleRight,
   IconBookmark,
   IconStar,
   IconPalette,
   IconPencil,
} from "@tabler/icons-react"

interface PaletteAction {
   id: string
   label: string
   description: string
   icon: React.ReactNode
   shortcut?: string
   category: "action" | "database" | "tab" | "saved" | "history"
   onSelect: () => void
}

export type PaletteMode = "default" | "themes"

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

   const environments = useEnvironmentStore(s => s.environments)
   const selectedEnvironmentId = useEnvironmentStore(s => s.selectedEnvironmentId)
   const selectEnvironment = useEnvironmentStore(s => s.selectEnvironment)
   const openTab = useWorkspaceStore(s => s.openTab)
   const tabs = useWorkspaceStore(s => s.tabs)
   const activeTabId = useWorkspaceStore(s => s.activeTabId)
   const activeTab = tabs.find(t => t.id === activeTabId)
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

   const filteredThemes = !query
      ? themes
      : themes.filter(
           t =>
              t.name.toLowerCase().includes(query.toLowerCase()) ||
              t.id.toLowerCase().includes(query.toLowerCase())
        )

   const actions: PaletteAction[] = [
      {
         id: "new-query",
         label: "New Query",
         description: "Open a new query tab",
         icon: <IconFileCode className="h-4 w-4" />,
         shortcut: isMac() ? "⌘N" : "Ctrl+N",
         category: "action",
         onSelect: () => openTab(),
      },
      {
         id: "run-query",
         label: "Run Query",
         description: "Execute the current query",
         icon: <IconPlayerPlay className="h-4 w-4" />,
         shortcut: isMac() ? "⌘⏎" : "Ctrl+↵",
         category: "action",
         onSelect: () => onExecuteQuery?.(),
      },
      {
         id: "save-query",
         label: "Save Query",
         description: "Save the current query",
         icon: <IconDeviceFloppy className="h-4 w-4" />,
         shortcut: isMac() ? "⌘S" : "Ctrl+S",
         category: "action",
         onSelect: () => onSaveQuery?.(),
      },
      {
         id: "rename-query",
         label: "Rename Query",
         description: "Rename a saved query",
         icon: <IconPencil className="h-4 w-4" />,
         category: "action",
         onSelect: () => onRenameQuery?.(),
      },
      {
         id: "clear-results",
         label: "Clear Results",
         description: "Clear the current query results",
         icon: <IconTrash className="h-4 w-4" />,
         category: "action",
         onSelect: () => onClearResults?.(),
      },
      {
         id: "open-saved",
         label: "Saved Queries",
         description: "Browse saved queries",
         icon: <IconBookmark className="h-4 w-4" />,
         category: "action",
         onSelect: () => openTab({ type: "saved", title: "Saved Queries" }),
      },
      {
         id: "open-history",
         label: "Query History",
         description: "Browse past query executions",
         icon: <IconHistory className="h-4 w-4" />,
         category: "action",
         onSelect: () => openTab({ type: "history", title: "History" }),
      },
      {
         id: "view-diagram",
         label: "View Schema Diagram",
         description: "Open the ER diagram for the current database",
         icon: <IconDeviceFloppy className="h-4 w-4" />,
         shortcut: undefined,
         category: "action",
         onSelect: () => openTab({ type: "diagram", title: "Diagram: main" }),
      },
      {
         id: "switch-db",
         label: "Switch Database",
         description: "Change active database connection",
         icon: <IconArrowLeftRight className="h-4 w-4" />,
         category: "action",
         onSelect: () => {
            if (environments.length > 0) {
               const currentIdx = environments.findIndex(e => e.id === activeTab?.environmentId)
               const nextIdx = (currentIdx + 1) % environments.length
               handleSelectEnvironment(environments[nextIdx].id)
            }
         },
      },
      {
         id: "toggle-vim",
         label: vimModeEnabled ? "Disable Vim Mode" : "Enable Vim Mode",
         description: vimModeEnabled
            ? "Turn off Vim keybindings in the editor"
            : "Turn on Vim keybindings in the editor",
         icon: vimModeEnabled ? (
            <IconToggleRight className="h-4 w-4" />
         ) : (
            <IconToggleLeft className="h-4 w-4" />
         ),
         category: "action",
         onSelect: () => setVimModeEnabled(!vimModeEnabled),
      },
      {
         id: "switch-theme",
         label: "Switch Theme",
         description: "Browse and change the application color theme",
         icon: <IconPalette className="h-4 w-4" />,
         category: "action",
         onSelect: () => enterThemeMode(),
      },
      {
         id: "nuke-env",
         label: "Nuke Environment",
         description: "Completely destroy the environment, its container and all data",
         icon: <IconTrash className="h-4 w-4" />,
         category: "action",
         onSelect: () => {
            onNukeConfirm?.()
         },
      },
      ...environments.map(env => ({
         id: `env-${env.id}` as const,
         label: env.name || `${env.dbType} environment`,
         description: `${env.dbType} · ${env.status}`,
         icon: <IconDatabase className="h-4 w-4" />,
         shortcut: undefined as string | undefined,
         category: "database" as const,
         onSelect: () => handleSelectEnvironment(env.id),
      })),
      ...tabs
         .filter(t => t.id !== activeTabId)
         .map(tab => ({
            id: `tab-${tab.id}` as const,
            label: tab.title || "Untitled Query",
            description: `Switch to tab${tab.isDirty ? " · unsaved" : ""}`,
            icon: <IconEye className="h-4 w-4" />,
            shortcut: undefined as string | undefined,
            category: "tab" as const,
            onSelect: () => setActiveTab(tab.id),
         })),
      ...savedQueries.map(q => ({
         id: `sq-${q.id}` as const,
         label: q.name,
         description: q.sql.slice(0, 60),
         icon: <IconStar className="h-4 w-4 text-warning" />,
         shortcut: undefined as string | undefined,
         category: "saved" as const,
          onSelect: () => onOpenQuery?.(q.sql, q.id, q.name),
       })),
       ...historyEntries.slice(0, 10).map(entry => ({
         id: `hist-${entry.id}` as const,
         label: entry.sql.slice(0, 40) + (entry.sql.length > 40 ? "..." : ""),
         description: `${entry.dbType} · ${entry.duration}ms · ${entry.status}`,
         icon: <IconHistory className="h-4 w-4" />,
         shortcut: undefined as string | undefined,
         category: "history" as const,
         onSelect: () => onOpenQuery?.(entry.sql),
      })),
   ]

   const groupedItems = (() => {
      if (!query) {
         return {
            actions: actions.filter(a => a.category === "action"),
            databases: actions.filter(a => a.category === "database"),
            tabs: actions.filter(a => a.category === "tab"),
            saved: actions.filter(a => a.category === "saved"),
            history: actions.filter(a => a.category === "history"),
         }
      }
      const q = query.toLowerCase()

      const score = (item: PaletteAction): number => {
         const label = item.label.toLowerCase()
         const desc = item.description.toLowerCase()
         if (label === q) return 100
         if (label.startsWith(q)) return 90
         if (label.includes(q)) return 70
         if (desc.includes(q)) return 40

         const words = q.split(/\s+/)
         const allWordsMatch = words.every(w => label.includes(w) || desc.includes(w))
         if (allWordsMatch && words.length > 1) return 50
         if (words.some(w => label.includes(w))) return 30

         return 0
      }

      const scored = actions.map(a => ({ ...a, score: score(a) })).filter(a => a.score > 0)
      scored.sort((a, b) => b.score - a.score)

      return {
         actions: scored.filter(a => a.category === "action"),
         databases: scored.filter(a => a.category === "database"),
         tabs: scored.filter(a => a.category === "tab"),
         saved: scored.filter(a => a.category === "saved"),
         history: scored.filter(a => a.category === "history"),
      }
   })()

   const flatFiltered = [
      ...groupedItems.actions,
      ...groupedItems.databases,
      ...groupedItems.tabs,
      ...groupedItems.saved,
      ...groupedItems.history,
   ]

   useEffect(() => {
      if (isOpen) {
         if (mode !== "themes") {
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
         if (!isOpen) return
         if (e.key === "Escape") {
            e.preventDefault()
            if (mode === "themes") {
               exitThemeMode()
            } else {
               onClose()
            }
            return
         }
         const next = () => {
            const visible =
               mode === "themes"
                  ? Math.min(filteredThemes.length, 10)
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
            if (flatFiltered[selectedIndex]) {
               e.preventDefault()
               const action = flatFiltered[selectedIndex]
               action.onSelect()
               if (action.id !== "switch-theme") {
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
      exitThemeMode,
      handleThemeSelect,
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
   }
}
