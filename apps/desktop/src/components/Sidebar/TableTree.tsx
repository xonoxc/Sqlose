import { cn } from "@sqlose/ui"
import { IconChevronRight, IconRefresh, IconSearch, IconTable } from "@tabler/icons-react"
import type { ColumnInfo } from "~/lib/schema"
import { TableRow } from "./TableRow"

interface TableTreeProps {
   tableColumnPreview: boolean
   search: string
   setSearch: (v: string) => void
   schemaLoading: boolean
   schemaError: string | null
   tables: string[]
   selectedEnvironmentId: string | null
   filteredTables: string[]
   activeTableId: string | null
   expandedTableIds: string[]
   keyboardFocusedIndex: number
   tableColumns: Record<string, ColumnInfo[]>
   loadingColumnIds: string[]
   tableListRef: React.RefObject<HTMLDivElement | null>
   tableTreeExpanded: boolean
   setTableTreeExpanded: (expanded: boolean) => void
   handleKeyDown: (e: React.KeyboardEvent) => void
   handleTableClick: (tableName: string) => void
   handleTableDoubleClick: (tableName: string) => void
   handleChevronClick: (e: React.MouseEvent, tableName: string) => void
   handleRefresh: () => void
}

export function TableTree({
   tableColumnPreview,
   search,
   setSearch,
   schemaLoading,
   schemaError,
   tables,
   selectedEnvironmentId,
   filteredTables,
   activeTableId,
   expandedTableIds,
   keyboardFocusedIndex,
   tableColumns,
   loadingColumnIds,
   tableListRef,
   tableTreeExpanded,
   setTableTreeExpanded,
   handleKeyDown,
   handleTableClick,
   handleTableDoubleClick,
   handleChevronClick,
   handleRefresh,
}: TableTreeProps) {
   return (
      <div className="flex-1 flex flex-col min-h-0 border-t border-border/40 mt-1">
         <div className="flex items-center justify-between px-4 py-2 group sticky top-0 bg-bg-secondary z-10">
            <button
               onClick={() => setTableTreeExpanded(!tableTreeExpanded)}
               className="flex items-center gap-1.5"
            >
               <IconChevronRight
                  className={cn(
                     "h-3 w-3 text-text-muted transition-transform",
                     tableTreeExpanded && "rotate-90"
                  )}
               />
               <span className="text-[12px] font-semibold tracking-widest uppercase text-text-muted/60">
                  Tables
               </span>
            </button>
            {tableTreeExpanded && (
               <div className="flex items-center gap-0.5">
                  <button
                     onClick={handleRefresh}
                     disabled={schemaLoading}
                     className="h-8 w-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-quaternary transition-colors disabled:opacity-40"
                     aria-label="Refresh tables"
                  >
                     <IconRefresh className={cn("h-4 w-4", schemaLoading && "animate-spin")} />
                  </button>
               </div>
            )}
         </div>

         {tableTreeExpanded && (
            <div className="flex-1 flex flex-col min-h-0 px-2">
               {/* Search */}
               <div className="pb-2 px-1">
                  <div className="flex items-center gap-2 bg-bg-tertiary rounded border border-border px-2.5 py-1.5">
                     <IconSearch className="h-3 w-3 text-text-muted shrink-0" />
                     <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search tables..."
                        className="flex-1 bg-transparent text-[12px] text-text-primary outline-none placeholder:text-text-muted/60"
                     />
                  </div>
               </div>

               {/* Table List */}
               <div
                  ref={tableListRef}
                  className="flex-1 overflow-y-auto custom-scrollbar pb-2 outline-none border-none"
                  onKeyDown={handleKeyDown}
                  tabIndex={0}
                  role="listbox"
                  aria-label="Database tables"
               >
                  {schemaLoading && tables.length === 0 && (
                     <div className="flex items-center justify-center py-6">
                        <div className="flex flex-col items-center gap-2">
                           <div className="h-3 w-3 rounded-full border-t-transparent animate-spin" />
                           <span className="text-[11px] text-text-muted">Loading tables...</span>
                        </div>
                     </div>
                  )}

                  {schemaError && !schemaLoading && (
                     <div className="mx-1 mt-2 p-2 rounded bg-error/5 border border-error/20">
                        <p className="text-[11px] text-error font-medium mb-1">
                           Failed to load schema
                        </p>
                        <p className="text-[10px] text-text-muted leading-relaxed">{schemaError}</p>
                     </div>
                  )}

                  {!schemaLoading && !schemaError && tables.length === 0 && selectedEnvironmentId && (
                     <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                        <IconTable className="h-6 w-6 text-text-muted/30 mb-1" />
                        <span className="text-[12px] text-text-muted">No tables found</span>
                     </div>
                  )}

                  {!schemaLoading && filteredTables.length === 0 && tables.length > 0 && (
                     <div className="flex items-center justify-center py-6">
                        <span className="text-[12px] text-text-muted">No matching tables</span>
                     </div>
                  )}

                  {filteredTables.map((tableName, index) => (
                     <TableRow
                        key={tableName}
                        tableName={tableName}
                        isActive={activeTableId === tableName}
                        isExpanded={expandedTableIds.includes(tableName)}
                        isFocused={keyboardFocusedIndex === index}
                        columns={tableColumns[tableName]}
                        isLoadingColumns={loadingColumnIds.includes(tableName)}
                        tableColumnPreview={tableColumnPreview}
                        handleTableClick={handleTableClick}
                        handleTableDoubleClick={handleTableDoubleClick}
                        handleChevronClick={handleChevronClick}
                     />
                  ))}
               </div>
            </div>
         )}
      </div>
   )
}
