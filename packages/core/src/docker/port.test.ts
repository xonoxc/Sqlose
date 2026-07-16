import { describe, it, expect, vi, afterEach } from "vitest"

let shouldFailListen = false

vi.mock("net", () => ({
   createServer: () => {
      const server = {
         on: vi.fn(),
         listen: vi.fn((_port: number, cb: () => void) => {
            if (shouldFailListen) {
               const errorHandler = server.on.mock.calls.find(
                  ([event]: [string]) => event === "error"
               )
               if (errorHandler) errorHandler[1](new Error("EADDRINUSE"))
            } else {
               cb()
            }
         }),
         close: vi.fn((cb: () => void) => cb()),
      }
      return server
   },
}))

import { reservePort, releasePort, findAvailablePort } from "./port"

afterEach(() => {
   shouldFailListen = false
})

describe("findAvailablePort", () => {
   it("should find an available port", async () => {
      const result = await findAvailablePort(15000, 15100)
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
         expect(result.value).toBeGreaterThanOrEqual(15000)
         expect(result.value).toBeLessThanOrEqual(15100)
      }
   })

   it("should return error when no ports available", async () => {
      shouldFailListen = true
      const result = await findAvailablePort(15200, 15200)
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
         expect(result.error.code).toBe("docker:port_conflict")
      }
   })
})

describe("port management", () => {
   it("reservePort should return true for available port", () => {
      expect(reservePort(5000)).toBe(true)
      releasePort(5000)
   })

   it("reservePort should return false for already reserved port", () => {
      reservePort(5001)
      expect(reservePort(5001)).toBe(false)
      releasePort(5001)
   })

   it("reservePort should allow re-reserving after release", () => {
      reservePort(5002)
      releasePort(5002)
      expect(reservePort(5002)).toBe(true)
      releasePort(5002)
   })

   it("releasePort should not throw for unreserved port", () => {
      expect(() => releasePort(9999)).not.toThrow()
   })

   it("reservePort should allow multiple distinct ports", () => {
      expect(reservePort(5010)).toBe(true)
      expect(reservePort(5011)).toBe(true)
      expect(reservePort(5012)).toBe(true)
      releasePort(5010)
      releasePort(5011)
      releasePort(5012)
   })
})
