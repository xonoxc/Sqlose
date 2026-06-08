import "@testing-library/jest-dom/vitest"
import { vi } from "vitest"

if (typeof window !== "undefined") {
   Object.defineProperty(navigator, "platform", { value: "MacIntel", configurable: true })
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
       update: {
          onUpdateAvailable: vi.fn().mockReturnValue(vi.fn()),
          onDownloadProgress: vi.fn().mockReturnValue(vi.fn()),
          onUpdateDownloaded: vi.fn().mockReturnValue(vi.fn()),
          onUpdateError: vi.fn().mockReturnValue(vi.fn()),
          downloadUpdate: vi.fn(),
          quitAndInstall: vi.fn(),
       },
    }

   ;(mockSqloseAPI as Record<string, unknown>).db = {
      get: vi.fn().mockResolvedValue({ success: true, data: null }),
      set: vi.fn().mockResolvedValue({ success: true }),
      delete: vi.fn().mockResolvedValue({ success: true }),
   }

   Object.defineProperty(window, "sqlose", {
      value: mockSqloseAPI,
      writable: true,
      configurable: true,
   })

   const localStorageMock = (() => {
      let store: Record<string, string> = {}
      return {
         getItem: (key: string) => store[key] ?? null,
         setItem: (key: string, value: string) => {
            store[key] = value
         },
         removeItem: (key: string) => {
            delete store[key]
         },
         clear: () => {
            store = {}
         },
      }
   })()

   Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
   })

   afterEach(() => {
      localStorageMock.clear()
   })
}
