import { useRef } from "react"
import { attempt, attemptSync } from "@sqlose/shared"
import { api } from "~/lib/api"
import { useEnvironmentStore } from "~/stores/environmentStore"
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
   if (v === null || v === undefined) {
      return ""
   }
   if (typeof v === "object") {
      return JSON.stringify(v)
   }
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
   if (result.rows.length === 0) {
      return ""
   }
   const cols = result.columns
   const tableName = "results"
   return result.rows
      .map(row => {
         const values = cols.map(c => {
            const v = row[c]
            if (v === null || v === undefined) {
               return "NULL"
            }
            if (typeof v === "number") {
               return String(v)
            }
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

export type ExportFormat = "JSON" | "CSV" | "SQL" | "TSV" | "Markdown"

interface ExportFormatSpec {
   format: (result: QueryResult) => string
   ext: string
   mime: string
}

const EXPORT_FORMATS: Record<ExportFormat, ExportFormatSpec> = {
   JSON: { format: formatAsJson, ext: "json", mime: "application/json" },
   CSV: { format: result => formatAsCsv(result, true), ext: "csv", mime: "text/csv" },
   SQL: { format: formatAsSql, ext: "sql", mime: "text/plain" },
   TSV: {
      format: result => formatAsTsv(result, true),
      ext: "tsv",
      mime: "text/tab-separated-values",
   },
   Markdown: { format: formatAsMarkdown, ext: "md", mime: "text/markdown" },
}

function getExportFormat(format: string): ExportFormatSpec {
   return EXPORT_FORMATS[format as ExportFormat] ?? EXPORT_FORMATS.TSV
}

export function exportResultsToFile(result: QueryResult, format: string): void {
   const spec = getExportFormat(format)
   const blob = new Blob([spec.format(result)], { type: spec.mime })
   const url = URL.createObjectURL(blob)
   const a = document.createElement("a")
   a.href = url
   a.download = `results.${spec.ext}`
   a.click()
   URL.revokeObjectURL(url)
}

export async function copyResultsToClipboard(result: QueryResult, format: string) {
   const text = getExportFormat(format).format(result)

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
      (
         document as HTMLDocument & {
            execCommand(name: string): boolean
         }
      ).execCommand("copy")
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
   const activeTabId = useWorkspaceStore(s => s.activeTabId)
   const activeTab = useWorkspaceStore(s => s.tabs.find(t => t.id === s.activeTabId))
   const queryDraft = activeTab?.query ?? ""
   const updateTab = useWorkspaceStore(s => s.updateTab)
   const addHistoryEntry = useHistoryStore(s => s.addEntry)

   const execute = async () => {
      if (!selectedEnvironmentId || !queryDraft.trim() || !activeTabId) {
         return false
      }

      const executionId = Date.now()
      prevExecutionRef.current = executionId

      updateTab(activeTabId, { isExecuting: true, error: null })

      const startTime = performance.now()
      const result = await api.query.execute(selectedEnvironmentId, queryDraft)
      const elapsed = Math.round(performance.now() - startTime)

      if (prevExecutionRef.current !== executionId) {
         return false
      }

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
            null,
            qr
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
            result.error.message,
            null
         )
      }

      return true
   }

   return { execute, prevExecutionRef }
}
