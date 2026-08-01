import { api } from "~/lib/api"
import type { DBType } from "@sqlose/shared"
import { SQL_DIALECTS } from "~/lib/sqlDialects"
import { Result } from "neverthrow"

export interface ColumnInfo {
   name: string
   type: string
   nullable: boolean
   primaryKey: boolean
}

export async function listTables(envId: string, dbType: DBType): Promise<Result<string[], Error>> {
   const result = await api.query.execute(envId, SQL_DIALECTS[dbType].listTablesSQL)
   return result.map(val =>
      val.rows
         .map(row => {
            return String(row.table_name ?? "")
         })
         .filter(Boolean)
   )
}

export async function getTableColumns(
   envId: string,
   tableName: string,
   dbType: DBType
): Promise<Result<ColumnInfo[], Error>> {
   const result = await api.query.execute(envId, SQL_DIALECTS[dbType].columnsSQL(tableName))
   return result.map(val =>
      val.rows.map(r => ({
         name: String(r.column_name ?? ""),
         type: String(r.data_type ?? ""),
         nullable: String(r.is_nullable ?? "YES") !== "NO",
         primaryKey: r.pk === 1 || r.pk === true || r.pk === "1" || r.column_key === "PRI",
      }))
   )
}
