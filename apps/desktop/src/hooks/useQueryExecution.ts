import { useRef, useCallback } from "react"
import { api } from "~/lib/api"
import { useEnvironmentStore } from "~/stores/environmentStore"
import { useEditorStore } from "~/stores/editorStore"
import { useWorkspaceStore } from "~/stores/workspaceStore"
import { useHistoryStore } from "~/stores/historyStore"
import type { QueryResult } from "@sqlose/shared"

export async function copyResultsToClipboard(result: QueryResult, withHeaders: boolean): Promise<void> {
   const headers = result.columns.join("\t")
   const rows = result.rows
      .map(r =>
         result.columns
            .map(c => {
               const v = r[c]
               return v === null ? "NULL" : String(v)
            })
            .join("\t")
      )
      .join("\n")

   const text = withHeaders ? `${headers}\n${rows}` : rows

   if (navigator.clipboard?.writeText) {
      try {
         await navigator.clipboard.writeText(text)
         return
      } catch (err) {
         console.warn("Clipboard API failed, trying fallback:", err)
      }
   }

   const ta = document.createElement("textarea")
   ta.value = text
   ta.style.position = "fixed"
   ta.style.opacity = "0"

   document.body.appendChild(ta)
   ta.select()

   try {
      ;(document as HTMLDocument & { execCommand(name: string): boolean }).execCommand("copy")
   } catch (err) {
      console.error("All clipboard copy methods failed:", err)
   } finally {
      document.body.removeChild(ta)
   }
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
