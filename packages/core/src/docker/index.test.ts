import { describe, it, expect, vi, beforeEach, type Mock } from "vitest"
import { DockerError } from "@sqlose/shared"
import {
   createEnvironment,
   healthCheck,
   cleanupOrphans,
   destroyContainer,
   startEnvironment,
   stopEnvironment,
   restartEnvironment,
   pullImage,
   initDocker,
   waitForDatabaseReady,
   stopAllContainers,
   stopOrphanedContainers,
   reconcileEnvironmentStatuses,
   __setDocker,
} from "./index"
import * as portModule from "./port"

vi.mock("./port", () => ({
   findAvailablePort: vi.fn(),
   reservePort: vi.fn(),
   releasePort: vi.fn(),
}))

vi.mock("../drivers/postgres", () => ({
   testPostgresConnection: vi.fn(),
}))

vi.mock("../drivers/mysql", () => ({
   testMySQLConnection: vi.fn(),
}))

vi.mock("../environment/store", () => ({
   loadEnvironments: vi.fn().mockReturnValue([]),
   saveEnvironment: vi.fn(),
   loadEnvironment: vi.fn().mockReturnValue(null),
}))

import { loadEnvironments, saveEnvironment } from "../environment/store"

function makeMockDocker(
   overrides: Partial<{
      createContainer: ReturnType<typeof vi.fn>
      getContainer: ReturnType<typeof vi.fn>
      listContainers: ReturnType<typeof vi.fn>
      listImages: ReturnType<typeof vi.fn>
      pull: ReturnType<typeof vi.fn>
   }> = {}
) {
   const mockContainer = {
      id: "mock-container-id",
      start: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn().mockResolvedValue(undefined),
      restart: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn().mockResolvedValue(undefined),
      inspect: vi.fn().mockResolvedValue({
         State: { Running: true, StartedAt: new Date(Date.now() - 5000).toISOString() },
      }),
   }

   const followProgress = vi
      .fn()
      .mockImplementation((_stream, onFinished: (err: Error | null) => void) => {
         onFinished(null)
      })

   return {
      ping: vi.fn().mockResolvedValue(undefined),
      createContainer: overrides.createContainer ?? vi.fn().mockResolvedValue(mockContainer),
      getContainer: overrides.getContainer ?? vi.fn().mockReturnValue(mockContainer),
      listContainers: overrides.listContainers ?? vi.fn().mockResolvedValue([]),
      listImages:
         overrides.listImages ?? vi.fn().mockResolvedValue([{ Id: "sha256:mock", RepoTags: [] }]),
      pull:
         overrides.pull ??
         vi
            .fn()
            .mockImplementation(
               (
                  _image: string,
                  _opts: unknown,
                  callback: (err: Error | null, stream: unknown) => void
               ) => {
                  callback(null, "mock-stream")
               }
            ),
      modem: { followProgress },
   }
}

const mockOkBool = (value: boolean) =>
   Promise.resolve({
      isOk: () => true,
      isErr: () => false,
      value,
      error: undefined,
      _unsafeUnwrap: () => value,
   })

