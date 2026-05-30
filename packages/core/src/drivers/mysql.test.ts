import { describe, it, expect, beforeEach, vi } from "vitest"
import { executeMySQLQuery, testMySQLConnection } from "./mysql"

const mockConnection = { query: vi.fn(), end: vi.fn() }

vi.mock("mysql2/promise", () => ({
   default: {
      createConnection: vi.fn(),
   },
}))

beforeEach(async () => {
   const mysql = await import("mysql2/promise")
   ;(mysql.default.createConnection as ReturnType<typeof vi.fn>).mockReset()
   ;(mysql.default.createConnection as ReturnType<typeof vi.fn>).mockResolvedValue(mockConnection)
   mockConnection.query.mockReset()
   mockConnection.end.mockReset()
   mockConnection.query.mockResolvedValue([
      [{ id: 1, name: "test" }],
      [{ name: "id" }, { name: "name" }],
   ])
   mockConnection.end.mockResolvedValue(undefined)
})

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

   it("should handle createConnection failure", async () => {
      const mysql = await import("mysql2/promise")
      ;(mysql.default.createConnection as ReturnType<typeof vi.fn>).mockRejectedValue(
         new Error("Connection failed")
      )
      const result = await executeMySQLQuery("mysql://localhost:3306/test", "SELECT 1")
      expect(result.isErr()).toBe(true)
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
      const mysql = await import("mysql2/promise")
      ;(mysql.default.createConnection as ReturnType<typeof vi.fn>).mockRejectedValue(
         new Error("Connection failed")
      )
      const result = await testMySQLConnection("mysql://localhost:3306/test")
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
         expect(result.value).toBe(false)
      }
   })
})
