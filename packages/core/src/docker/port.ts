import { createServer, AddressInfo } from "net"
import { ok, err } from "neverthrow"
import { DockerError } from "@sqlose/shared"
import type { AsyncAppResult } from "@sqlose/shared"

export function findAvailablePort(min = 4000, max = 6000): AsyncAppResult<number> {
   return new Promise((resolve) => {
      const server = createServer()
      server.listen(0, () => {
         const address = server.address() as AddressInfo
         const port = address.port
         server.close(() => {
            if (port >= min && port <= max) {
               resolve(ok(port))
            } else {
               resolve(findAvailablePort(min, max))
            }
         })
      })
      server.on("error", () => {
         resolve(err(new DockerError("docker:port_conflict", "Failed to allocate port")))
      })
   })
}

const usedPorts = new Set<number>()

export function reservePort(port: number): boolean {
   if (usedPorts.has(port)) return false
   usedPorts.add(port)
   return true
}

export function releasePort(port: number): void {
   usedPorts.delete(port)
}
