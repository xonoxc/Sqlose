import type Docker from "dockerode"
import { ok, err } from "neverthrow"
import { AppError, DockerError, okResult, attempt } from "@sqlose/shared"
import type { DBType, AsyncAppResult, AppResult } from "@sqlose/shared"
import { findAvailablePort, reservePort, releasePort } from "./port"
import { loadEnvironments, saveEnvironment } from "../environment/store"

const PING_TIMEOUT_MS = 10 * 1000
const PULL_TIMEOUT_MS = 5 * 60 * 1000
const OP_TIMEOUT_MS = 60 * 1000
const DB_READY_RETRIES = 30
const DB_READY_INTERVAL_MS = 1000

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
   return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
         setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
      ),
   ])
}

const DB_IMAGE_MAP: Record<DBType, { image: string; internalPort: number; env: string[] }> = {
   postgres: {
      image: "postgres:16-alpine",
      internalPort: 5432,
      env: ["POSTGRES_PASSWORD=sqlose", "POSTGRES_USER=sqlose", "POSTGRES_DB=sqlose"],
   },
   mysql: {
      image: "mysql:8.0",
      internalPort: 3306,
      env: [
         "MYSQL_ROOT_PASSWORD=sqlose",
         "MYSQL_DATABASE=sqlose",
         "MYSQL_USER=sqlose",
         "MYSQL_PASSWORD=sqlose",
      ],
   },
   sqlite: {
      image: "nouchka/sqlite3:latest",
      internalPort: 0,
      env: [],
   },
}

function buildConnectionString(dbType: DBType, port: number): string {
   switch (dbType) {
      case "postgres":
         return `postgresql://sqlose:sqlose@localhost:${port}/sqlose`
      case "mysql":
         return `mysql://sqlose:sqlose@localhost:${port}/sqlose`
      case "sqlite":
         return `sqlite:///data/sqlose.db`
   }
}

let _docker: Docker | null = null

export function __setDocker(mock: Docker): void {
   _docker = mock
}

function getDocker(): Docker {
   return _docker as Docker
}

function parseDockerHost(host: string): Record<string, unknown> {
   if (host.startsWith("unix://")) {
      return { socketPath: host.slice(7) }
   }
   if (host.startsWith("npipe://")) {
      return { socketPath: host.slice(8) }
   }
   if (host.startsWith("tcp://")) {
      const rest = host.slice(6)
      const i = rest.lastIndexOf(":")
      return i >= 0
         ? { host: rest.slice(0, i), port: parseInt(rest.slice(i + 1)) || 2375 }
         : { host: rest, port: 2375 }
   }
   return { socketPath: host }
}

export async function initDocker(): AsyncAppResult<void> {
   if (_docker) {
      const pingResult = await attempt(withTimeout(_docker.ping(), PING_TIMEOUT_MS, "Docker ping"))
      if (pingResult.isOk()) {
         return okResult(undefined)
      }
      _docker = null
   }

   const modResult = await attempt(import("dockerode"))
   if (modResult.isErr()) {
      _docker = null
      return err(new DockerError("docker:not_available", "Docker is not reachable"))
   }

   const Docker = modResult.value.default

   const attempts: Record<string, unknown>[] = []

   if (process.env.DOCKER_HOST) {
      attempts.push(parseDockerHost(process.env.DOCKER_HOST))
   }

   if (process.platform === "win32") {
      attempts.push({ socketPath: "//./pipe/docker_engine" })
      attempts.push({ socketPath: "//./pipe/docker_engine_wsl" })
      attempts.push({})
   } else {
      attempts.push({ socketPath: "/var/run/docker.sock" })
      attempts.push({})
   }

   for (const opts of attempts) {
      const client = new Docker(opts)
      const pingResult = await attempt(withTimeout(client.ping(), PING_TIMEOUT_MS, "Docker ping"))
      if (pingResult.isOk()) {
         _docker = client
         return okResult(undefined)
      }
   }

   _docker = null
   return err(new DockerError("docker:not_available", "Docker is not reachable"))
}

