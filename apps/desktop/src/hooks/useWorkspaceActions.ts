import { useCallback } from "react"
import { useWorkspaceStore } from "~/stores/workspaceStore"
import { useEnvironmentStore } from "~/stores/environmentStore"
import { useQueryExecution } from "~/hooks/useQueryExecution"

export function useWorkspaceActions() {
   const environments = useEnvironmentStore(s => s.environments)
   const selectedEnvironmentId = useEnvironmentStore(s => s.selectedEnvironmentId)

   const activeTabId = useWorkspaceStore(s => s.activeTabId)
   const activeTab = useWorkspaceStore(s => s.tabs.find(t => t.id === s.activeTabId))
   const updateTab = useWorkspaceStore(s => s.updateTab)
   const openTab = useWorkspaceStore(s => s.openTab)
   const setActiveTab = useWorkspaceStore(s => s.setActiveTab)

   const { execute } = useQueryExecution()
   const isExecuting = activeTab?.isExecuting ?? false
   const queryDraft = activeTab?.query ?? ""

   const selectedEnv = selectedEnvironmentId
      ? (environments.find(e => e.id === selectedEnvironmentId) ?? null)
      : null

   const handleNewQuery = useCallback(() => {
      openTab()
   }, [openTab])

   const handleQueryChange = useCallback(
      (value: string) => {
         const tid = useWorkspaceStore.getState().activeTabId
         if (tid) {
            useWorkspaceStore.getState().updateTab(tid, { query: value, isDirty: true })
         }
      },
      []
   )

   const setQueryDraft = useCallback((value: string) => {
      const tid = useWorkspaceStore.getState().activeTabId
      if (tid) {
         useWorkspaceStore.getState().updateTab(tid, { query: value })
      }
   }, [])

   const handleClearResults = useCallback(() => {
      const tid = useWorkspaceStore.getState().activeTabId
      if (tid) {
         useWorkspaceStore.getState().updateTab(tid, { result: null, error: null })
      }
   }, [])

   const handleOpenTable = useCallback(
      (tableName: string) => {
         openTab({ tableName, title: tableName })
      },
      [openTab]
   )

   const handleOpenQuery = useCallback(
      (sql: string) => {
         const result = openTab()
         if (result.isOk()) {
            const tab = result.value
            updateTab(tab.id, { query: sql })
            setActiveTab(tab.id)
         }
      },
      [openTab, updateTab, setActiveTab]
   )

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
