import { describe, it, expect, vi, beforeEach, type Mock } from "vitest"
import { QueryError } from "@sqlose/shared"
import { executeQuery, buildQueryHistory } from "./index"
import * as store from "../environment/store"
import * as drivers from "../drivers"

vi.mock("../environment/store", () => ({
   loadEnvironment: vi.fn(),
}))

vi.mock("../drivers", () => ({
   executeQueryForDB: vi.fn(),
}))

describe("Query Execution", () => {
   beforeEach(() => {
      vi.clearAllMocks()
   })

   it("should execute a query successfully", async () => {
      const mockEnv = {
         id: "env-1",
         dbType: "postgres",
         status: "running",
         connectionString: "postgresql://localhost:5432/test",
      }
      ;(store.loadEnvironment as Mock).mockReturnValue(mockEnv)

      const mockResult = {
         columns: ["id", "name"],
         rows: [{ id: 1, name: "test" }],
         rowCount: 1,
         executionTimeMs: 10,
      }
      ;(drivers.executeQueryForDB as Mock).mockResolvedValue({
         isOk: () => true,
         isErr: () => false,
         value: mockResult,
      })

      const result = await executeQuery("env-1", "SELECT * FROM test")

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
         expect(result.value.columns).toEqual(["id", "name"])
         expect(result.value.rowCount).toBe(1)
      }
   })

   it("should return QueryError when environment not found", async () => {
      ;(store.loadEnvironment as Mock).mockReturnValue(null)

      const result = await executeQuery("nonexistent", "SELECT 1")

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
         expect(result.error).toBeInstanceOf(QueryError)
         expect(result.error.code).toBe("query:connection_failed")
      }
   })

   it("should return QueryError when environment is not running", async () => {
      const mockEnv = { id: "env-1", status: "stopped" }
      ;(store.loadEnvironment as Mock).mockReturnValue(mockEnv)

      const result = await executeQuery("env-1", "SELECT 1")

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
         expect(result.error.code).toBe("query:connection_failed")
      }
   })

   it("should forward query errors from drivers", async () => {
      const mockEnv = {
         id: "env-1",
         dbType: "postgres",
         status: "running",
         connectionString: "postgresql://localhost:5432/test",
      }
      ;(store.loadEnvironment as Mock).mockReturnValue(mockEnv)
      ;(drivers.executeQueryForDB as Mock).mockResolvedValue({
         isOk: () => false,
         isErr: () => true,
         error: new QueryError("query:invalid_syntax", "Syntax error near SELECT"),
      })

      const result = await executeQuery("env-1", "SELECTT 1")

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
         expect(result.error.code).toBe("query:invalid_syntax")
      }
   })
})

describe("buildQueryHistory", () => {
   it("should build a query history entry", () => {
      const result = {
         columns: ["id"],
         rows: [{ id: 1 }],
         rowCount: 1,
         executionTimeMs: 5,
      }

      const entry = buildQueryHistory("env-1", "SELECT 1", result, null)

      expect(entry.environmentId).toBe("env-1")
      expect(entry.sql).toBe("SELECT 1")
      expect(entry.result).toEqual(result)
      expect(entry.error).toBeNull()
      expect(entry.id).toContain("q-")
   })

   it("should include error when provided", () => {
      const entry = buildQueryHistory("env-1", "BAD SQL", null, "Syntax error")

      expect(entry.result).toBeNull()
      expect(entry.error).toBe("Syntax error")
   })
})
