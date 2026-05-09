import type Docker from "dockerode"
import { ok, err } from "neverthrow"
import { AppError, DockerError, okResult } from "@sqlose/shared"
import type { DBType, AsyncAppResult } from "@sqlose/shared"
import { findAvailablePort, reservePort } from "./port"

const DB_IMAGE_MAP: Record<DBType, { image: string; internalPort: number; env: string[] }> = {
   postgres: {
      image: "postgres:16-alpine",
      internalPort: 5432,
      env: ["POSTGRES_PASSWORD=sqlose", "POSTGRES_USER=sqlose", "POSTGRES_DB=sqlose"],
   },
   mysql: {
      image: "mysql:8.0",
      internalPort: 3306,
      env: ["MYSQL_ROOT_PASSWORD=sqlose", "MYSQL_DATABASE=sqlose", "MYSQL_USER=sqlose", "MYSQL_PASSWORD=sqlose"],
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

export function initDocker(): AsyncAppResult<void> {
   if (_docker) return Promise.resolve(okResult(undefined))
   return import("dockerode").then((mod) => {
      _docker = new mod.default()
      return okResult(undefined)
   }).catch((e: Error) =>
      err(new DockerError("docker:container_failed", e.message ?? "Failed to initialize Docker")),
   )
}

export function createEnvironment(dbType: DBType): AsyncAppResult<{
   port: number
   containerId: string
   connectionString: string
}> {
   if (dbType === "sqlite") {
      return Promise.resolve(
         ok({
            port: 0,
            containerId: "",
            connectionString: buildConnectionString(dbType, 0),
         }),
      )
   }

   const docker = getDocker()

   return findAvailablePort().then((portResult) => {
         if (portResult.isErr()) {
            return err(new DockerError("docker:port_conflict", portResult.error.message)) as import("neverthrow").Result<
               { port: number; containerId: string; connectionString: string },
               AppError
            >
         }

         const port = portResult.value
         if (!reservePort(port)) {
            return err(new DockerError("docker:port_conflict", `Port ${port} is already reserved`))
         }

         const config = DB_IMAGE_MAP[dbType]

         return docker
            .createContainer({
               Image: config.image,
               Env: config.env,
               ExposedPorts: { [`${config.internalPort}/tcp`]: {} },
               HostConfig: {
                  PortBindings: {
                     [`${config.internalPort}/tcp`]: [{ HostPort: String(port) }],
                  },
               },
            })
            .then((container) =>
               container.start().then(() =>
                  ok({
                     port,
                     containerId: container.id,
                     connectionString: buildConnectionString(dbType, port),
                  }),
               ),
            )
      })
      .catch((e: Error) => err(new DockerError("docker:container_failed", e.message ?? "Failed to create container")))
}

export function startEnvironment(containerId: string): AsyncAppResult<void> {
   const docker = getDocker()
   return docker
      .getContainer(containerId)
      .start()
      .then(() => okResult(undefined))
      .catch((e: Error) => err(new AppError("env:start_failed", e.message ?? "Failed to start container")))
}

export function stopEnvironment(containerId: string): AsyncAppResult<void> {
   const docker = getDocker()
   return docker
      .getContainer(containerId)
      .stop()
      .then(() => okResult(undefined))
      .catch((e: Error) => err(new AppError("env:stop_failed", e.message ?? "Failed to stop container")))
}

export function restartEnvironment(containerId: string): AsyncAppResult<void> {
   const docker = getDocker()
   return docker
      .getContainer(containerId)
      .restart()
      .then(() => okResult(undefined))
      .catch((e: Error) =>
         err(new DockerError("docker:container_failed", e.message ?? "Failed to restart container")),
      )
}

export function healthCheck(containerId: string): AsyncAppResult<{ healthy: boolean; uptime: number }> {
   if (!containerId) {
      return Promise.resolve(ok({ healthy: true, uptime: 0 }))
   }

   const docker = getDocker()
   return docker
      .getContainer(containerId)
      .inspect()
      .then((info) => {
         const running = info.State.Running
         const startedAt = info.State.StartedAt ? new Date(info.State.StartedAt).getTime() : Date.now()
         const uptime = running ? Math.floor((Date.now() - startedAt) / 1000) : 0
         return ok({ healthy: running, uptime })
      })
      .catch((e: { statusCode?: number; message?: string }) => {
         if (e.statusCode === 404) {
            return ok({ healthy: false, uptime: 0 })
         }
         return err(new DockerError("docker:health_timeout", e.message ?? "Health check failed"))
      })
}

export function destroyContainer(containerId: string): AsyncAppResult<void> {
   if (!containerId) return Promise.resolve(okResult(undefined))

   const docker = getDocker()
   const container = docker.getContainer(containerId)

   return container
      .stop()
      .catch(() => Promise.resolve())
      .then(() => container.remove({ v: true, force: true }))
      .then(() => okResult(undefined))
      .catch((e: Error) =>
         err(new AppError("env:destroy_failed", e.message ?? "Failed to destroy container")),
      )
}

export function cleanupOrphans(): AsyncAppResult<number> {
   const docker = getDocker()
   return docker
      .listContainers({ all: true })
      .then((containers) => {
         let cleaned = 0
         const removePromises: Promise<void>[] = []

         for (const containerInfo of containers) {
            const name = containerInfo.Names[0] ?? ""
            if (name.includes("sqlose") && containerInfo.State === "exited") {
               const container = docker.getContainer(containerInfo.Id)
               removePromises.push(
                  container.remove({ v: true, force: true }).then(() => {
                     cleaned++
                  }),
               )
            }
         }

         return Promise.all(removePromises).then(() => ok(cleaned))
      })
      .catch((e: Error) => err(new DockerError("docker:cleanup_failed", e.message ?? "Cleanup failed")))
}
