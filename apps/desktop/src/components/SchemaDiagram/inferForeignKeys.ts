import type { ColumnInfo } from "~/lib/schema"
import type { ForeignKeyRelation } from "./fkQueries"

export function inferForeignKeys(
   tableName: string,
   columns: ColumnInfo[],
   allTableNames: string[],
   allTableColumns: Record<string, ColumnInfo[]>
): ForeignKeyRelation[] {
   const relations: ForeignKeyRelation[] = []
   const lowerTableNames = allTableNames.map(t => t.toLowerCase())

   for (const col of columns) {
      const colNameLower = col.name.toLowerCase()
      if (colNameLower === "id" || !colNameLower.endsWith("_id")) continue

      const base = col.name.slice(0, -3)
      if (!base) continue

      const candidates = new Set<string>([base, `${base}s`, `${base}es`])
      if (base.endsWith("y") && base.length > 1 && !"aeiou".includes(base[base.length - 2])) {
         candidates.add(`${base.slice(0, -1)}ies`)
      }
      if (base.endsWith("s") && !base.endsWith("ss")) {
         candidates.add(base.slice(0, -1))
      }

      let matchedTable: string | null = null
      for (const candidate of candidates) {
         const idx = lowerTableNames.indexOf(candidate.toLowerCase())
         if (idx !== -1) {
            matchedTable = allTableNames[idx]
            break
         }
      }

      if (matchedTable && matchedTable !== tableName) {
         const targetCols = allTableColumns[matchedTable] || []
         const pkCol = targetCols.find(tc => tc.primaryKey)
         if (pkCol) {
            relations.push({
               fromCol: col.name,
               toTable: matchedTable,
               toCol: pkCol.name,
            })
         }
      }
   }

   return relations
}
