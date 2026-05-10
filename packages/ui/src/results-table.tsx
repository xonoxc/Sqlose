import { useMemo, useState, useRef, useCallback } from "react"
import {
   useReactTable,
   getCoreRowModel,
   getSortedRowModel,
   flexRender,
   type SortingState,
   type ColumnDef,
   type Row,
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { cn } from "./cn"
import { IconArrowUp, IconArrowDown, IconCopy, IconHash, IconTypography, IconBinary, IconChevronDown } from "@tabler/icons-react"

interface ResultsTableProps<T extends Record<string, unknown>> {
   data: T[]
   maxHeight?: number
   rowHeight?: number
   className?: string
   emptyMessage?: string
}

interface ContextMenuState {
   visible: boolean
   x: number
   y: number
   type: "cell" | "row" | "header"
   value?: string
   rowIndex?: number
   columnName?: string
}

async function copyToClipboard(text: string) {
   try {
      await navigator.clipboard.writeText(text)
   } catch {
      const ta = document.createElement("textarea")
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
   }
}

function formatRow(row: Record<string, unknown>, columns: string[]): string {
   return columns.map(col => {
      const v = row[col]
      return v === null ? "NULL" : String(v)
   }).join("\t")
}

function formatAllRows(rows: Record<string, unknown>[], columns: string[]): string {
   const header = columns.join("\t")
   const data = rows.map(r => formatRow(r, columns))
   return [header, ...data].join("\n")
}

export function ResultsTable<T extends Record<string, unknown>>({
   data,
   rowHeight = 28,
   className,
   emptyMessage = "No results",
}: ResultsTableProps<T>) {
   const [sorting, setSorting] = useState<SortingState>([])
   const [ctxMenu, setCtxMenu] = useState<ContextMenuState>({ visible: false, x: 0, y: 0, type: "cell" })
   const parentRef = useRef<HTMLDivElement>(null)

   const columns: ColumnDef<T>[] = useMemo(() => {
      if (data.length === 0) return []
      return Object.keys(data[0]).map((key) => {
         const firstVal = data[0][key];
         let colType = "text";
         if (typeof firstVal === "number") {
            colType = Number.isInteger(firstVal) ? "int" : "float";
         } else if (typeof firstVal === "boolean") {
            colType = "bool";
         }
         
         return {
            id: key,
            accessorKey: key,
            header: () => (
               <div className="flex items-center gap-2 w-full justify-between">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                     <span className="truncate">{key}</span>
                     {colType === "int" && <IconHash className="h-3 w-3 text-text-muted/70 shrink-0" />}
                     {colType === "float" && <IconBinary className="h-3 w-3 text-text-muted/70 shrink-0" />}
                     {colType === "text" && <IconTypography className="h-3.5 w-3.5 text-text-muted/70 shrink-0" />}
                  </div>
               </div>
            ),
            cell: (info) => {
               const value = info.getValue()
               if (value === null) return <span className="text-text-muted italic">NULL</span>
               if (typeof value === "object") return JSON.stringify(value)
               return String(value)
            },
            enableSorting: true,
         }
      })
   }, [data])

   const table = useReactTable({
      data: data as T[],
      columns,
      state: { sorting },
      onSortingChange: setSorting,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
   })

   const { rows } = table.getRowModel()

   const virtualizer = useVirtualizer({
      count: rows.length,
      getScrollElement: () => parentRef.current,
      estimateSize: () => rowHeight,
      overscan: 15,
   })

   const handleContextMenu = useCallback((e: React.MouseEvent, row?: Row<T>, colName?: string) => {
      e.preventDefault()
      if (row && colName) {
         setCtxMenu({
            visible: true, x: e.clientX, y: e.clientY, type: "cell",
            value: String(row.original[colName] ?? "NULL"),
            rowIndex: row.index, columnName: colName,
         })
      } else if (row) {
         setCtxMenu({
            visible: true, x: e.clientX, y: e.clientY, type: "row",
            rowIndex: row.index,
         })
      }
   }, [])

   const handleHeaderContextMenu = useCallback((e: React.MouseEvent) => {
      e.preventDefault()
      setCtxMenu({
         visible: true, x: e.clientX, y: e.clientY, type: "header",
      })
   }, [])

   const closeCtxMenu = useCallback(() => {
      setCtxMenu(prev => ({ ...prev, visible: false }))
   }, [])

   const columnNames = useMemo(() => {
      if (data.length === 0) return []
      return Object.keys(data[0])
   }, [data])

   if (data.length === 0) {
      return (
         <div className={cn("flex items-center justify-center py-6 text-sm text-text-muted", className)}>
            {emptyMessage}
         </div>
      )
   }

   return (
      <div className={cn("overflow-hidden w-full h-full relative border-t border-[#1e1e1e]", className)} onClick={closeCtxMenu}>
         <div ref={parentRef} className="h-full overflow-auto custom-scrollbar relative bg-bg-primary">
            <table className="text-left border-collapse border-spacing-0 w-max min-w-full">
               <thead className="sticky top-0 z-10 bg-bg-primary">
                  {table.getHeaderGroups().map((headerGroup) => (
                     <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                              <th
                                 key={header.id}
                                 className={cn(
                                    "h-8 px-3 text-[11px] font-sans font-medium text-text-secondary whitespace-nowrap bg-bg-primary",
                                    "border-r border-b border-[#1e1e1e] last:border-r-0",
                                    "hover:text-text-primary transition-colors",
                                    header.column.getCanSort() && "cursor-pointer select-none"
                                 )}
                                 onClick={header.column.getToggleSortingHandler()}
                                 onContextMenu={handleHeaderContextMenu}
                              >
                                 <div className="flex items-center gap-2">
                                    <div className="flex-1 min-w-0">
                                       {flexRender(header.column.columnDef.header, header.getContext())}
                                    </div>
                                    <div className="flex items-center gap-1 opacity-50 shrink-0">
                                       {{
                                          asc: <IconArrowUp className="h-3 w-3" />,
                                          desc: <IconArrowDown className="h-3 w-3" />,
                                       }[header.column.getIsSorted() as string] ?? <IconChevronDown className="h-3 w-3" />}
                                    </div>
                                 </div>
                              </th>
                        ))}
                     </tr>
                  ))}
               </thead>
               <tbody>
                  {virtualizer.getVirtualItems().map((virtualRow) => {
                     const row = rows[virtualRow.index]
                     return (
                        <tr
                           key={row.id}
                           className="group hover:bg-bg-quaternary/40 transition-colors"
                           style={{ height: virtualRow.size }}
                           onContextMenu={(e) => handleContextMenu(e, row)}
                        >
                           {row.getVisibleCells().map((cell) => (
                              <td
                                 key={cell.id}
                                 className="px-3 py-1.5 text-[12px] text-text-primary font-sans tabular-nums whitespace-nowrap overflow-hidden text-ellipsis max-w-xs border-r border-b border-[#1e1e1e]/50 last:border-r-0 cursor-pointer"
                                 onClick={() => {
                                    const val = cell.getValue()
                                    copyToClipboard(val === null ? "NULL" : String(val))
                                 }}
                                 onContextMenu={(e) => {
                                    e.stopPropagation()
                                    const val = cell.getValue()
                                    setCtxMenu({
                                       visible: true, x: e.clientX, y: e.clientY, type: "cell",
                                       value: val === null ? "NULL" : String(val),
                                       rowIndex: row.index,
                                       columnName: cell.column.id,
                                    })
                                    e.preventDefault()
                                 }}
                                 title="Click to copy"
                              >
                                 {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </td>
                           ))}
                        </tr>
                     )
                  })}
               </tbody>
            </table>
         </div>

         {/* Context Menu */}
         {ctxMenu.visible && (
            <div
               className="fixed z-50 min-w-[160px] bg-[#141414] border border-[#333] rounded-lg shadow-2xl py-1 overflow-hidden"
               style={{ left: ctxMenu.x, top: ctxMenu.y }}
               onClick={(e) => e.stopPropagation()}
            >
               {ctxMenu.type === "cell" && (
                  <>
                     <button
                        className="flex items-center gap-2 w-full px-3 py-1.5 text-[12px] text-text-primary hover:bg-bg-quaternary transition-colors text-left"
                        onClick={() => { copyToClipboard(ctxMenu.value ?? ""); closeCtxMenu() }}
                     >
                        <IconCopy className="h-3.5 w-3.5" />
                        Copy Cell
                     </button>
                     <button
                        className="flex items-center gap-2 w-full px-3 py-1.5 text-[12px] text-text-primary hover:bg-bg-quaternary transition-colors text-left"
                        onClick={() => {
                           if (ctxMenu.rowIndex !== undefined && rows[ctxMenu.rowIndex]) {
                              const rowData = rows[ctxMenu.rowIndex].original as Record<string, unknown>
                              copyToClipboard(formatRow(rowData, columnNames))
                           }
                           closeCtxMenu()
                        }}
                     >
                        <IconCopy className="h-3.5 w-3.5" />
                        Copy Row
                     </button>
                  </>
               )}
               {ctxMenu.type === "row" && (
                  <>
                     <button
                        className="flex items-center gap-2 w-full px-3 py-1.5 text-[12px] text-text-primary hover:bg-bg-quaternary transition-colors text-left"
                        onClick={() => {
                           if (ctxMenu.rowIndex !== undefined && rows[ctxMenu.rowIndex]) {
                              const rowData = rows[ctxMenu.rowIndex].original as Record<string, unknown>
                              copyToClipboard(formatRow(rowData, columnNames))
                           }
                           closeCtxMenu()
                        }}
                     >
                        <IconCopy className="h-3.5 w-3.5" />
                        Copy Row
                     </button>
                  </>
               )}
               <div className="border-t border-[#222] my-1" />
               <button
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-[12px] text-text-primary hover:bg-bg-quaternary transition-colors text-left"
                  onClick={() => { copyToClipboard(formatAllRows(data as Record<string, unknown>[], columnNames)); closeCtxMenu() }}
               >
                  <IconCopy className="h-3.5 w-3.5" />
                  Copy All ({data.length} rows)
               </button>
               <button
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-[12px] text-text-primary hover:bg-bg-quaternary transition-colors text-left"
                  onClick={() => {
                     const header = columnNames.join("\t")
                     const full = [header, ...data.map(r => formatRow(r as Record<string, unknown>, columnNames))].join("\n")
                     copyToClipboard(full)
                     closeCtxMenu()
                  }}
               >
                  <IconCopy className="h-3.5 w-3.5" />
                  Copy All With Headers
               </button>
            </div>
         )}
      </div>
   )
}