export interface PullProgressEvent {
   status?: string
   id?: string
   progressDetail?: {
      current?: number
      total?: number
      [key: string]: unknown
   }
}

export async function pullImage(
   dbType: DBType,
   onProgress?: (percentage: number) => void
): AsyncAppResult<void> {
   const config = DB_IMAGE_MAP[dbType]
   if (!config.image) {
      return okResult(undefined)
   }

   const docker = getDocker()

   const listResult = await attempt(
      withTimeout(
         docker.listImages({ filters: { reference: [config.image] } }),
         OP_TIMEOUT_MS,
         "Listing Docker images"
      )
   )

   if (listResult.isErr()) {
      return err(
         new DockerError(
            "docker:pull_failed",
            listResult.error.message ?? `Failed to pull image ${config.image}`
         )
      )
   }

   if (listResult.value.length > 0) {
      return okResult(undefined)
   }

   const pullResult = await attempt(
      withTimeout(
         new Promise<void>((resolve, reject) => {
            docker.pull(config.image, {}, (err: Error | null, stream: unknown) => {
               if (err) {
                  return reject(err)
               }

               const layers: Record<string, { current: number; total: number }> = {}

               docker.modem.followProgress(
                  stream as NodeJS.ReadableStream,
                  (progressErr: Error | null) => {
                     if (progressErr) reject(progressErr)
                     else resolve()
                  },
                  (event: PullProgressEvent) => {
                     if (onProgress && event.id && event.status && event.progressDetail?.total) {
                        if (event.status === "Downloading" || event.status === "Extracting") {
                           layers[event.id] = {
                              current: event.progressDetail.current || 0,
                              total: event.progressDetail.total,
                           }
                           let current = 0
                           let total = 0
                           for (const layer of Object.values(layers)) {
                              current += layer.current
                              total += layer.total
                           }
                           if (total > 0) {
                              onProgress(Math.round((current / total) * 100))
                           }
                        }
                     }
                  }
               )
            })
         }),
         PULL_TIMEOUT_MS,
         `Pulling image ${config.image}`
      )
   )

   return pullResult.match(
      () => okResult(undefined),
      e =>
         err(
            new DockerError(
               "docker:pull_failed",
               e.message ?? `Failed to pull image ${config.image}`
            )
         )
   )
}

export async function waitForDatabaseReady(
   dbType: DBType,
   connectionString: string
): AsyncAppResult<void> {
   if (dbType === "sqlite") {
      return okResult(undefined)
   }

   let pollAttempt = 0

   async function poll(): AsyncAppResult<void> {
      pollAttempt++
      if (pollAttempt > DB_READY_RETRIES) {
         return err(
            new DockerError("docker:container_failed", "Database did not become ready in time")
         )
      }

      const testFn =
         dbType === "postgres"
            ? () =>
                 import("../drivers/postgres").then(m => m.testPostgresConnection(connectionString))
            : () => import("../drivers/mysql").then(m => m.testMySQLConnection(connectionString))

      const testResult = await attempt(testFn())
      if (testResult.isOk() && testResult.value.isOk() && testResult.value.value) {
         return okResult(undefined)
      }
      await new Promise<void>(resolve => setTimeout(resolve, DB_READY_INTERVAL_MS))
      return poll()
   }

   return poll()
}

