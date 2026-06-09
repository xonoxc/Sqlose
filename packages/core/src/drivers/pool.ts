import pg from "pg"
import mysql from "mysql2/promise"
import type { DBType } from "@sqlose/shared"

type Pool = pg.Pool | mysql.Pool

const pools = new Map<string, Pool>()

function isPgPool(pool: Pool): pool is pg.Pool {
   return pool instanceof pg.Pool
}

export function getPool(connectionString: string, dbType: DBType): Pool {
   const existing = pools.get(connectionString)
   if (existing) return existing

   let pool: Pool
   if (dbType === "postgres") {
      pool = new pg.Pool({
         connectionString,
         max: 5,
         idleTimeoutMillis: 30000,
         connectionTimeoutMillis: 5000,
      })
      pool.on("error", err => {
         console.error("Unexpected error on postgres pool client:", err)
      })
   } else if (dbType === "mysql") {
      pool = mysql.createPool({
         uri: connectionString,
         connectionLimit: 5,
         idleTimeout: 30000,
      })
   } else {
      throw new Error(`Pooling not supported for dbType: ${dbType}`)
   }

   pools.set(connectionString, pool)
   return pool
}

export async function destroyPool(connectionString: string): Promise<void> {
   const pool = pools.get(connectionString)
   if (!pool) return

   pools.delete(connectionString)

   if (isPgPool(pool)) {
      await pool.end()
   } else {
      await (pool as mysql.Pool).end()
   }
}

export async function destroyAllPools(): Promise<void> {
   const keys = Array.from(pools.keys())
   await Promise.all(keys.map(destroyPool))
}
