import { useTableBrowserState } from "~/hooks/useTableBrowserState"
import { TableToolbar } from "./TableToolbar"
import { TableStates } from "./TableStates"
import { TablePagination } from "./TablePagination"

export function TableBrowser() {
   const {
      displayTableName,
      tableData,
      tableDataLoading,
      tableDataError,
      schemaColumns,
      totalPages,
      handleRefresh,
      handlePrevPage,
      handleNextPage,
   } = useTableBrowserState()

   if (!displayTableName) {
      return null
   }

   return (
      <div className="flex flex-col h-full bg-bg-primary overflow-hidden">
         <TableToolbar
            displayTableName={displayTableName}
            schemaColumns={schemaColumns}
            tableData={tableData}
            tableDataLoading={tableDataLoading}
            onRefresh={handleRefresh}
         />

         <div className="flex-1 min-h-0 overflow-hidden">
            <TableStates
               displayTableName={displayTableName}
               tableData={tableData}
               tableDataLoading={tableDataLoading}
               tableDataError={tableDataError}
            />
         </div>

         {tableData && tableData.totalCount > 0 && (
            <TablePagination
               tableData={tableData}
               totalPages={totalPages}
               onPrevPage={handlePrevPage}
               onNextPage={handleNextPage}
            />
         )}
      </div>
   )
}
