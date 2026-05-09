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
import { IconArrowUp, IconArrowDown, IconArrowsSort, IconCopy } from "@tabler/icons-react"

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
      return Object.keys(data[0]).map((key) => ({
         id: key,
         accessorKey: key,
         header: key,
         cell: (info) => {
            const value = info.getValue()
            if (value === null) return <span className="text-text-muted italic">NULL</span>
            if (typeof value === "object") return JSON.stringify(value)
            return String(value)
         },
         enableSorting: true,
      }))
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
      <div className={cn("overflow-hidden w-full h-full relative", className)} onClick={closeCtxMenu}>
         <div ref={parentRef} className="h-full overflow-auto custom-scrollbar relative bg-[#0c0c0c]">
            <table className="w-full text-left border-collapse border-spacing-0">
               <thead className="sticky top-0 z-10">
                  {table.getHeaderGroups().map((headerGroup) => (
                     <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                           <th
                              key={header.id}
                              className={cn(
                                 "h-8 px-3 text-[11px] font-mono text-text-muted whitespace-nowrap bg-[#0c0c0c]",
                                 "border-r border-b border-[#1e1e1e] last:border-r-0",
                                 "hover:text-text-primary transition-colors",
                                 header.column.getCanSort() && "cursor-pointer select-none"
                              )}
                              onClick={header.column.getToggleSortingHandler()}
                              onContextMenu={handleHeaderContextMenu}
                           >
                              <div className="flex items-center gap-2">
                                 <span className="truncate">{flexRender(header.column.columnDef.header, header.getContext())}</span>
                                 <div className="flex items-center gap-1 text-text-muted/50">
                                    {{
                                       asc: <IconArrowUp className="h-3 w-3" />,
                                       desc: <IconArrowDown className="h-3 w-3" />,
                                    }[header.column.getIsSorted() as string] ?? <IconArrowsSort className="h-3 w-3 opacity-30" />}
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
                           className="group border-b border-[#1e1e1e]/30 hover:bg-[#111111]/60 transition-colors"
                           style={{ height: virtualRow.size }}
                           onContextMenu={(e) => handleContextMenu(e, row)}
                        >
                           {row.getVisibleCells().map((cell) => (
                              <td
                                 key={cell.id}
                                 className="px-3 py-1.5 text-[12px] text-text-primary font-mono whitespace-nowrap overflow-hidden text-ellipsis max-w-xs border-r border-[#1e1e1e]/30 last:border-r-0 cursor-pointer"
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
