import { describe, it, expect, vi, beforeEach } from "vitest"

const mockPgPool = { end: vi.fn().mockResolvedValue(undefined), on: vi.fn() }
const mockMysqlPool = { end: vi.fn().mockResolvedValue(undefined) }

vi.mock("pg", () => ({
   default: {
      Pool: vi.fn(function (this: Record<string, unknown>) {
         Object.assign(this, mockPgPool)
         return this
      }),
   },
}))

vi.mock("mysql2/promise", () => ({
   default: {
      createPool: vi.fn().mockImplementation(() => mockMysqlPool),
   },
}))

describe("pool", () => {
   beforeEach(async () => {
      vi.clearAllMocks()
      const { destroyAllPools } = await import("./pool")
      await destroyAllPools()
   })

   it("should create a postgres pool", async () => {
      const { getPool } = await import("./pool")
      const pool = getPool("postgresql://localhost/test", "postgres")
      expect(pool).toBeDefined()
      expect(mockPgPool.on).toHaveBeenCalledWith("error", expect.any(Function))
   })

   it("should create a mysql pool", async () => {
      const { getPool } = await import("./pool")
      const pool = getPool("mysql://localhost/test", "mysql")
      expect(pool).toBe(mockMysqlPool)
   })

   it("should return existing pool on second call", async () => {
      const { getPool } = await import("./pool")
      const pool1 = getPool("postgresql://localhost/test", "postgres")
      const pool2 = getPool("postgresql://localhost/test", "postgres")
      expect(pool1).toBe(pool2)
   })

   it("should throw for unsupported dbType", async () => {
      const { getPool } = await import("./pool")
      expect(() => getPool("sqlite:///test.db", "sqlite" as never)).toThrow(
         "Pooling not supported for dbType: sqlite"
      )
   })

   it("should destroy a postgres pool", async () => {
      const { getPool, destroyPool } = await import("./pool")
      getPool("postgresql://localhost/test2", "postgres")
      await destroyPool("postgresql://localhost/test2")
      expect(mockPgPool.end).toHaveBeenCalled()
   })

   it("should destroy a mysql pool", async () => {
      const { getPool, destroyPool } = await import("./pool")
      getPool("mysql://localhost/test", "mysql")
      await destroyPool("mysql://localhost/test")
      expect(mockMysqlPool.end).toHaveBeenCalled()
   })

   it("should do nothing when destroying non-existent pool", async () => {
      const { destroyPool } = await import("./pool")
      await destroyPool("postgresql://localhost/nonexistent")
   })

   it("should destroy all pools", async () => {
      const { getPool, destroyAllPools } = await import("./pool")
      getPool("postgresql://localhost/test3", "postgres")
      getPool("mysql://localhost/test4", "mysql")
      await destroyAllPools()
      expect(mockPgPool.end).toHaveBeenCalled()
      expect(mockMysqlPool.end).toHaveBeenCalled()
   })
})
