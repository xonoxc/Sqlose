import { cn } from "@sqlose/ui"
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"
import type { TableDataState } from "~/stores/databaseStore"

interface TablePaginationProps {
   tableData: TableDataState
   totalPages: number
   onPrevPage: () => void
   onNextPage: () => void
}

export function TablePagination({
   tableData,
   totalPages,
   onPrevPage,
   onNextPage,
}: TablePaginationProps) {
   const hasPrev = tableData.page > 1
   const hasNext = tableData.page < totalPages

   return (
      <div className="flex items-center justify-between px-4 py-1.5 border-t border-border/40 bg-bg-secondary/30 shrink-0">
         <div className="text-[11px] text-text-muted/60 font-mono">
            Showing {(tableData.page - 1) * tableData.pageSize + 1}–
            {Math.min(tableData.page * tableData.pageSize, tableData.totalCount)} of{" "}
            {tableData.totalCount}
         </div>
         <div className="flex items-center gap-2">
            <button
               onClick={onPrevPage}
               disabled={!hasPrev}
               className={cn(
                  "h-6 w-6 rounded flex items-center justify-center transition-colors",
                  hasPrev
                     ? "text-text-muted hover:text-text-primary hover:bg-bg-quaternary"
                     : "text-text-muted/30 cursor-not-allowed"
               )}
               aria-label="Previous page"
            >
               <IconChevronLeft className="h-3 w-3" />
            </button>
            <span className="text-[11px] font-mono text-text-muted/80 min-w-[4rem] text-center tabular-nums">
               Page {tableData.page} of {totalPages || 1}
            </span>
            <button
               onClick={onNextPage}
               disabled={!hasNext}
               className={cn(
                  "h-6 w-6 rounded flex items-center justify-center transition-colors",
                  hasNext
                     ? "text-text-muted hover:text-text-primary hover:bg-bg-quaternary"
                     : "text-text-muted/30 cursor-not-allowed"
               )}
               aria-label="Next page"
            >
               <IconChevronRight className="h-3 w-3" />
            </button>
         </div>
      </div>
   )
}
