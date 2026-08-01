import { cn } from "@sqlose/ui"
import { IconChevronRight, IconTable, IconKey, IconCircleDot } from "@tabler/icons-react"
import type { ColumnInfo } from "~/lib/schema"

interface TableRowProps {
   tableName: string
   isActive: boolean
   isExpanded: boolean
   isFocused: boolean
   columns: ColumnInfo[] | undefined
   isLoadingColumns: boolean
   tableColumnPreview: boolean
   handleTableClick: (tableName: string) => void
   handleTableDoubleClick: (tableName: string) => void
   handleChevronClick: (e: React.MouseEvent, tableName: string) => void
}

export function TableRow({
   tableName,
   isActive,
   isExpanded,
   isFocused,
   columns,
   isLoadingColumns,
   tableColumnPreview,
   handleTableClick,
   handleTableDoubleClick,
   handleChevronClick,
}: TableRowProps) {
   return (
      <div>
         <div
            role="option"
            aria-selected={isActive}
            className={cn(
               "flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] font-medium transition-all duration-150 outline-none cursor-pointer group",
               isActive
                  ? "bg-white/10 text-white border-l-[2.5px]"
                  : "text-white/65 hover:text-white hover:bg-bg-quaternary/30 border-l-[2.5px] border-transparent",
               isFocused && "ring-1 ring-accent/40"
            )}
            onClick={() => handleTableClick(tableName)}
            onDoubleClick={() => handleTableDoubleClick(tableName)}
         >
            {tableColumnPreview && (
               <button
                  onClick={e => handleChevronClick(e, tableName)}
                  className={cn(
                     "h-4 w-4 rounded flex items-center justify-center shrink-0 transition-colors",
                     "hover:bg-bg-quaternary/60 hover:text-text-primary",
                     isExpanded && "text-white"
                  )}
                  aria-label={isExpanded ? "Collapse columns" : "Expand columns"}
                  tabIndex={-1}
               >
                  <IconChevronRight
                     className={cn(
                        "h-2.5 w-2.5 transition-transform duration-160 ease-out",
                        isExpanded && "rotate-90"
                     )}
                  />
               </button>
            )}

            <IconTable
               className={cn("h-3.5 w-3.5 shrink-0 opacity-70", isActive && "opacity-100")}
            />
            <span className="truncate flex-1 text-left">{tableName}</span>

            {columns && (
               <span className="text-[10px] text-text-muted/50 font-mono shrink-0">
                  {columns.length}
               </span>
            )}
            {isLoadingColumns && (
               <div className="h-2.5 w-2.5 rounded-full border-[1.5px] border-accent border-t-transparent animate-spin shrink-0" />
            )}
         </div>

         {tableColumnPreview && isExpanded && (
            <div className="overflow-hidden transition-all duration-200 ease-out">
               {isLoadingColumns && !columns && (
                  <div className="flex items-center gap-2 pl-6 py-1.5">
                     <div className="h-2 w-2 rounded-full border-[1.5px] border-accent border-t-transparent animate-spin" />
                     <span className="text-[10px] text-text-muted">Loading...</span>
                  </div>
               )}
               {columns && columns.length === 0 && !isLoadingColumns && (
                  <div className="py-1 pl-6 pr-2 text-[10px] text-text-muted italic">
                     No columns
                  </div>
               )}
               {columns && columns.length > 0 && (
                  <div className="ml-3 border-l border-border/50 pl-2 pb-1 space-y-[1px]">
                     {columns.map(col => (
                        <div
                           key={col.name}
                           className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-bg-quaternary/20 transition-colors group/col"
                        >
                           {col.primaryKey ? (
                              <IconKey className="h-2.5 w-2.5 shrink-0 text-amber-400" />
                           ) : (
                              <IconCircleDot className="h-2 w-2 shrink-0 text-text-muted/30" />
                           )}
                           <span className="text-[12px] font-mono text-text-primary truncate">
                              {col.name}
                           </span>
                           <span className="text-[9px] font-mono text-text-muted/50 truncate ml-auto">
                              {col.type}
                           </span>
                           <span
                              className={cn(
                                 "text-[8px] font-mono px-1 rounded shrink-0 leading-none py-[2px]",
                                 col.nullable
                                    ? "text-text-muted/40 bg-bg-tertiary/50"
                                    : "text-error/50 bg-error/5"
                              )}
                           >
                              {col.nullable ? "NULL" : "NN"}
                           </span>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         )}
      </div>
   )
}
