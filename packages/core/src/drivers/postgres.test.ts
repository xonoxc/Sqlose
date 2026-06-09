import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { destroyAllPools } from "./pool"

const mockClient = {
   connect: vi.fn(),
   query: vi.fn(),
   release: vi.fn(),
}

const mockPool = {
   connect: vi.fn(),
   on: vi.fn(),
   end: vi.fn(),
}

vi.mock("pg", () => ({
   default: {
      Client: function Client() {
         return { ...mockClient, end: vi.fn() }
      },
      Pool: function Pool() {
         return mockPool
      },
   },
}))

import { executePostgresQuery, testPostgresConnection } from "./postgres"

beforeEach(() => {
   mockClient.connect.mockReset()
   mockClient.query.mockReset()
   mockClient.release.mockReset()
   mockPool.connect.mockReset()
})

afterEach(async () => {
   await destroyAllPools()
})

describe("executePostgresQuery", () => {
   beforeEach(() => {
      mockPool.connect.mockResolvedValue(mockClient)
      mockClient.query.mockResolvedValue({
         fields: [{ name: "id" }, { name: "name" }],
         rows: [{ id: 1, name: "test" }],
         rowCount: 1,
      })
   })

   it("should execute query and return results", async () => {
      const result = await executePostgresQuery(
         "postgresql://localhost:5432/test",
         "SELECT * FROM users"
      )
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
         expect(result.value.columns).toEqual(["id", "name"])
         expect(result.value.rowCount).toBe(1)
      }
   })

   it("should return syntax error for invalid SQL", async () => {
      mockClient.query.mockRejectedValue(new Error("syntax error at or near"))
      const result = await executePostgresQuery(
         "postgresql://localhost:5432/test",
         "SELECT INVALID"
      )
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
         expect(result.error.code).toBe("query:invalid_syntax")
      }
   })

   it("should return execution error for connection failures", async () => {
      mockClient.query.mockRejectedValue(new Error("Connection refused"))
      const result = await executePostgresQuery("postgresql://localhost:5432/test", "SELECT 1")
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
         expect(result.error.code).toBe("query:execution_failed")
      }
   })

   it("should handle connection failure", async () => {
      mockPool.connect.mockRejectedValue(new Error("connect ECONNREFUSED"))
      const result = await executePostgresQuery("postgresql://localhost:5432/test", "SELECT 1")
      expect(result.isErr()).toBe(true)
   })

   it("should release client after successful query", async () => {
      await executePostgresQuery("postgresql://localhost:5432/test", "SELECT 1")
      expect(mockClient.release).toHaveBeenCalledTimes(1)
   })

   it("should release client after failed query", async () => {
      mockClient.query.mockRejectedValue(new Error("error"))
      await executePostgresQuery("postgresql://localhost:5432/test", "SELECT 1")
      expect(mockClient.release).toHaveBeenCalledTimes(1)
   })
})

describe("testPostgresConnection", () => {
   beforeEach(() => {
      mockPool.connect.mockResolvedValue(mockClient)
      mockClient.query.mockResolvedValue({ rows: [{ "?column?": 1 }] })
   })

   it("should return true for successful connection", async () => {
      const result = await testPostgresConnection("postgresql://localhost:5432/test")
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
         expect(result.value).toBe(true)
      }
   })

   it("should return false for failed connection", async () => {
      mockPool.connect.mockRejectedValue(new Error("Connection failed"))
      const result = await testPostgresConnection("postgresql://localhost:5432/test")
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
         expect(result.value).toBe(false)
      }
   })

   it("should release client after test", async () => {
      await testPostgresConnection("postgresql://localhost:5432/test")
      expect(mockClient.release).toHaveBeenCalledTimes(1)
   })
})