export async function createEnvironment(dbType: DBType): AsyncAppResult<{
   port: number
   containerId: string
   connectionString: string
}> {
   if (dbType === "sqlite") {
      return ok({
         port: 0,
         containerId: "",
         connectionString: buildConnectionString(dbType, 0),
      })
   }

   const docker = getDocker()

   type EnvResult = AppResult<{ port: number; containerId: string; connectionString: string }>

   const portResult = await findAvailablePort()
   if (portResult.isErr()) {
      return err(new DockerError("docker:port_conflict", portResult.error.message)) as EnvResult
   }

   const port = portResult.value
   if (!reservePort(port)) {
      return err(
         new DockerError("docker:port_conflict", `Port ${port} is already reserved`)
      ) as EnvResult
   }

   const config = DB_IMAGE_MAP[dbType]

   const pullResult = await pullImage(dbType)
   if (pullResult.isErr()) {
      releasePort(port)
      return err(new DockerError("docker:pull_failed", pullResult.error.message)) as EnvResult
   }

   const createResult = await attempt(
      withTimeout(
         docker.createContainer({
            Image: config.image,
            Env: config.env,
            ExposedPorts: { [`${config.internalPort}/tcp`]: {} },
            HostConfig: {
               PortBindings: {
                  [`${config.internalPort}/tcp`]: [{ HostPort: String(port) }],
               },
            },
         }),
         OP_TIMEOUT_MS,
         "Creating container"
      )
   )

   if (createResult.isErr()) {
      releasePort(port)
      return err(
         new DockerError(
            "docker:container_failed",
            createResult.error.message ?? "Failed to create container"
         )
      ) as EnvResult
   }

   const container = createResult.value

   const startResult = await attempt(
      withTimeout(container.start(), OP_TIMEOUT_MS, "Starting container")
   )

   if (startResult.isErr()) {
      attempt(container.remove({ v: true, force: true }))
      releasePort(port)

      return err(
         new DockerError(
            "docker:container_failed",
            startResult.error.message ?? "Failed to start container"
         )
      ) as EnvResult
   }

   const connectionString = buildConnectionString(dbType, port)
   const readyResult = await waitForDatabaseReady(dbType, connectionString)

   if (readyResult.isErr()) {
      attempt(container.stop())
      attempt(
         container.remove({
            v: true,
            force: true,
         })
      )
      releasePort(port)
      return err(readyResult.error) as EnvResult
   }

   return ok({
      port,
      containerId: container.id,
      connectionString,
   })
}

export async function startEnvironment(containerId: string): AsyncAppResult<void> {
   const docker = getDocker()
   const result = await attempt(
      withTimeout(docker.getContainer(containerId).start(), OP_TIMEOUT_MS, "Starting container")
   )
   return result.match(
      () => okResult(undefined),
      (e: Error) => err(new AppError("env:start_failed", e.message ?? "Failed to start container"))
   )
}

export async function stopEnvironment(containerId: string): AsyncAppResult<void> {
   const docker = getDocker()
   const result = await attempt(
      withTimeout(docker.getContainer(containerId).stop(), OP_TIMEOUT_MS, "Stopping container")
   )
   return result.match(
      () => okResult(undefined),
      (e: Error) => err(new AppError("env:stop_failed", e.message ?? "Failed to stop container"))
   )
}

export async function restartEnvironment(containerId: string): AsyncAppResult<void> {
   const docker = getDocker()
   const result = await attempt(
      withTimeout(docker.getContainer(containerId).restart(), OP_TIMEOUT_MS, "Restarting container")
   )
   return result.match(
      () => okResult(undefined),
      (e: Error) =>
         err(new DockerError("docker:container_failed", e.message ?? "Failed to restart container"))
   )
}

export async function healthCheck(
   containerId: string
): AsyncAppResult<{ healthy: boolean; uptime: number }> {
   if (!containerId) {
      return ok({ healthy: true, uptime: 0 })
   }

   const docker = getDocker()
   const result = await attempt(
      withTimeout(docker.getContainer(containerId).inspect(), OP_TIMEOUT_MS, "Health check")
   )

   return result.match(
      info => {
         const running = info.State.Running
         const startedAt = info.State.StartedAt
            ? new Date(info.State.StartedAt).getTime()
            : Date.now()
         const uptime = running ? Math.floor((Date.now() - startedAt) / 1000) : 0
         return ok({ healthy: running, uptime })
      },
      (e: { statusCode?: number; message?: string; code?: string }) => {
         if (e.statusCode === 404) {
            return ok({ healthy: false, uptime: 0 })
         }
         if ((e as Error).message?.includes("timed out")) {
            return err(new DockerError("docker:health_timeout", "Health check timed out"))
         }
         return err(new DockerError("docker:health_timeout", e.message ?? "Health check failed"))
      }
   )
}

