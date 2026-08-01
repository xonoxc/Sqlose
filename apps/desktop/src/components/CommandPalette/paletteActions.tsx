import type { ReactNode } from "react"
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
import { isMac } from "~/lib/types"
import type { Environment } from "@sqlose/shared"
import type { Tab, SavedQuery, HistoryEntry } from "~/lib/types"

export interface PaletteAction {
   id: string
   label: string
   description: string
   icon: ReactNode
   shortcut?: string
   category: "action" | "database" | "tab" | "saved" | "history"
   onSelect: () => void
}

interface BuildPaletteActionsParams {
   environments: Environment[]
   tabs: Tab[]
   activeTabId: string | null
   savedQueries: SavedQuery[]
   historyEntries: HistoryEntry[]
   vimModeEnabled: boolean
   openTab: (overrides?: Partial<Tab>) => unknown
   setActiveTab: (tabId: string) => unknown
   onSelectEnvironment: (envId: string) => void
   enterThemeMode: () => void
   enterDatabaseMode: () => void
   setVimModeEnabled: (enabled: boolean) => void
   onExecuteQuery?: () => void
   onClearResults?: () => void
   onOpenQuery?: (sql: string, savedQueryId?: string, savedQueryName?: string) => void
   onNukeConfirm?: () => void
   onSaveQuery?: () => void
   onRenameQuery?: () => void
}

export function buildPaletteActions({
   environments,
   tabs,
   activeTabId,
   savedQueries,
   historyEntries,
   vimModeEnabled,
   openTab,
   setActiveTab,
   onSelectEnvironment,
   enterThemeMode,
   enterDatabaseMode,
   setVimModeEnabled,
   onExecuteQuery,
   onClearResults,
   onOpenQuery,
   onNukeConfirm,
   onSaveQuery,
   onRenameQuery,
}: BuildPaletteActionsParams): PaletteAction[] {
   return [
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
         onSelect: () => enterDatabaseMode(),
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
         onSelect: () => onSelectEnvironment(env.id),
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
}
