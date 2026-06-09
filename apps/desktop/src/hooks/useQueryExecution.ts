import { useRef, useCallback } from "react"
import { attempt, attemptSync } from "@sqlose/shared"
import { api } from "~/lib/api"
import { useEnvironmentStore } from "~/stores/environmentStore"
import { useEditorStore } from "~/stores/editorStore"
import { useWorkspaceStore } from "~/stores/workspaceStore"
import { useHistoryStore } from "~/stores/historyStore"
import type { QueryResult } from "@sqlose/shared"

function escapeCsv(value: string): string {
   if (value.includes(",") || value.includes('"') || value.includes("\n") || value.includes("\r")) {
      return `"${value.replace(/"/g, '""')}"`
   }
   return value
}

function formatCell(v: unknown): string {
   if (v === null || v === undefined) return ""
   if (typeof v === "object") return JSON.stringify(v)
   return String(v)
}

function formatAsJson(result: QueryResult): string {
   return JSON.stringify(result.rows, null, 2)
}

function formatAsCsv(result: QueryResult, withHeaders: boolean): string {
   const lines: string[] = []
   if (withHeaders) {
      lines.push(result.columns.map(c => escapeCsv(c)).join(","))
   }
   for (const row of result.rows) {
      lines.push(result.columns.map(c => escapeCsv(formatCell(row[c]))).join(","))
   }
   return lines.join("\n")
}

function formatAsSql(result: QueryResult): string {
   if (result.rows.length === 0) return ""
   const cols = result.columns
   const tableName = "results"
   return result.rows
      .map(row => {
         const values = cols.map(c => {
            const v = row[c]
            if (v === null || v === undefined) return "NULL"
            if (typeof v === "number") return String(v)
            return `'${String(v).replace(/'/g, "''")}'`
         })
         return `INSERT INTO ${tableName} (${cols.join(", ")}) VALUES (${values.join(", ")});`
      })
      .join("\n")
}

function formatAsTsv(result: QueryResult, withHeaders: boolean): string {
   const lines: string[] = []
   if (withHeaders) {
      lines.push(result.columns.join("\t"))
   }
   for (const row of result.rows) {
      lines.push(result.columns.map(c => formatCell(row[c])).join("\t"))
   }
   return lines.join("\n")
}

function formatAsMarkdown(result: QueryResult): string {
   const cols = result.columns
   const header = `| ${cols.join(" | ")} |`
   const separator = `| ${cols.map(() => "---").join(" | ")} |`
   const rows = result.rows.map(row => `| ${cols.map(c => formatCell(row[c])).join(" | ")} |`)
   return [header, separator, ...rows].join("\n")
}

const FILE_EXT: Record<string, string> = {
   JSON: "json",
   CSV: "csv",
   SQL: "sql",
   TSV: "tsv",
   Markdown: "md",
}

const MIME_TYPES: Record<string, string> = {
   JSON: "application/json",
   CSV: "text/csv",
   SQL: "text/plain",
   TSV: "text/tab-separated-values",
   Markdown: "text/markdown",
}

function formatResults(result: QueryResult, format: string): string {
   switch (format) {
      case "JSON":
         return formatAsJson(result)
      case "CSV":
         return formatAsCsv(result, true)
      case "SQL":
         return formatAsSql(result)
      case "TSV":
         return formatAsTsv(result, true)
      case "Markdown":
         return formatAsMarkdown(result)
      default:
         return formatAsTsv(result, true)
   }
}

export function exportResultsToFile(result: QueryResult, format: string): void {
   const content = formatResults(result, format)
   const ext = FILE_EXT[format] ?? "txt"
   const mime = MIME_TYPES[format] ?? "text/plain"
   const blob = new Blob([content], { type: mime })
   const url = URL.createObjectURL(blob)
   const a = document.createElement("a")
   a.href = url
   a.download = `results.${ext}`
   a.click()
   URL.revokeObjectURL(url)
}

export async function copyResultsToClipboard(result: QueryResult, format: string): Promise<void> {
   const text = formatResults(result, format)

   if (navigator.clipboard?.writeText) {
      const clipResult = await attempt(navigator.clipboard.writeText(text))
      if (clipResult.isOk()) {
         return
      }
      console.warn("Clipboard API failed, trying fallback:", clipResult.error)
   }

   const ta = document.createElement("textarea")
   ta.value = text
   ta.style.position = "fixed"
   ta.style.opacity = "0"

   document.body.appendChild(ta)
   ta.select()

   const execResult = attemptSync(() =>
      (document as HTMLDocument & { execCommand(name: string): boolean }).execCommand("copy")
   )
   if (execResult.isErr()) {
      console.error("All clipboard copy methods failed:", execResult.error)
   }
   document.body.removeChild(ta)
}

export function useQueryExecution() {
   const prevExecutionRef = useRef<number>(0)

   const selectedEnvironmentId = useEnvironmentStore(s => s.selectedEnvironmentId)
   const environments = useEnvironmentStore(s => s.environments)
   const queryDraft = useEditorStore(s => s.queryDraft)
   const activeTabId = useWorkspaceStore(s => s.activeTabId)
   const updateTab = useWorkspaceStore(s => s.updateTab)
   const addHistoryEntry = useHistoryStore(s => s.addEntry)

   const execute = useCallback(async (): Promise<boolean> => {
      if (!selectedEnvironmentId || !queryDraft.trim() || !activeTabId) return false

      const executionId = Date.now()
      prevExecutionRef.current = executionId

      updateTab(activeTabId, { isExecuting: true, error: null })

      const startTime = performance.now()
      const result = await api.query.execute(selectedEnvironmentId, queryDraft)
      const elapsed = Math.round(performance.now() - startTime)

      if (prevExecutionRef.current !== executionId) return false

      const selectedEnv = environments.find(e => e.id === selectedEnvironmentId)

      if (result.isOk()) {
         const qr = result.value
         updateTab(activeTabId, {
            isExecuting: false,
            result: qr,
            error: null,
            isDirty: false,
            executionTimeMs: elapsed,
         })
         addHistoryEntry(
            queryDraft,
            selectedEnvironmentId,
            selectedEnv?.dbType ?? "sql",
            elapsed,
            qr.rowCount,
            "success",
            null
         )
      } else {
         updateTab(activeTabId, {
            isExecuting: false,
            result: null,
            error: result.error.message,
            executionTimeMs: elapsed,
         })
         addHistoryEntry(
            queryDraft,
            selectedEnvironmentId,
            selectedEnv?.dbType ?? "sql",
            elapsed,
            0,
            "error",
            result.error.message
         )
      }

      return true
   }, [selectedEnvironmentId, queryDraft, activeTabId, environments, updateTab, addHistoryEntry])

   return { execute, prevExecutionRef }
}
