import { create } from "zustand"
import { persist } from "zustand/middleware"
import { ok, err, type Result } from "neverthrow"
import { AppError } from "@sqlose/shared"
import type { Keybinding } from "~/lib/types"
import { createDefaultKeybindings } from "~/lib/types"
import { sqliteStorage } from "~/lib/sqlite-storage"

export type AppearanceMode = "light" | "dark" | "system"
export type RowSpacing = "comfortable" | "compact"
export type ExecutionMode = "review" | "direct"

interface SettingsStore {
   vimModeEnabled: boolean
   keybindings: Keybinding[]
   theme: "dark"
   autoSave: boolean
   appearanceMode: AppearanceMode
   rowSpacing: RowSpacing
   alternatingRowColors: boolean
   tableColumnPreview: boolean
   editorFontSize: number
   executionMode: ExecutionMode

   toggleVimMode: () => Result<boolean, AppError>
   setVimModeEnabled: (enabled: boolean) => Result<boolean, AppError>
   setTheme: (theme: "dark") => Result<"dark", AppError>
   setAutoSave: (enabled: boolean) => Result<boolean, AppError>
   setAppearanceMode: (mode: AppearanceMode) => Result<AppearanceMode, AppError>
   setRowSpacing: (spacing: RowSpacing) => Result<RowSpacing, AppError>
   setAlternatingRowColors: (enabled: boolean) => Result<boolean, AppError>
   setTableColumnPreview: (enabled: boolean) => Result<boolean, AppError>
   setEditorFontSize: (size: number) => Result<number, AppError>
   setExecutionMode: (mode: ExecutionMode) => Result<ExecutionMode, AppError>
   updateKeybinding: (index: number, binding: Keybinding) => Result<Keybinding, AppError>
   addKeybinding: (binding: Keybinding) => Result<Keybinding, AppError>
   removeKeybinding: (index: number) => Result<number, AppError>
   resetKeybindings: () => Result<Keybinding[], AppError>
}

export const useSettingsStore = create<SettingsStore>()(
   persist(
      (set, get) => ({
         vimModeEnabled: false,
         keybindings: createDefaultKeybindings(),
         theme: "dark",
         autoSave: true,
         appearanceMode: "dark",
         rowSpacing: "comfortable",
         alternatingRowColors: false,
         tableColumnPreview: true,
         editorFontSize: 14,
         executionMode: "direct",

         toggleVimMode: () => {
            const current = get().vimModeEnabled
            const newValue = !current
            set({ vimModeEnabled: newValue })
            return ok(newValue)
         },

         setVimModeEnabled: (enabled: boolean) => {
            set({ vimModeEnabled: enabled })
            return ok(enabled)
         },

         setTheme: (theme: "dark") => {
            if (theme !== "dark") {
               return err(new AppError("ipc:invalid_payload", `Invalid theme: ${theme}`))
            }
            set({ theme })
            return ok(theme)
         },

         setAutoSave: (enabled: boolean) => {
            set({ autoSave: enabled })
            return ok(enabled)
         },

         setAppearanceMode: (mode: AppearanceMode) => {
            set({ appearanceMode: mode })
            return ok(mode)
         },

         setRowSpacing: (spacing: RowSpacing) => {
            set({ rowSpacing: spacing })
            return ok(spacing)
         },

         setAlternatingRowColors: (enabled: boolean) => {
            set({ alternatingRowColors: enabled })
            return ok(enabled)
         },

         setTableColumnPreview: (enabled: boolean) => {
            set({ tableColumnPreview: enabled })
            return ok(enabled)
         },

         setEditorFontSize: (size: number) => {
            if (size < 8 || size > 32) {
               return err(new AppError("ipc:invalid_payload", `Invalid font size: ${size}`))
            }
            set({ editorFontSize: size })
            return ok(size)
         },

         setExecutionMode: (mode: ExecutionMode) => {
            set({ executionMode: mode })
            return ok(mode)
         },

         updateKeybinding: (index: number, binding: Keybinding) => {
            const current = get().keybindings
            if (index < 0 || index >= current.length) {
               return err(new AppError("ipc:invalid_payload", `Invalid keybinding index: ${index}`))
            }
            const newBindings = [...current]
            newBindings[index] = binding
            set({ keybindings: newBindings })
            return ok(binding)
         },

         addKeybinding: (binding: Keybinding) => {
            const current = get().keybindings
            const newBindings = [...current, binding]
            set({ keybindings: newBindings })
            return ok(binding)
         },

         removeKeybinding: (index: number) => {
            const current = get().keybindings
            if (index < 0 || index >= current.length) {
               return err(new AppError("ipc:invalid_payload", `Invalid keybinding index: ${index}`))
            }
            const newBindings = current.filter((_, i) => i !== index)
            set({ keybindings: newBindings })
            return ok(index)
         },

         resetKeybindings: () => {
            const defaults = createDefaultKeybindings()
            set({ keybindings: defaults })
            return ok(defaults)
         },
      }),
       {
          name: "sqlose-settings",
          storage: sqliteStorage,
       }
   )
)
