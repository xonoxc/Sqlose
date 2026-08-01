import { cn } from "@sqlose/ui"
import {
   IconRefresh,
   IconPlus,
   IconFilter,
   IconDownload,
   IconTable,
} from "@tabler/icons-react"
import type { TableDataState } from "~/stores/databaseStore"
import type { ColumnInfo } from "~/lib/schema"

interface TableToolbarProps {
   displayTableName: string
   schemaColumns?: ColumnInfo[]
   tableData: TableDataState | null
   tableDataLoading: boolean
   onRefresh: () => void
}

export function TableToolbar({
   displayTableName,
   schemaColumns,
   tableData,
   tableDataLoading,
   onRefresh,
}: TableToolbarProps) {
   return (
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-bg-secondary/50 shrink-0">
         <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-text-primary">
               <IconTable className="h-4 w-4 text-accent" />
               <span className="text-[14px] font-semibold">{displayTableName}</span>
            </div>
            {schemaColumns && (
               <span className="text-[11px] text-text-muted/60 font-mono bg-bg-tertiary px-1.5 py-0.5 rounded">
                  {schemaColumns.length} column{schemaColumns.length !== 1 ? "s" : ""}
               </span>
            )}
            {tableData && (
               <span className="text-[11px] text-text-muted/60 font-mono">
                  {tableData.totalCount} row{tableData.totalCount !== 1 ? "s" : ""}
               </span>
            )}
         </div>

         <div className="flex items-center gap-1">
            <ToolbarButton onClick={onRefresh} disabled={tableDataLoading} title="Refresh data">
               <IconRefresh className={cn("h-3.5 w-3.5", tableDataLoading && "animate-spin")} />
            </ToolbarButton>
            <ToolbarButton disabled title="Insert row (coming soon)">
               <IconPlus className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton disabled title="Filter (coming soon)">
               <IconFilter className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton disabled title="Export (coming soon)">
               <IconDownload className="h-3.5 w-3.5" />
            </ToolbarButton>
         </div>
      </div>
   )
}

function ToolbarButton({
   children,
   onClick,
   disabled,
   title,
}: {
   children: React.ReactNode
   onClick?: () => void
   disabled?: boolean
   title?: string
}) {
   return (
      <button
         onClick={onClick}
         disabled={disabled}
         title={title}
         className={cn(
            "h-7 w-7 rounded flex items-center justify-center transition-colors",
            disabled
               ? "text-text-muted/30 cursor-not-allowed"
               : "text-text-muted hover:text-text-primary hover:bg-bg-quaternary"
         )}
      >
         {children}
      </button>
   )
}
