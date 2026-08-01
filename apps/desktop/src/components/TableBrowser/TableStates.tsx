import { motion, AnimatePresence } from "motion/react"
import { ResultsTable } from "@sqlose/ui"
import { IconTable, IconAlertCircle } from "@tabler/icons-react"
import type { TableDataState } from "~/stores/databaseStore"

interface TableStatesProps {
   displayTableName: string
   tableData: TableDataState | null
   tableDataLoading: boolean
   tableDataError: string | null
}

export function TableStates({
   displayTableName,
   tableData,
   tableDataLoading,
   tableDataError,
}: TableStatesProps) {
   if (tableDataLoading && !tableData) {
      return (
         <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2">
               <div className="h-5 w-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
               <span className="text-[12px] text-text-muted">Loading data...</span>
            </div>
         </div>
      )
   }

   if (tableDataError) {
      return (
         <div className="flex items-start gap-3 p-6">
            <IconAlertCircle className="h-5 w-5 text-error shrink-0 mt-0.5" />
            <div>
               <p className="text-[14px] font-semibold text-error mb-1">
                  Failed to load table data
               </p>
               <p className="text-[12px] text-text-secondary font-mono">{tableDataError}</p>
            </div>
         </div>
      )
   }

   if (tableData && tableData.rows.length > 0) {
      return (
         <AnimatePresence mode="wait">
            <motion.div
               key={`${displayTableName}-${tableData.page}`}
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 0.12 }}
               className="h-full"
            >
               <ResultsTable data={tableData.rows} emptyMessage="No rows" />
            </motion.div>
         </AnimatePresence>
      )
   }

   return (
      <div className="flex flex-col items-center justify-center h-full text-text-muted/60">
         <IconTable className="h-8 w-8 mb-2 opacity-40" />
         <span className="text-[13px]">No data</span>
      </div>
   )
}
