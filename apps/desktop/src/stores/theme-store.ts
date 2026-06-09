import { create } from "zustand"
import { persist } from "zustand/middleware"
import { themes } from "~/themes"
import { sqliteStorage } from "~/lib/sqlite-storage"
import type { Theme } from "~/types/theme"

export const CSS_VAR_MAP: Record<keyof Theme["colors"], string> = {
   background: "--color-bg-primary",
   surface: "--color-bg-secondary",
   surface2: "--color-bg-tertiary",
   sidebar: "--color-bg-sidebar",
   sidebarActive: "--color-accent",
   sidebarHover: "--color-bg-quaternary",
   border: "--color-border",
   text: "--color-text-primary",
   textMuted: "--color-text-muted",
   primary: "--color-accent",
   secondary: "--color-text-secondary",
   success: "--color-success",
   warning: "--color-warning",
   error: "--color-error",
   accent: "--color-accent",
   editorBackground: "--color-bg-editor",
   editorSelection: "--color-editor-selection",
   editorCursor: "--color-editor-cursor",
   resultGrid: "--color-bg-results",
   resultGridBorder: "--color-border",
   tabBackground: "--color-bg-tab",
   tabActive: "--color-accent",
   statusBar: "--color-bg-primary",
   queryAccent: "--color-query-accent",
}

export function applyTheme(theme: Theme) {
   const root = document.documentElement
   Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVar = CSS_VAR_MAP[key as keyof typeof CSS_VAR_MAP]
      if (cssVar) root.style.setProperty(cssVar, value)
   })
   root.style.setProperty("--color-accent-light", lighten(theme.colors.accent, 15))
   root.style.setProperty("--color-accent-lighter", lighten(theme.colors.accent, 30))
   root.style.setProperty("--color-border-light", lighten(theme.colors.border, 10))
   root.dataset.theme = theme.id
}

function lighten(hex: string, percent: number): string {
   const num = parseInt(hex.replace("#", ""), 16)
   const r = Math.min(255, (num >> 16) + Math.round(2.55 * percent))
   const g = Math.min(255, ((num >> 8) & 0x00ff) + Math.round(2.55 * percent))
   const b = Math.min(255, (num & 0x0000ff) + Math.round(2.55 * percent))
   return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}

interface ThemeStore {
   themeId: string
   currentTheme: Theme
   setTheme: (id: string) => void
}

export const useThemeStore = create<ThemeStore>()(
   persist(
      set => ({
         themeId: themes[0].id,
         currentTheme: themes[0],
         setTheme: (id: string) => {
            const theme = themes.find(t => t.id === id) ?? themes[0]
            applyTheme(theme)
            set({ themeId: theme.id, currentTheme: theme })
         },
      }),
      {
         name: "sqlose-theme",
         storage: sqliteStorage,
         partialize: state => ({ themeId: state.themeId }),
         onRehydrateStorage: () => state => {
            if (state) {
               const theme = themes.find(t => t.id === state.themeId) ?? themes[0]
               state.currentTheme = theme
               state.themeId = theme.id
               applyTheme(theme)
            }
         },
      }
   )
)
