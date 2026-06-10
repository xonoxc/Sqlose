import { ok } from "neverthrow"
import type { AsyncAppResult } from "@sqlose/shared"

export interface SQLStatement {
   type: "create" | "insert" | "other"
   sql: string
}

export async function parseSQLDump(content: string): AsyncAppResult<SQLStatement[]> {
   const statements: SQLStatement[] = []
   const cleaned = content.replace(/--.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "")
   const parts = splitSQL(cleaned)

   for (const part of parts) {
      const trimmed = part.trim()
      if (!trimmed) continue

      const upper = trimmed.toUpperCase()
      let type: SQLStatement["type"]
      if (upper.startsWith("CREATE")) type = "create"
      else if (upper.startsWith("INSERT")) type = "insert"
      else type = "other"

      statements.push({ type, sql: trimmed })
   }

   return ok(statements)
}

function splitSQL(content: string): string[] {
   const statements: string[] = []
   let current = ""
   let inString = false
   let stringChar = ""

   for (let i = 0; i < content.length; i++) {
      const char = content[i]
      if (inString) {
         current += char
         if (char === stringChar && content[i - 1] !== "\\") {
            inString = false
         }
      } else if (char === "'" || char === '"') {
         current += char
         inString = true
         stringChar = char
      } else if (char === ";") {
         statements.push(current)
         current = ""
      } else {
         current += char
      }
   }

   const remaining = current.trim()
   if (remaining) statements.push(remaining)

   return statements
}

export function extractTableNames(statements: SQLStatement[]): string[] {
   const tables: string[] = []
   for (const stmt of statements) {
      if (stmt.type === "create") {
         const match = stmt.sql.match(
            /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"']?(\w+)[`"']?/i
         )
         if (match) tables.push(match[1])
      }
   }
   return tables
}
