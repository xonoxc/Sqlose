import pg from "pg"
import mysql from "mysql2/promise"
import type { DBType, QueryResult, AsyncAppResult } from "@sqlose/shared"
import { executeSQLiteQuery } from "./sqlite"

export type Pool = pg.Pool | mysql.Pool

export interface DriverSpec {
   execute: (connectionString: string, sql: string) => AsyncAppResult<QueryResult>
   testConnection?: (connectionString: string) => AsyncAppResult<boolean>
   createPool?: (connectionString: string) => Pool
   containerized: boolean
   image: string
   internalPort: number
   env: string[]
   connectionString: (port: number) => string
}

export const DRIVERS: Record<DBType, DriverSpec> = {
   postgres: {
      containerized: true,
      image: "postgres:16-alpine",
      internalPort: 5432,
      env: ["POSTGRES_PASSWORD=sqlose", "POSTGRES_USER=sqlose", "POSTGRES_DB=sqlose"],
      connectionString: port => `postgresql://sqlose:sqlose@localhost:${port}/sqlose`,
      execute: (connectionString, sql) =>
         import("./postgres").then(m => m.executePostgresQuery(connectionString, sql)),
      testConnection: connectionString =>
         import("./postgres").then(m => m.testPostgresConnection(connectionString)),
      createPool: connectionString => {
         const pool = new pg.Pool({
            connectionString,
            max: 5,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
         })
         pool.on("error", err => {
            console.error("Unexpected error on postgres pool client:", err)
         })
         return pool
      },
   },
   mysql: {
      containerized: true,
      image: "mysql:8.0",
      internalPort: 3306,
      env: [
         "MYSQL_ROOT_PASSWORD=sqlose",
         "MYSQL_DATABASE=sqlose",
         "MYSQL_USER=sqlose",
         "MYSQL_PASSWORD=sqlose",
      ],
      connectionString: port => `mysql://sqlose:sqlose@localhost:${port}/sqlose`,
      execute: (connectionString, sql) =>
         import("./mysql").then(m => m.executeMySQLQuery(connectionString, sql)),
      testConnection: connectionString =>
         import("./mysql").then(m => m.testMySQLConnection(connectionString)),
      createPool: connectionString =>
         mysql.createPool({
            uri: connectionString,
            connectionLimit: 5,
            idleTimeout: 30000,
         }),
   },
   sqlite: {
      containerized: false,
      image: "nouchka/sqlite3:latest",
      internalPort: 0,
      env: [],
      connectionString: () => "sqlite:///data/sqlose.db",
      execute: executeSQLiteQuery,
   },
}
