import { useCallback } from "react"
import { useEditorStore } from "~/stores/editorStore"
import { useWorkspaceStore } from "~/stores/workspaceStore"
import { useEnvironmentStore } from "~/stores/environmentStore"
import { useQueryExecution } from "~/hooks/useQueryExecution"

export function useWorkspaceActions() {
   const queryDraft = useEditorStore(s => s.queryDraft)
   const setQueryDraft = useEditorStore(s => s.setQueryDraft)

   const environments = useEnvironmentStore(s => s.environments)
   const selectedEnvironmentId = useEnvironmentStore(s => s.selectedEnvironmentId)

   const activeTabId = useWorkspaceStore(s => s.activeTabId)
   const activeTab = useWorkspaceStore(s => s.tabs.find(t => t.id === s.activeTabId))
   const updateTab = useWorkspaceStore(s => s.updateTab)
   const openTab = useWorkspaceStore(s => s.openTab)
   const setActiveTab = useWorkspaceStore(s => s.setActiveTab)

   const { execute } = useQueryExecution()
   const isExecuting = activeTab?.isExecuting ?? false

   const selectedEnv = selectedEnvironmentId
      ? (environments.find(e => e.id === selectedEnvironmentId) ?? null)
      : null

   const handleNewQuery = useCallback(() => {
      const result = openTab()
      if (result.isOk()) {
         setQueryDraft("")
      }
   }, [openTab, setQueryDraft])

   const handleQueryChange = useCallback((value: string) => {
      setQueryDraft(value)
      const tid = useWorkspaceStore.getState().activeTabId
      if (tid) {
         useWorkspaceStore.getState().updateTab(tid, { query: value, isDirty: true })
      }
   }, [setQueryDraft])

   const handleClearResults = useCallback(() => {
      const tid = useWorkspaceStore.getState().activeTabId
      if (tid) {
         useWorkspaceStore.getState().updateTab(tid, { result: null, error: null })
      }
   }, [])

   const handleOpenTable = useCallback((tableName: string) => {
      const result = openTab(selectedEnvironmentId ?? undefined, { tableName, title: tableName })
      if (result.isOk()) {
         const tab = result.value
         setActiveTab(tab.id)
      }
   }, [openTab, selectedEnvironmentId, setActiveTab])

   const handleOpenQuery = useCallback((sql: string) => {
      const result = openTab()
      if (result.isOk()) {
         const tab = result.value
         updateTab(tab.id, { query: sql })
         setQueryDraft(sql)
         setActiveTab(tab.id)
      }
   }, [openTab, updateTab, setQueryDraft, setActiveTab])

   return {
      queryDraft,
      setQueryDraft,
      activeTab,
      activeTabId,
      selectedEnv,
      isExecuting,
      execute,
      handleNewQuery,
      handleQueryChange,
      handleClearResults,
      handleOpenTable,
      handleOpenQuery,
   }
}