/* const _mockErrBool = (code: string) =>
   Promise.resolve({
      isOk: () => false,
      isErr: () => true,
      error: { code, message: code },
      value: undefined,
      _unsafeUnwrapErr: () => ({ code, message: code }),
   })
*/
describe("Docker Orchestration", () => {
   beforeEach(async () => {
      vi.clearAllMocks()
      __setDocker(makeMockDocker() as never)
      const { testPostgresConnection } = await import("../drivers/postgres")
      const { testMySQLConnection } = await import("../drivers/mysql")
      ;(testPostgresConnection as Mock).mockReturnValue(mockOkBool(true))
      ;(testMySQLConnection as Mock).mockReturnValue(mockOkBool(true))
   })

   describe("pullImage", () => {
      it("should skip pull when image already exists locally", async () => {
         const mockPull = vi.fn()
         __setDocker(
            makeMockDocker({
               listImages: vi
                  .fn()
                  .mockResolvedValue([{ Id: "sha256:abc", RepoTags: ["postgres:16-alpine"] }]),
               pull: mockPull,
            }) as never
         )

         const result = await pullImage("postgres")

         expect(result.isOk()).toBe(true)
         expect(mockPull).not.toHaveBeenCalled()
      })

      it("should pull when image is not found locally", async () => {
         __setDocker(
            makeMockDocker({
               listImages: vi.fn().mockResolvedValue([]),
            }) as never
         )

         const result = await pullImage("postgres")

         expect(result.isOk()).toBe(true)
      })

      it("should skip pull for sqlite image when already local", async () => {
         const mockPull = vi.fn()
         __setDocker(
            makeMockDocker({
               listImages: vi
                  .fn()
                  .mockResolvedValue([{ Id: "sha256:abc", RepoTags: ["nouchka/sqlite3:latest"] }]),
               pull: mockPull,
            }) as never
         )

         const result = await pullImage("sqlite")

         expect(result.isOk()).toBe(true)
         expect(mockPull).not.toHaveBeenCalled()
      })

      it("should return DockerError on pull failure", async () => {
         __setDocker(
            makeMockDocker({
               listImages: vi.fn().mockResolvedValue([]),
               pull: vi.fn().mockImplementation((_image, _opts, callback) => {
                  callback(new Error("Network error"), null)
               }),
            }) as never
         )

         const result = await pullImage("postgres")

         expect(result.isErr()).toBe(true)
         if (result.isErr()) {
            expect(result.error).toBeInstanceOf(DockerError)
            expect(result.error.code).toBe("docker:pull_failed")
         }
      })
   })

   describe("createEnvironment", () => {
      it("should create a postgres environment successfully", async () => {
         ;(portModule.findAvailablePort as Mock).mockResolvedValue({
            isOk: () => true,
            isErr: () => false,
            value: 54321,
            error: undefined,
            _unsafeUnwrap: () => 54321,
         })
         ;(portModule.reservePort as Mock).mockReturnValue(true)

         const result = await createEnvironment("postgres")

         expect(result.isOk()).toBe(true)
         if (result.isOk()) {
            expect(result.value.port).toBe(54321)
            expect(result.value.containerId).toBe("mock-container-id")
            expect(result.value.connectionString).toContain("postgresql://")
         }
      })

      it("should create a mysql environment successfully", async () => {
         ;(portModule.findAvailablePort as Mock).mockResolvedValue({
            isOk: () => true,
            isErr: () => false,
            value: 33061,
            error: undefined,
            _unsafeUnwrap: () => 33061,
         })
         ;(portModule.reservePort as Mock).mockReturnValue(true)

         const result = await createEnvironment("mysql")

         expect(result.isOk()).toBe(true)
         if (result.isOk()) {
            expect(result.value.port).toBe(33061)
            expect(result.value.connectionString).toContain("mysql://")
         }
      })

      it("should handle sqlite without docker container", async () => {
         const result = await createEnvironment("sqlite")

         expect(result.isOk()).toBe(true)
         if (result.isOk()) {
            expect(result.value.port).toBe(0)
            expect(result.value.containerId).toBe("")
         }
      })

      it("should return DockerError when port allocation fails", async () => {
         ;(portModule.findAvailablePort as Mock).mockResolvedValue({
            isOk: () => false,
            isErr: () => true,
            value: undefined,
            error: new DockerError("docker:port_conflict", "No ports available"),
            _unsafeUnwrapErr: () => new DockerError("docker:port_conflict"),
         })

         const result = await createEnvironment("postgres")

         expect(result.isErr()).toBe(true)
         if (result.isErr()) {
            expect(result.error).toBeInstanceOf(DockerError)
            expect(result.error.code).toBe("docker:port_conflict")
         }
      })

      it("should return DockerError when port is already reserved", async () => {
         ;(portModule.findAvailablePort as Mock).mockResolvedValue({
            isOk: () => true,
            isErr: () => false,
            value: 54321,
            error: undefined,
            _unsafeUnwrap: () => 54321,
         })
         ;(portModule.reservePort as Mock).mockReturnValue(false)

         const result = await createEnvironment("postgres")

         expect(result.isErr()).toBe(true)
         if (result.isErr()) {
            expect(result.error).toBeInstanceOf(DockerError)
            expect(result.error.code).toBe("docker:port_conflict")
         }
      })

      it("should return DockerError when container creation fails", async () => {
         ;(portModule.findAvailablePort as Mock).mockResolvedValue({
            isOk: () => true,
            isErr: () => false,
            value: 54321,
            error: undefined,
            _unsafeUnwrap: () => 54321,
         })
         ;(portModule.reservePort as Mock).mockReturnValue(true)

         __setDocker(
            makeMockDocker({
               createContainer: vi.fn().mockRejectedValue(new Error("Docker daemon not running")),
            }) as never
         )

         const result = await createEnvironment("postgres")

         expect(result.isErr()).toBe(true)
         if (result.isErr()) {
            expect(result.error).toBeInstanceOf(DockerError)
            expect(result.error.code).toBe("docker:container_failed")
         }
         expect(portModule.releasePort).toHaveBeenCalledWith(54321)
      })
   })

   describe("healthCheck", () => {
      it("should return healthy for a running container", async () => {
         const result = await healthCheck("container-id")

         expect(result.isOk()).toBe(true)
         if (result.isOk()) {
            expect(result.value.healthy).toBe(true)
            expect(result.value.uptime).toBeGreaterThanOrEqual(0)
         }
      })

      it("should return healthy for empty containerId (sqlite)", async () => {
         const result = await healthCheck("")

         expect(result.isOk()).toBe(true)
         if (result.isOk()) {
            expect(result.value.healthy).toBe(true)
         }
      })

      it("should return unhealthy for missing container", async () => {
         __setDocker(
            makeMockDocker({
               getContainer: vi.fn().mockReturnValue({
                  id: "mock",
                  start: vi.fn(),
                  stop: vi.fn(),
                  restart: vi.fn(),
                  remove: vi.fn(),
                  inspect: vi.fn().mockRejectedValue({ statusCode: 404 }),
               }),
            }) as never
         )

         const result = await healthCheck("nonexistent")

         expect(result.isOk()).toBe(true)
         if (result.isOk()) {
            expect(result.value.healthy).toBe(false)
         }
      })

      it("should return DockerError on inspect failure", async () => {
         __setDocker(
            makeMockDocker({
               getContainer: vi.fn().mockReturnValue({
                  id: "mock",
                  start: vi.fn(),
                  stop: vi.fn(),
                  restart: vi.fn(),
                  remove: vi.fn(),
                  inspect: vi.fn().mockRejectedValue(new Error("Connection refused")),
               }),
            }) as never
         )

         const result = await healthCheck("bad-container")

         expect(result.isErr()).toBe(true)
         if (result.isErr()) {
            expect(result.error).toBeInstanceOf(DockerError)
            expect(result.error.code).toBe("docker:health_timeout")
         }
      })
   })

   describe("container lifecycle", () => {
      it("startEnvironment should start a container", async () => {
         const result = await startEnvironment("container-id")
         expect(result.isOk()).toBe(true)
      })

      it("startEnvironment should return error on failure", async () => {
         __setDocker(
            makeMockDocker({
               getContainer: vi.fn().mockReturnValue({
                  id: "mock",
                  start: vi.fn().mockRejectedValue(new Error("Start failed")),
                  stop: vi.fn(),
                  restart: vi.fn(),
                  remove: vi.fn(),
                  inspect: vi.fn(),
               }),
            }) as never
         )

         const result = await startEnvironment("bad-container")
         expect(result.isErr()).toBe(true)
         if (result.isErr()) {
            expect(result.error.code).toBe("env:start_failed")
         }
      })

      it("stopEnvironment should stop a container", async () => {
         const result = await stopEnvironment("container-id")
         expect(result.isOk()).toBe(true)
      })

      it("stopEnvironment should return error on failure", async () => {
         __setDocker(
            makeMockDocker({
               getContainer: vi.fn().mockReturnValue({
                  id: "mock",
                  start: vi.fn(),
                  stop: vi.fn().mockRejectedValue(new Error("Stop failed")),
                  restart: vi.fn(),
                  remove: vi.fn(),
                  inspect: vi.fn(),
               }),
            }) as never
         )

         const result = await stopEnvironment("bad-container")
         expect(result.isErr()).toBe(true)
         if (result.isErr()) {
            expect(result.error.code).toBe("env:stop_failed")
         }
      })

      it("restartEnvironment should restart a container", async () => {
         const result = await restartEnvironment("container-id")
         expect(result.isOk()).toBe(true)
      })

      it("restartEnvironment should return error on failure", async () => {
         __setDocker(
            makeMockDocker({
               getContainer: vi.fn().mockReturnValue({
                  id: "mock",
                  start: vi.fn(),
                  stop: vi.fn(),
                  restart: vi.fn().mockRejectedValue(new Error("Restart failed")),
                  remove: vi.fn(),
                  inspect: vi.fn(),
               }),
            }) as never
         )

         const result = await restartEnvironment("bad-container")
         expect(result.isErr()).toBe(true)
         if (result.isErr()) {
            expect(result.error.code).toBe("docker:container_failed")
         }
      })
   })

   describe("destroyContainer", () => {
      it("should destroy a container successfully", async () => {
         const result = await destroyContainer("container-id")
         expect(result.isOk()).toBe(true)
      })

      it("should succeed with empty containerId (sqlite)", async () => {
         const result = await destroyContainer("")
         expect(result.isOk()).toBe(true)
      })

      it("should return error on failure", async () => {
         __setDocker(
            makeMockDocker({
               getContainer: vi.fn().mockReturnValue({
                  id: "mock",
                  start: vi.fn(),
                  stop: vi.fn().mockRejectedValue(new Error("Stop failed")),
                  restart: vi.fn(),
                  remove: vi.fn().mockRejectedValue(new Error("Remove failed")),
                  inspect: vi.fn(),
               }),
            }) as never
         )

         const result = await destroyContainer("bad-container")
         expect(result.isErr()).toBe(true)
         if (result.isErr()) {
            expect(result.error.code).toBe("env:destroy_failed")
         }
      })
   })

   describe("cleanupOrphans", () => {
      it("should clean up orphaned containers", async () => {
         __setDocker(
            makeMockDocker({
               listContainers: vi.fn().mockResolvedValue([
                  { Id: "abc", Names: ["/sqlose-postgres"], State: "running" },
                  { Id: "def", Names: ["/other-container"], State: "exited" },
                  { Id: "ghi", Names: ["/sqlose-mysql"], State: "running" },
               ]),
            }) as never
         )

         const result = await cleanupOrphans()

         expect(result.isOk()).toBe(true)
         if (result.isOk()) {
            expect(result.value).toBe(2)
         }
      })

      it("should return DockerError on failure", async () => {
         __setDocker(
            makeMockDocker({
               listContainers: vi.fn().mockRejectedValue(new Error("Docker not available")),
            }) as never
         )

         const result = await cleanupOrphans()
         expect(result.isErr()).toBe(true)
         if (result.isErr()) {
            expect(result.error.code).toBe("docker:cleanup_failed")
         }
      })
   })

   describe("initDocker", () => {
      it("should succeed when Docker is reachable", async () => {
         __setDocker(makeMockDocker() as never)
         const result = await initDocker()
         expect(result.isOk()).toBe(true)
      })

      it("should return error when Docker is not reachable", async () => {
         __setDocker(null as never)
         vi.doMock("dockerode", () => {
            throw new Error("Module not found")
         })
         const result = await initDocker()
         expect(result.isErr()).toBe(true)
         if (result.isErr()) {
            expect(result.error.code).toBe("docker:not_available")
         }
         vi.doUnmock("dockerode")
      })

      it("should reuse existing Docker client when ping succeeds", async () => {
         const mock = makeMockDocker()
         __setDocker(mock as never)
         const result = await initDocker()
         expect(result.isOk()).toBe(true)
         expect(mock.ping).toHaveBeenCalled()
      })
   })

   describe("waitForDatabaseReady", () => {
      it("should return immediately for sqlite", async () => {
         const result = await waitForDatabaseReady("sqlite", "")
         expect(result.isOk()).toBe(true)
      })

      it("should succeed when database becomes ready", async () => {
         const { testPostgresConnection } = await import("../drivers/postgres")
         ;(testPostgresConnection as Mock).mockReturnValue(mockOkBool(true))

         const result = await waitForDatabaseReady("postgres", "postgresql://localhost:5432/test")
         expect(result.isOk()).toBe(true)
      })

      it("should fail after max retries", async () => {
         vi.useFakeTimers()
         const { testPostgresConnection } = await import("../drivers/postgres")
         ;(testPostgresConnection as Mock).mockReturnValue(mockOkBool(false))

         const resultPromise = waitForDatabaseReady("postgres", "postgresql://localhost:5432/test")
         await vi.advanceTimersByTimeAsync(30_000)
         const result = await resultPromise
         vi.useRealTimers()

         expect(result.isErr()).toBe(true)
         if (result.isErr()) {
            expect(result.error.code).toBe("docker:container_failed")
         }
      }, 10_000)
   })

   describe("stopAllContainers", () => {
      it("should stop running sqlose containers", async () => {
         vi.mocked(loadEnvironments).mockReturnValue([])
         __setDocker(
            makeMockDocker({
               listContainers: vi.fn().mockResolvedValue([
                  { Id: "abc", Names: ["/sqlose-postgres-5432"], State: "running" },
                  { Id: "def", Names: ["/other-container"], State: "running" },
               ]),
            }) as never
         )

         const result = await stopAllContainers()
         expect(result.isOk()).toBe(true)
         if (result.isOk()) {
            expect(result.value).toBe(1)
         }
      })

      it("should handle empty container list", async () => {
         __setDocker(
            makeMockDocker({
               listContainers: vi.fn().mockResolvedValue([]),
            }) as never
         )

         const result = await stopAllContainers()
         expect(result.isOk()).toBe(true)
         if (result.isOk()) {
            expect(result.value).toBe(0)
         }
      })

      it("should return DockerError on list failure", async () => {
         __setDocker(
            makeMockDocker({
               listContainers: vi.fn().mockRejectedValue(new Error("Docker not available")),
            }) as never
         )

         const result = await stopAllContainers()
         expect(result.isErr()).toBe(true)
         if (result.isErr()) {
            expect(result.error.code).toBe("docker:stop_failed")
         }
      })
   })

   describe("stopOrphanedContainers", () => {
      it("should stop orphaned sqlose containers not tracked by envs", async () => {
         vi.mocked(loadEnvironments).mockReturnValue([])
         const mock = makeMockDocker({
            listContainers: vi.fn().mockResolvedValue([
               { Id: "abc", Names: ["/sqlose-postgres-5432"], State: "running" },
               { Id: "def", Names: ["/other-container"], State: "running" },
            ]),
         }) as never
         __setDocker(mock)

         const result = await stopOrphanedContainers()
         expect(result.isOk()).toBe(true)
         if (result.isOk()) {
            expect(result.value).toBe(1)
         }
      })

      it("should not stop containers tracked by environments", async () => {
         vi.mocked(loadEnvironments).mockReturnValue([
            { id: "1", containerId: "abc" } as never,
         ])
         const mock = makeMockDocker({
            listContainers: vi.fn().mockResolvedValue([
               { Id: "abc", Names: ["/sqlose-postgres-5432"], State: "running" },
            ]),
         }) as never
         __setDocker(mock)

         const result = await stopOrphanedContainers()
         expect(result.isOk()).toBe(true)
         if (result.isOk()) {
            expect(result.value).toBe(0)
         }
      })

      it("should return error on listContainers failure", async () => {
         __setDocker(
            makeMockDocker({
               listContainers: vi.fn().mockRejectedValue(new Error("Docker error")),
            }) as never
         )
         const result = await stopOrphanedContainers()
         expect(result.isErr()).toBe(true)
         if (result.isErr()) {
            expect(result.error.code).toBe("docker:cleanup_failed")
         }
      })
   })

   describe("reconcileEnvironmentStatuses", () => {
      it("should mark running containers as running", async () => {
         vi.mocked(loadEnvironments).mockReturnValue([
            { id: "1", containerId: "running-container", status: "stopped" } as never,
         ])
         const mock = makeMockDocker({
            getContainer: vi.fn().mockReturnValue({
               inspect: vi.fn().mockResolvedValue({
                  State: { Running: true, StartedAt: new Date(Date.now() - 10000).toISOString() },
               }),
            }),
         }) as never
         __setDocker(mock)

         const result = await reconcileEnvironmentStatuses()
         expect(result.isOk()).toBe(true)
         if (result.isOk()) {
            expect(result.value).toBe(1)
         }
         expect(saveEnvironment).toHaveBeenCalled()
      })

      it("should mark stopped containers as stopped", async () => {
         vi.mocked(loadEnvironments).mockReturnValue([
            { id: "2", containerId: "stopped-container", status: "running" } as never,
         ])
         const mock = makeMockDocker({
            getContainer: vi.fn().mockReturnValue({
               inspect: vi.fn().mockResolvedValue({
                  State: { Running: false, StartedAt: "" },
               }),
            }),
         }) as never
         __setDocker(mock)

         const result = await reconcileEnvironmentStatuses()
         expect(result.isOk()).toBe(true)
         if (result.isOk()) {
            expect(result.value).toBe(1)
         }
      })

      it("should mark missing containers (404) as error", async () => {
         vi.mocked(loadEnvironments).mockReturnValue([
            { id: "3", containerId: "missing-container", status: "running" } as never,
         ])
         const mock = makeMockDocker({
            getContainer: vi.fn().mockReturnValue({
               inspect: vi.fn().mockRejectedValue({ statusCode: 404, message: "not found" }),
            }),
         }) as never
         __setDocker(mock)

         const result = await reconcileEnvironmentStatuses()
         expect(result.isOk()).toBe(true)
         if (result.isOk()) {
            expect(result.value).toBe(1)
         }
      })

      it("should skip environments without containerId", async () => {
         vi.mocked(loadEnvironments).mockReturnValue([
            { id: "4", containerId: "", status: "running" } as never,
         ])
         __setDocker(makeMockDocker() as never)

         const result = await reconcileEnvironmentStatuses()
         expect(result.isOk()).toBe(true)
         if (result.isOk()) {
            expect(result.value).toBe(0)
         }
      })

      it("should handle inspect failure with non-404 error", async () => {
         vi.mocked(loadEnvironments).mockReturnValue([
            { id: "5", containerId: "bad-container", status: "running" } as never,
         ])
         const mock = makeMockDocker({
            getContainer: vi.fn().mockReturnValue({
               inspect: vi.fn().mockRejectedValue(new Error("connection refused")),
            }),
         }) as never
         __setDocker(mock)

         const result = await reconcileEnvironmentStatuses()
         expect(result.isOk()).toBe(true)
         if (result.isOk()) {
            expect(result.value).toBe(0)
         }
      })
   })

   describe("createEnvironment", () => {
      it("should handle container start failure", async () => {
         vi.mocked(portModule.findAvailablePort).mockResolvedValue({ isOk: () => true, isErr: () => false, value: 5555 } as never)
         vi.mocked(portModule.reservePort).mockReturnValue(true)
         vi.mocked(portModule.releasePort).mockReturnValue(undefined as never)

         const mockContainer = {
            id: "new-container",
            start: vi.fn().mockRejectedValue(new Error("port already in use")),
            stop: vi.fn().mockResolvedValue(undefined),
            remove: vi.fn().mockResolvedValue(undefined),
         }
         __setDocker(
            makeMockDocker({
               createContainer: vi.fn().mockResolvedValue(mockContainer),
            }) as never
         )

         const result = await createEnvironment("postgres")
         expect(result.isErr()).toBe(true)
         if (result.isErr()) {
            expect(result.error.code).toBe("docker:container_failed")
         }
      })

      it("should handle DB not ready after container start", async () => {
         vi.mocked(portModule.findAvailablePort).mockResolvedValue({ isOk: () => true, isErr: () => false, value: 5556 } as never)
         vi.mocked(portModule.reservePort).mockReturnValue(true)

         const { testPostgresConnection } = await import("../drivers/postgres")
         ;(testPostgresConnection as Mock).mockReturnValue(mockOkBool(false))

         const mockContainer = {
            id: "new-container",
            start: vi.fn().mockResolvedValue(undefined),
            stop: vi.fn().mockResolvedValue(undefined),
            remove: vi.fn().mockResolvedValue(undefined),
         }
         __setDocker(
            makeMockDocker({
               createContainer: vi.fn().mockResolvedValue(mockContainer),
            }) as never
         )

         const resultPromise = createEnvironment("postgres")
         vi.useFakeTimers()
         await vi.advanceTimersByTimeAsync(35_000)
         vi.useRealTimers()
         const result = await resultPromise

         expect(result.isErr()).toBe(true)
      }, 45_000)
   })
})
