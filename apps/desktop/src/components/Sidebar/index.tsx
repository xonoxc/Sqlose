import { useSidebarState } from "~/hooks/useSidebarState"
import { useSettingsStore } from "~/stores/settingsStore"
import { SidebarCollapsed } from "./SidebarCollapsed"
import { SidebarHeader } from "./SidebarHeader"
import { WorkspaceNav } from "./WorkspaceNav"
import { TableTree } from "./TableTree"

interface AppSidebarProps {
   onSettingsOpen: () => void
   onOpenTable: (tableName: string) => void
   collapsed: boolean
   onToggleCollapse: () => void
}

export function AppSidebar({
   onSettingsOpen,
   onOpenTable,
   collapsed,
   onToggleCollapse,
}: AppSidebarProps) {
   const {
      environments,
      selectedEnvironmentId,
      savedQueries,
      historyEntries,
      tables,
      tableColumns,
      schemaLoading,
      schemaError,
      loadingColumnIds,
      expandedTableIds,
      activeTableId,
      keyboardFocusedIndex,
      filteredTables,
      search,
      setSearch,
      tableTreeExpanded,
      setTableTreeExpanded,
      tableListRef,
      handleSelect,
      handleTableClick,
      handleChevronClick,
      handleRefresh,
      handleNavClick,
      handleKeyDown,
      handleTableDoubleClick,
   } = useSidebarState(onOpenTable)

   const tableColumnPreview = useSettingsStore(s => s.tableColumnPreview)

   if (collapsed) {
      return (
         <SidebarCollapsed
            onToggleCollapse={onToggleCollapse}
            handleNavClick={handleNavClick}
            tableTreeExpanded={tableTreeExpanded}
            setTableTreeExpanded={setTableTreeExpanded}
         />
      )
   }

   return (
      <div className="flex h-full flex-col bg-bg-secondary text-text-secondary w-full p-3">
         <SidebarHeader
            environments={environments}
            selectedEnvironmentId={selectedEnvironmentId}
            handleSelect={handleSelect}
            onSettingsOpen={onSettingsOpen}
            onToggleCollapse={onToggleCollapse}
         />

         <div className="flex-1 flex flex-col min-h-0 custom-scrollbar overflow-y-auto">
            <WorkspaceNav
               savedQueriesCount={savedQueries.length}
               historyCount={historyEntries.length}
               handleNavClick={handleNavClick}
            />

            <TableTree
               tableColumnPreview={tableColumnPreview}
               search={search}
               setSearch={setSearch}
               schemaLoading={schemaLoading}
               schemaError={schemaError}
               tables={tables}
               selectedEnvironmentId={selectedEnvironmentId}
               filteredTables={filteredTables}
               activeTableId={activeTableId}
               expandedTableIds={expandedTableIds}
               keyboardFocusedIndex={keyboardFocusedIndex}
               tableColumns={tableColumns}
               loadingColumnIds={loadingColumnIds}
               tableListRef={tableListRef}
               tableTreeExpanded={tableTreeExpanded}
               setTableTreeExpanded={setTableTreeExpanded}
               handleKeyDown={handleKeyDown}
               handleTableClick={handleTableClick}
               handleTableDoubleClick={handleTableDoubleClick}
               handleChevronClick={handleChevronClick}
               handleRefresh={handleRefresh}
            />
         </div>
      </div>
   )
}
