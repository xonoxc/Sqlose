import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { destroyAllPools } from "./pool"

const mockConnection = { query: vi.fn(), release: vi.fn() }

const mockPool = {
   getConnection: vi.fn(),
   end: vi.fn(),
}

vi.mock("mysql2/promise", () => ({
   default: {
      createConnection: vi.fn(),
      createPool: vi.fn(() => mockPool),
   },
}))

beforeEach(async () => {
   mockPool.getConnection.mockReset()
   mockPool.getConnection.mockResolvedValue(mockConnection)
   mockConnection.query.mockReset()
   mockConnection.release.mockReset()
   mockConnection.query.mockResolvedValue([
      [{ id: 1, name: "test" }],
      [{ name: "id" }, { name: "name" }],
   ])
})

afterEach(async () => {
   await destroyAllPools()
})

import { executeMySQLQuery, testMySQLConnection } from "./mysql"

describe("executeMySQLQuery", () => {
   it("should execute query and return results", async () => {
      const result = await executeMySQLQuery("mysql://localhost:3306/test", "SELECT * FROM users")
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
         expect(result.value.rowCount).toBe(1)
      }
   })

   it("should return syntax error for invalid SQL", async () => {
      mockConnection.query.mockRejectedValue(new Error("syntax error"))
      const result = await executeMySQLQuery("mysql://localhost:3306/test", "SELECT INVALID")
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
         expect(result.error.code).toBe("query:invalid_syntax")
      }
   })

   it("should return execution error for connection failures", async () => {
      mockConnection.query.mockRejectedValue(new Error("Connection refused"))
      const result = await executeMySQLQuery("mysql://localhost:3306/test", "SELECT 1")
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
         expect(result.error.code).toBe("query:execution_failed")
      }
   })

   it("should handle getConnection failure", async () => {
      mockPool.getConnection.mockRejectedValue(new Error("Connection failed"))
      const result = await executeMySQLQuery("mysql://localhost:3306/test", "SELECT 1")
      expect(result.isErr()).toBe(true)
   })

   it("should release connection after successful query", async () => {
      await executeMySQLQuery("mysql://localhost:3306/test", "SELECT 1")
      expect(mockConnection.release).toHaveBeenCalledTimes(1)
   })

   it("should release connection after failed query", async () => {
      mockConnection.query.mockRejectedValue(new Error("error"))
      await executeMySQLQuery("mysql://localhost:3306/test", "SELECT 1")
      expect(mockConnection.release).toHaveBeenCalledTimes(1)
   })
})

describe("testMySQLConnection", () => {
   it("should return true for successful connection", async () => {
      mockConnection.query.mockResolvedValue([[{ "?column?": 1 }], []])
      const result = await testMySQLConnection("mysql://localhost:3306/test")
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
         expect(result.value).toBe(true)
      }
   })

   it("should return false for failed connection", async () => {
      mockPool.getConnection.mockRejectedValue(new Error("Connection failed"))
      const result = await testMySQLConnection("mysql://localhost:3306/test")
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
         expect(result.value).toBe(false)
      }
   })

   it("should release connection after test", async () => {
      mockConnection.query.mockResolvedValue([[{ "?column?": 1 }], []])
      await testMySQLConnection("mysql://localhost:3306/test")
      expect(mockConnection.release).toHaveBeenCalledTimes(1)
   })
})
