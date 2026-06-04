import { create } from "zustand"
import { persist } from "zustand/middleware"
import { ok, err, type Result } from "neverthrow"
import { AppError } from "@sqlose/shared"
import type { VimMode } from "../lib/types"
import { sqliteStorage } from "../lib/sqlite-storage"

interface EditorStore {
   vimMode: VimMode
   queryDraft: string
   selectedEnvironmentId: string | null

   setVimMode: (mode: VimMode) => Result<VimMode, AppError>
   setQueryDraft: (content: string) => Result<string, AppError>
   setSelectedEnvironment: (environmentId: string | null) => Result<string | null, AppError>
}

const VIM_MODES_SET: ReadonlySet<string> = new Set([
   "normal",
   "insert",
   "visual",
   "visual-line",
   "visual-block",
])

function isValidVimMode(mode: unknown): mode is VimMode {
   return typeof mode === "string" && VIM_MODES_SET.has(mode)
}

export const useEditorStore = create<EditorStore>()(
   persist(
      (set) => ({
         vimMode: "normal",
         queryDraft: "",
         selectedEnvironmentId: null,

         setVimMode: (mode: VimMode) => {
            if (!isValidVimMode(mode)) {
               return err(new AppError("vim:mode_error", `Invalid Vim mode: ${mode}`))
            }
            set({ vimMode: mode })
            return ok(mode)
         },

         setQueryDraft: (content: string) => {
            set({ queryDraft: content })
            return ok(content)
         },

         setSelectedEnvironment: (environmentId: string | null) => {
            set({ selectedEnvironmentId: environmentId })
            return ok(environmentId)
         },
      }),
       {
          name: "sqlose-editor",
          storage: sqliteStorage,
          partialize: state => ({
             vimMode: state.vimMode,
             queryDraft: state.queryDraft,
             selectedEnvironmentId: state.selectedEnvironmentId,
          }),
       }
   )
)
