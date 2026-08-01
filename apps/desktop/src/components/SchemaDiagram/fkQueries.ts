import type { DBType } from "@sqlose/shared"
import { api } from "~/lib/api"

export interface ForeignKeyRelation {
   fromCol: string
   toTable: string
   toCol: string
}

function foreignKeySQL(dbType: DBType, tableName: string): string | null {
   const safeTableName = tableName.replace(/'/g, "''")

   switch (dbType) {
      case "sqlite":
         return `PRAGMA foreign_key_list('${safeTableName}')`

      case "postgres":
         return `
        SELECT
          kcu.column_name AS from_col,
          ccu.table_name AS to_table,
          ccu.column_name AS to_col
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
         AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage ccu
          ON ccu.constraint_name = tc.constraint_name
         AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name = '${safeTableName}'
          AND tc.table_schema = 'public'
      `

      case "mysql":
         return `
        SELECT
          COLUMN_NAME AS from_col,
          REFERENCED_TABLE_NAME AS to_table,
          REFERENCED_COLUMN_NAME AS to_col
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_NAME = '${safeTableName}'
          AND TABLE_SCHEMA = DATABASE()
          AND REFERENCED_TABLE_NAME IS NOT NULL
      `

      default:
         return null
   }
}

export async function fetchForeignKeys(
   envId: string,
   tableName: string,
   dbType: DBType
): Promise<ForeignKeyRelation[]> {
   const sql = foreignKeySQL(dbType, tableName)
   if (!sql) {
      return []
   }

   const res = await api.query.execute(envId, sql)
   if (res.isErr()) {
      return []
   }

   return res.value.rows.map(r => {
      if (dbType === "sqlite") {
         return {
            fromCol: String(r.from),
            toTable: String(r.table),
            toCol: String(r.to),
         }
      }

      return {
         fromCol: String(r.from_col),
         toTable: String(r.to_table),
         toCol: String(r.to_col),
      }
   })
}
