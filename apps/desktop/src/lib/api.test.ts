import { describe, it, expect, vi, beforeEach } from "vitest"
import { api } from "./api"

function mockSqlose() {
   const mock = {
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
   }
   ;(window as unknown as Record<string, unknown>).sqlose = mock
   return mock
}

describe("api", () => {
   beforeEach(() => {
      vi.clearAllMocks()
   })

   describe("docker", () => {
      it("startEnv should call window.sqlose.docker.startEnv", async () => {
         const mock = mockSqlose()
         mock.docker.startEnv.mockResolvedValue({ success: true, data: { environmentId: "env-1" } })
         const result = await api.docker.startEnv("env-1")
         expect(result.isOk()).toBe(true)
         expect(mock.docker.startEnv).toHaveBeenCalledWith({ environmentId: "env-1" })
      })

      it("startEnv should handle error response", async () => {
         const mock = mockSqlose()
         mock.docker.startEnv.mockResolvedValue({
            success: false,
            error: { code: "docker:container_failed", message: "Failed" },
         })
         const result = await api.docker.startEnv("env-1")
         expect(result.isErr()).toBe(true)
      })

      it("health should call window.sqlose.docker.health", async () => {
         const mock = mockSqlose()
         mock.docker.health.mockResolvedValue({
            success: true,
            data: { healthy: true, uptime: 120 },
         })
         const result = await api.docker.health("env-1")
         expect(result.isOk()).toBe(true)
      })

      it("cleanup should call window.sqlose.docker.cleanup", async () => {
         const mock = mockSqlose()
         mock.docker.cleanup.mockResolvedValue({ success: true, data: { cleaned: 0 } })
         const result = await api.docker.cleanup()
         expect(result.isOk()).toBe(true)
      })

      it("stopEnv should call window.sqlose.docker.stopEnv", async () => {
         const mock = mockSqlose()
         mock.docker.stopEnv.mockResolvedValue({ success: true, data: {} })
         const result = await api.docker.stopEnv("env-1")
         expect(result.isOk()).toBe(true)
      })

      it("restartEnv should call window.sqlose.docker.restartEnv", async () => {
         const mock = mockSqlose()
         mock.docker.restartEnv.mockResolvedValue({ success: true, data: {} })
         const result = await api.docker.restartEnv("env-1")
         expect(result.isOk()).toBe(true)
      })
   })

   describe("env", () => {
      it("create should call window.sqlose.env.create", async () => {
         const mock = mockSqlose()
         mock.env.create.mockResolvedValue({
            success: true,
            data: { id: "env-1", dbType: "postgres" },
         })
         const result = await api.env.create("postgres", "test")
         expect(result.isOk()).toBe(true)
         expect(mock.env.create).toHaveBeenCalledWith({ dbType: "postgres", name: "test" })
      })

      it("list should call window.sqlose.env.list", async () => {
         const mock = mockSqlose()
         mock.env.list.mockResolvedValue({ success: true, data: [] })
         const result = await api.env.list()
         expect(result.isOk()).toBe(true)
      })

      it("destroy should call window.sqlose.env.destroy", async () => {
         const mock = mockSqlose()
         mock.env.destroy.mockResolvedValue({ success: true, data: {} })
         const result = await api.env.destroy("env-1")
         expect(result.isOk()).toBe(true)
      })

      it("get should call window.sqlose.env.get", async () => {
         const mock = mockSqlose()
         mock.env.get.mockResolvedValue({ success: true, data: { id: "env-1" } })
         const result = await api.env.get("env-1")
         expect(result.isOk()).toBe(true)
      })

      it("duplicate should call window.sqlose.env.duplicate", async () => {
         const mock = mockSqlose()
         mock.env.duplicate.mockResolvedValue({ success: true, data: { id: "env-2" } })
         const result = await api.env.duplicate("env-1")
         expect(result.isOk()).toBe(true)
      })

      it("reset should call window.sqlose.env.reset", async () => {
         const mock = mockSqlose()
         mock.env.reset.mockResolvedValue({ success: true, data: { id: "env-1" } })
         const result = await api.env.reset("env-1")
         expect(result.isOk()).toBe(true)
      })

      it("create should handle error response", async () => {
         const mock = mockSqlose()
         mock.env.create.mockResolvedValue({
            success: false,
            error: { code: "env:create_failed", message: "Failed" },
         })
         const result = await api.env.create("postgres")
         expect(result.isErr()).toBe(true)
      })
   })

   describe("query", () => {
      it("execute should call window.sqlose.query.execute", async () => {
         const mock = mockSqlose()
         mock.query.execute.mockResolvedValue({
            success: true,
            data: { columns: ["id"], rows: [], rowCount: 0, executionTimeMs: 5 },
         })
         const result = await api.query.execute("env-1", "SELECT 1")
         expect(result.isOk()).toBe(true)
         expect(mock.query.execute).toHaveBeenCalledWith({
            environmentId: "env-1",
            sql: "SELECT 1",
         })
      })
   })

   describe("import", () => {
      it("csv should call window.sqlose.import.csv", async () => {
         const mock = mockSqlose()
         mock.import.csv.mockResolvedValue({
            success: true,
            data: { tableName: "users", rowCount: 5, columns: ["id", "name"] },
         })
         const result = await api.import.csv({
            environmentId: "env-1",
            fileName: "data.csv",
            content: "id,name\n1,a",
            tableName: "users",
         })
         expect(result.isOk()).toBe(true)
      })

      it("sql should call window.sqlose.import.sql", async () => {
         const mock = mockSqlose()
         mock.import.sql.mockResolvedValue({ success: true, data: { tablesCreated: ["users"] } })
         const result = await api.import.sql({
            environmentId: "env-1",
            fileName: "dump.sql",
            content: "CREATE TABLE",
            tableName: "",
         })
         expect(result.isOk()).toBe(true)
      })

      it("previewCSV should call window.sqlose.import.previewCSV", async () => {
         const mock = mockSqlose()
         mock.import.previewCSV.mockResolvedValue({
            success: true,
            data: { columns: ["id"], preview: [{ id: "1" }] },
         })
         const result = await api.import.previewCSV("id\n1")
         expect(result.isOk()).toBe(true)
      })
   })

   describe("dataset", () => {
      it("list should call window.sqlose.dataset.list", async () => {
         const mock = mockSqlose()
         mock.dataset.list.mockResolvedValue({ success: true, data: [] })
         const result = await api.dataset.list()
         expect(result.isOk()).toBe(true)
      })

      it("import should call window.sqlose.dataset.import", async () => {
         const mock = mockSqlose()
         mock.dataset.import.mockResolvedValue({
            success: true,
            data: { tablesCreated: ["products"] },
         })
         const result = await api.dataset.import("ds-1", "env-1")
         expect(result.isOk()).toBe(true)
      })
   })

   describe("error handling", () => {
      it("should throw when sqlose API is not available", () => {
         delete (window as unknown as Record<string, unknown>).sqlose
         expect(() => api.env.list()).rejects.toThrow("sqlose API not available")
      })

      it("should deserialize errors with unknown error code", async () => {
         const mock = mockSqlose()
         mock.env.list.mockResolvedValue({
            success: false,
            error: { code: "unknown:code", message: "Something went wrong" },
         })
         const result = await api.env.list()
         expect(result.isErr()).toBe(true)
         if (result.isErr()) {
            expect(result.error.code).toBe("unknown:code")
         }
      })
   })
})
