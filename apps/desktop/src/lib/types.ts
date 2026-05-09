import type { QueryResult } from "@sqlose/shared"

export type TabType = "query" | "import" | "dataset"

export interface Tab {
   id: string
   type: TabType
   title: string
   environmentId: string | null
   isDirty: boolean
   isExecuting: boolean
   query: string
   result: QueryResult | null
   error: string | null
   createdAt: string
}

export interface PaneSizes {
   sidebarWidth: number
   editorHeight: number
   resultsHeight: number
}

export type VimMode = "normal" | "insert" | "visual" | "visual-line" | "visual-block"

export interface Keybinding {
   action: string
   key: string
   ctrl: boolean
   shift: boolean
   alt: boolean
   meta: boolean
}

export function createTab(environmentId: string | null = null): Tab {
   const id = `tab-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
   return {
      id,
      type: "query",
      title: "New Query",
      environmentId,
      isDirty: false,
      isExecuting: false,
      query: "",
      result: null,
      error: null,
      createdAt: new Date().toISOString(),
   }
}

export function createDefaultPaneSizes(): PaneSizes {
   return {
      sidebarWidth: 280,
      editorHeight: 300,
      resultsHeight: 300,
   }
}

export function createDefaultKeybindings(): Keybinding[] {
   return [
      { action: "query.execute", key: "Enter", ctrl: false, shift: false, alt: false, meta: true },
      { action: "query.execute", key: "Enter", ctrl: true, shift: false, alt: false, meta: false },
      { action: "palette.open", key: "k", ctrl: false, shift: false, alt: false, meta: true },
      { action: "palette.open", key: "p", ctrl: true, shift: true, alt: false, meta: false },
      { action: "tab.new", key: "t", ctrl: false, shift: false, alt: false, meta: true },
      { action: "tab.close", key: "w", ctrl: false, shift: false, alt: false, meta: true },
      { action: "tab.next", key: "Tab", ctrl: false, shift: false, alt: false, meta: true },
      { action: "tab.prev", key: "Tab", ctrl: false, shift: true, alt: false, meta: true },
   ]
}
