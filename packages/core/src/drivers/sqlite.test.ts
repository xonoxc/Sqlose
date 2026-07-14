import { describe, it, expect, beforeEach, vi } from "vitest"
import { executeSQLiteQuery } from "./sqlite"

const mockDb = { all: vi.fn(), close: vi.fn() }

vi.mock("sqlite3", () => ({
   default: {
      Database: vi.fn(),
      OPEN_READWRITE: 2,
   },
}))

beforeEach(async () => {
   const sqlite3 = await import("sqlite3")
   const Database = sqlite3.default.Database as unknown as ReturnType<typeof vi.fn>
   mockDb.all.mockReset()
   mockDb.close.mockReset()
   Database.mockReset()
   Database.mockImplementation(function (
      this: { all: typeof vi.fn; close: typeof vi.fn },
      _path: string,
      cb: (err: Error | null) => void
   ) {
      queueMicrotask(() => cb(null))
      return mockDb
   })
   mockDb.all
      .mockReset()
      .mockImplementation((_sql: string, cb: (err: Error | null, rows: unknown[]) => void) => {
         queueMicrotask(() => cb(null, [{ id: 1, name: "test" }]))
      })
   mockDb.close.mockReset().mockImplementation((cb: (err: Error | null) => void) => {
      queueMicrotask(() => cb(null))
   })
})

describe("executeSQLiteQuery", () => {
   it("should execute query and return results", async () => {
      const result = await executeSQLiteQuery("/tmp/test.db", "SELECT * FROM users")
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
         expect(result.value.columns).toEqual(["id", "name"])
         expect(result.value.rowCount).toBe(1)
      }
   })

   it("should return syntax error for invalid SQL", async () => {
      mockDb.all
         .mockReset()
         .mockImplementation((_sql: string, cb: (err: Error | null, _rows: unknown[]) => void) => {
            queueMicrotask(() => cb(new Error('near "INVALID": syntax error'), []))
         })
      const result = await executeSQLiteQuery("/tmp/test.db", "SELECT INVALID")
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
         expect(result.error.code).toBe("query:invalid_syntax")
      }
   })

   it("should return execution error for query failures", async () => {
      mockDb.all
         .mockReset()
         .mockImplementation((_sql: string, cb: (err: Error | null, _rows: unknown[]) => void) => {
            queueMicrotask(() => cb(new Error("no such table: users"), []))
         })
      const result = await executeSQLiteQuery("/tmp/test.db", "SELECT * FROM nonexistent")
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
         expect(result.error.code).toBe("query:execution_failed")
      }
   })

   it("should handle empty results", async () => {
      mockDb.all
         .mockReset()
         .mockImplementation((_sql: string, cb: (err: Error | null, rows: unknown[]) => void) => {
            queueMicrotask(() => cb(null, []))
         })
      const result = await executeSQLiteQuery("/tmp/test.db", "SELECT * FROM empty")
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
         expect(result.value.columns).toEqual([])
         expect(result.value.rowCount).toBe(0)
      }
   })

   it("should handle database open failure", async () => {
      const sqlite3 = await import("sqlite3")
      const Database = sqlite3.default.Database as unknown as ReturnType<typeof vi.fn>
      Database.mockImplementationOnce(function (
         this: { all: typeof vi.fn; close: typeof vi.fn },
         _path: string,
         cb: (err: Error | null) => void
      ) {
         queueMicrotask(() => cb(new Error("Cannot open database")))
         return mockDb
      })
      const result = await executeSQLiteQuery("/invalid/path.db", "SELECT 1")
      expect(result.isErr()).toBe(true)
   })

   it("should handle close error", async () => {
      mockDb.close.mockReset().mockImplementation((cb: (err: Error | null) => void) => {
         queueMicrotask(() => cb(new Error("close failed")))
      })
      const result = await executeSQLiteQuery("/tmp/test.db", "SELECT 1")
      expect(result.isOk()).toBe(true)
   })
})
