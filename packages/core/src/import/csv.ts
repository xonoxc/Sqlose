import { ok, err } from "neverthrow"
import { ImportError } from "@sqlose/shared"
import type { ImportResult, AsyncAppResult } from "@sqlose/shared"

export interface CSVParsed {
   columns: string[]
   rows: Record<string, string>[]
}

export interface InferredSchema {
   tableName: string
   columns: { name: string; type: string }[]
}

export async function parseCSV(content: string): AsyncAppResult<CSVParsed> {
   if (!content || content.trim().length === 0) {
      return err(new ImportError("import:parse_failed", "CSV has no content"))
   }

   const allRows = parseCSVRows(content.trim())

   if (allRows.length === 0) {
      return err(new ImportError("import:parse_failed", "CSV has no content"))
   }

   const columns = allRows[0]
   if (columns.length === 0) {
      return err(new ImportError("import:parse_failed", "CSV has no columns"))
   }

   const rows: Record<string, string>[] = []
   for (let i = 1; i < allRows.length; i++) {
      const values = allRows[i]
      if (values.length === 0) continue
      if (values.length !== columns.length) {
         return err(
            new ImportError(
               "import:parse_failed",
               `Row ${i + 1} has ${values.length} values but expected ${columns.length}`
            )
         )
      }
      const row: Record<string, string> = {}
      columns.forEach((col, idx) => {
         row[col] = values[idx]?.trim() ?? ""
      })
      rows.push(row)
   }

   return ok({ columns, rows })
}

function parseCSVRows(content: string): string[][] {
   const rows: string[][] = []
   let currentRow: string[] = []
   let currentField = ""
   let inQuotes = false
   let i = 0

   while (i < content.length) {
      const char = content[i]

      if (inQuotes) {
         if (char === '"') {
            if (i + 1 < content.length && content[i + 1] === '"') {
               currentField += '"'
               i += 2
            } else {
               inQuotes = false
               i++
            }
         } else {
            currentField += char
            i++
         }
      } else {
         if (char === '"') {
            inQuotes = true
            i++
         } else if (char === ",") {
            currentRow.push(currentField)
            currentField = ""
            i++
         } else if (char === "\n" || char === "\r") {
            if (char === "\r" && i + 1 < content.length && content[i + 1] === "\n") {
               i++
            }
            currentRow.push(currentField)
            currentField = ""
            if (currentRow.some(f => f.trim().length > 0)) {
               rows.push(currentRow)
            }
            currentRow = []
            i++
         } else {
            currentField += char
            i++
         }
      }
   }

   currentRow.push(currentField)
   if (currentRow.some(f => f.trim().length > 0)) {
      rows.push(currentRow)
   }

   return rows
}

export function inferSchema(
   columns: string[],
   rows: Record<string, string>[],
   tableName: string
): InferredSchema {
   const schema: InferredSchema = { tableName, columns: [] }

   for (const col of columns) {
      const values = rows.map(r => r[col]).filter(v => v !== "")
      const colType = inferColumnType(values)
      schema.columns.push({ name: col, type: colType })
   }

   return schema
}

function inferColumnType(values: string[]): string {
   if (values.length === 0) {
      return "TEXT"
   }

   const ints = values.every(v => /^-?\d+$/.test(v.trim()))
   if (ints) {
      return "INTEGER"
   }

   const floats = values.every(v => /^-?\d+\.?\d*$/.test(v.trim()))
   if (floats) {
      return "REAL"
   }

   const dates = values.every(v => !isNaN(Date.parse(v)))
   if (dates) {
      return "TIMESTAMP"
   }

   return "TEXT"
}

export function generateCreateTableSQL(schema: InferredSchema): string {
   const colDefs = schema.columns.map(c => `"${c.name}" ${c.type}`).join(",\n   ")
   return `CREATE TABLE IF NOT EXISTS "${schema.tableName}" (\n   ${colDefs}\n);`
}

export function generateInsertSQL(
   tableName: string,
   columns: string[],
   rows: Record<string, string>[]
): string[] {
   return rows.map(row => {
      const values = columns.map(col => {
         const val = row[col] ?? ""
         return escapeSQLValue(val)
      })
      return `INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(", ")}) VALUES (${values.join(", ")});`
   })
}

function escapeSQLValue(value: string): string {
   if (value === "") {
      return "NULL"
   }
   const num = Number(value)
   if (!isNaN(num) && value.trim() !== "") {
      return value
   }
   return `'${value.replace(/'/g, "''")}'`
}

export async function importCSV(content: string, tableName: string): AsyncAppResult<ImportResult> {
   return parseCSV(content).then(parseResult => {
      if (parseResult.isErr()) {
         return err(parseResult.error)
      }

      const { columns, rows } = parseResult.value

      return ok({
         tableName,
         rowCount: rows.length,
         columns,
      } as ImportResult)
   })
}

export async function previewCSV(
   content: string
): AsyncAppResult<{ columns: string[]; preview: Record<string, string>[] }> {
   return parseCSV(content).then(parseResult => {
      if (parseResult.isErr()) {
         return err(parseResult.error)
      }

      const { columns, rows } = parseResult.value
      return ok({
         columns,
         preview: rows.slice(0, 5),
      })
   })
}
