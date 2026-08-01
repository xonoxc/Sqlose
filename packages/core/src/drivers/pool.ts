import type { DBType } from "@sqlose/shared"
import { DRIVERS, type Pool } from "./registry"

const pools = new Map<string, Pool>()

export function getPool(connectionString: string, dbType: DBType): Pool {
   const existing = pools.get(connectionString)
   if (existing) {
      return existing
   }

   const createPool = DRIVERS[dbType].createPool
   if (!createPool) {
      throw new Error(`Pooling not supported for dbType: ${dbType}`)
   }

   const pool = createPool(connectionString)
   pools.set(connectionString, pool)
   return pool
}

export async function destroyPool(connectionString: string): Promise<void> {
   const pool = pools.get(connectionString)
   if (!pool) {
      return
   }
   pools.delete(connectionString)

   await pool.end()
}

export async function destroyAllPools(): Promise<void> {
   const keys = Array.from(pools.keys())
   await Promise.all(keys.map(destroyPool))
}
