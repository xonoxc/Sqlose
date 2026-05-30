import { JSDOM } from "jsdom"
import { vi } from "vitest"

const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
   url: "http://localhost",
   pretendToBeVisual: true,
})

const win = dom.window as unknown as Window & typeof globalThis & { __vitest_mock__?: boolean }

globalThis.window = win
globalThis.document = win.document
globalThis.navigator = win.navigator
Object.defineProperty(globalThis.navigator, "platform", { value: "MacIntel", configurable: true })
globalThis.HTMLElement = win.HTMLElement
globalThis.HTMLInputElement = win.HTMLInputElement
globalThis.HTMLButtonElement = win.HTMLButtonElement
globalThis.HTMLDivElement = win.HTMLDivElement
globalThis.MouseEvent = win.MouseEvent
globalThis.KeyboardEvent = win.KeyboardEvent
globalThis.Node = win.Node
globalThis.Element = win.Element
globalThis.Event = win.Event
globalThis.CustomEvent = win.CustomEvent
globalThis.StorageEvent = win.StorageEvent
globalThis.self = win
globalThis.DocumentFragment = win.DocumentFragment
globalThis.getComputedStyle = win.getComputedStyle
globalThis.NodeFilter = win.NodeFilter
globalThis.DOMParser = win.DOMParser
globalThis.MutationObserver = win.MutationObserver
globalThis.DOMRect = win.DOMRect
globalThis.AggregateError = win.AggregateError

import "@testing-library/jest-dom/vitest"

const mockSqloseAPI = {
   docker: {
      startEnv: vi.fn(),
      stopEnv: vi.fn(),
      restartEnv: vi.fn(),
      health: vi.fn(),
      cleanup: vi.fn(),
   },
   env: {
      create: vi.fn(),
      destroy: vi.fn(),
      list: vi.fn(),
      get: vi.fn(),
      duplicate: vi.fn(),
      reset: vi.fn(),
   },
   query: {
      execute: vi.fn(),
   },
   import: {
      csv: vi.fn(),
      sql: vi.fn(),
      previewCSV: vi.fn(),
   },
   dataset: {
      list: vi.fn(),
      import: vi.fn(),
   },
   db: {
      get: vi.fn().mockResolvedValue({ success: true, data: null }),
      set: vi.fn().mockResolvedValue({ success: true }),
      delete: vi.fn().mockResolvedValue({ success: true }),
   },
}

win.sqlose = mockSqloseAPI as never
