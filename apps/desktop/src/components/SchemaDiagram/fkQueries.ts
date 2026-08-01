import type { DBType } from "@sqlose/shared"
import { api } from "~/lib/api"
import { SQL_DIALECTS } from "~/lib/sqlDialects"
import type { ForeignKeyRelation } from "~/lib/sqlDialects"

export type { ForeignKeyRelation } from "~/lib/sqlDialects"

export async function fetchForeignKeys(
   envId: string,
   tableName: string,
   dbType: DBType
): Promise<ForeignKeyRelation[]> {
   const sql = SQL_DIALECTS[dbType].fkSQL(tableName)

   const res = await api.query.execute(envId, sql)
   if (res.isErr()) {
      return []
   }

   return res.value.rows.map(r => SQL_DIALECTS[dbType].mapFkRow(r))
}
