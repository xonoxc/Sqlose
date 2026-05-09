import { describe, it, expect, beforeEach } from "vitest"
import type { Environment } from "@sqlose/shared"

const mockData: { environments: Record<string, Environment> } = { environments: {} }

const mockStoreInstance = {
   get: vi.fn((key: string) => mockData[key as keyof typeof mockData]),
   set: vi.fn((key: string, value: unknown) => {
      ;(mockData[key as keyof typeof mockData] as unknown) = value
   }),
}

function MockStore() {
   return mockStoreInstance
}

vi.mock("electron-store", () => ({ default: MockStore }))

describe("environment store", () => {
   beforeEach(async () => {
      mockData.environments = {}
      vi.clearAllMocks()
   })

   it("should save and load environments", async () => {
      const { saveEnvironment, loadEnvironments } = await import("./store")
      const env: Environment = {
         id: "env-1",
         name: "test",
         dbType: "postgres",
         status: "running",
         port: 5432,
         uptime: null,
         connectionString: "postgresql://localhost:5432/test",
         containerId: "c1",
         createdAt: "2024-01-01T00:00:00Z",
      }
      saveEnvironment(env)
      const loaded = loadEnvironments()
      expect(loaded).toHaveLength(1)
      expect(loaded[0].id).toBe("env-1")
   })

   it("should load a single environment by id", async () => {
      const { saveEnvironment, loadEnvironment } = await import("./store")
      const env: Environment = {
         id: "env-2",
         name: "test2",
         dbType: "mysql",
         status: "stopped",
         port: 3306,
         uptime: null,
         connectionString: "mysql://localhost:3306/test2",
         containerId: "c2",
         createdAt: "2024-01-01T00:00:00Z",
      }
      saveEnvironment(env)
      const found = loadEnvironment("env-2")
      expect(found).not.toBeNull()
      expect(found!.name).toBe("test2")
   })

   it("should return null for missing environment", async () => {
      const { loadEnvironment } = await import("./store")
      expect(loadEnvironment("nonexistent")).toBeNull()
   })

   it("should delete an environment", async () => {
      const { saveEnvironment, loadEnvironments, deleteEnvironment } = await import("./store")
      const env: Environment = {
         id: "env-3",
         name: "delete-me",
         dbType: "sqlite",
         status: "creating",
         port: 0,
         uptime: null,
         connectionString: "",
         containerId: "",
         createdAt: "2024-01-01T00:00:00Z",
      }
      saveEnvironment(env)
      expect(loadEnvironments()).toHaveLength(1)
      deleteEnvironment("env-3")
      expect(loadEnvironments()).toHaveLength(0)
   })

   it("should clear all environments", async () => {
      const { saveEnvironment, loadEnvironments, clearEnvironments } = await import("./store")
      saveEnvironment({
         id: "env-4",
         name: "a",
         dbType: "postgres",
         status: "running",
         port: 5432,
         uptime: null,
         connectionString: "",
         containerId: "",
         createdAt: "2024-01-01T00:00:00Z",
      })
      saveEnvironment({
         id: "env-5",
         name: "b",
         dbType: "mysql",
         status: "running",
         port: 3306,
         uptime: null,
         connectionString: "",
         containerId: "",
         createdAt: "2024-01-01T00:00:00Z",
      })
      expect(loadEnvironments()).toHaveLength(2)
      clearEnvironments()
      expect(loadEnvironments()).toHaveLength(0)
   })
})