export async function destroyContainer(containerId: string): AsyncAppResult<void> {
   if (!containerId) {
      return okResult(undefined)
   }

   const docker = getDocker()
   const container = docker.getContainer(containerId)

   await attempt(container.stop())

   const removeResult = await attempt(
      withTimeout(
         container.remove({
            v: true,
            force: true,
         }),
         OP_TIMEOUT_MS,
         "Destroying container"
      )
   )

   return removeResult.match(
      () => okResult(undefined),
      (e: Error) =>
         err(new AppError("env:destroy_failed", e.message ?? "Failed to destroy container"))
   )
}

export async function stopAllContainers(): AsyncAppResult<number> {
   const docker = getDocker()

   const listResult = await attempt(docker.listContainers({ all: true }))
   if (listResult.isErr()) {
      return err(
         new DockerError(
            "docker:stop_failed",
            listResult.error.message ?? "Failed to stop containers"
         )
      )
   }

   const containers = listResult.value
   let acted = 0

   for (const containerInfo of containers) {
      const name = containerInfo.Names[0] ?? ""
      if (name.includes("sqlose") && containerInfo.State === "running") {
         const container = docker.getContainer(containerInfo.Id)
         const stopResult = await attempt(
            withTimeout(container.stop(), 15000, "Stopping container")
         )
         if (stopResult.isOk()) acted++
      }
   }

   const envs = loadEnvironments()
   for (const env of envs) {
      if (env.containerId && containers.some(c => c.Id === env.containerId)) {
         saveEnvironment({
            ...env,
            status: "stopped",
            uptime: 0,
         })
      }
   }

   return ok(acted)
}

export async function stopOrphanedContainers(): AsyncAppResult<number> {
   const docker = getDocker()

   const listResult = await attempt(docker.listContainers({ all: true }))
   if (listResult.isErr()) {
      return err(
         new DockerError(
            "docker:cleanup_failed",
            listResult.error.message ?? "Failed to stop orphaned containers"
         )
      )
   }

   const containers = listResult.value
   const envs = loadEnvironments()
   const envContainerIds = new Set(envs.filter(e => e.containerId).map(e => e.containerId))
   let stopped = 0

   for (const containerInfo of containers) {
      const name = containerInfo.Names[0] ?? ""
      if (
         name.includes("sqlose") &&
         containerInfo.State === "running" &&
         !envContainerIds.has(containerInfo.Id)
      ) {
         const container = docker.getContainer(containerInfo.Id)
         const stopResult = await attempt(container.stop())
         if (stopResult.isOk()) stopped++
      }
   }

   return ok(stopped)
}

export async function reconcileEnvironmentStatuses(): AsyncAppResult<number> {
   const docker = getDocker()
   let updated = 0

   const envs = loadEnvironments()

   for (const env of envs) {
      if (!env.containerId) continue

      const containerId = env.containerId
      const inspectResult = await attempt(docker.getContainer(containerId).inspect())

      if (inspectResult.isOk()) {
         const info = inspectResult.value
         if (info.State.Running) {
            const startedAt = info.State.StartedAt
               ? new Date(info.State.StartedAt).getTime()
               : Date.now()
            const uptime = Math.floor((Date.now() - startedAt) / 1000)
            saveEnvironment({ ...env, status: "running", uptime })
            updated++
         } else {
            saveEnvironment({ ...env, status: "stopped", uptime: 0 })
            updated++
         }
      } else if ((inspectResult.error as { statusCode?: number }).statusCode === 404) {
         saveEnvironment({ ...env, status: "error", containerId: null })
         updated++
      }
   }

   return ok(updated)
}

export const cleanupOrphans = stopOrphanedContainers
