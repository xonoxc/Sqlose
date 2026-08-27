import { useWorkspaceStore } from "~/stores/workspaceStore"
import { useEnvironmentStore } from "~/stores/environmentStore"
import { useQueryExecution } from "~/hooks/useQueryExecution"
import type { Tab } from "~/lib/types"

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

   const handleNewQuery = () => openTab()

   const handleQueryChange = (value: string) => {
      const tid = useWorkspaceStore.getState().activeTabId
      if (!tid) return

      useWorkspaceStore.getState().updateTab(tid, {
         query: value,
         isDirty: true,
      })
   }

   const setQueryDraft = (value: string) => {
      const tid = useWorkspaceStore.getState().activeTabId
      if (!tid) return

      useWorkspaceStore.getState().updateTab(tid, {
         query: value,
      })
   }

   const handleClearResults = () => {
      const tid = useWorkspaceStore.getState().activeTabId
      if (!tid) return

      useWorkspaceStore.getState().updateTab(tid, {
         result: null,
         error: null,
      })
   }

   const handleOpenTable = (tableName: string) => {
      openTab({
         tableName,
         title: tableName,
      })
   }

   const handleOpenQuery = (sql: string, savedQueryId?: string, savedQueryName?: string) => {
      const result = openTab()
      if (result.isOk()) {
         const tab = result.value
         const updates: Partial<Tab> = { query: sql }

         if (savedQueryName) {
            updates.title = savedQueryName
         }
         if (savedQueryId) {
            updates.savedQueryId = savedQueryId
         }
         updateTab(tab.id, updates)
         setActiveTab(tab.id)
      }
   }

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
