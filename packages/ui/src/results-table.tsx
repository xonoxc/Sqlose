import { useMemo, useState } from "react"
import {
   useReactTable,
   getCoreRowModel,
   getSortedRowModel,
   flexRender,
   type SortingState,
   type ColumnDef,
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { cn } from "./cn"
import { IconArrowUp, IconArrowDown, IconArrowsSort } from "@tabler/icons-react"

interface ResultsTableProps<T extends Record<string, unknown>> {
   data: T[]
   maxHeight?: number
   rowHeight?: number
   className?: string
   emptyMessage?: string
}

export function ResultsTable<T extends Record<string, unknown>>({
   data,
   maxHeight = 400,
   rowHeight = 32,
   className,
   emptyMessage = "No results",
}: ResultsTableProps<T>) {
   const [sorting, setSorting] = useState<SortingState>([])

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
      data,
      columns,
      state: { sorting },
      onSortingChange: setSorting,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
   })

   const { rows } = table.getRowModel()

   const parentRef = useMemo(
      () => ({
         current: null as HTMLDivElement | null,
      }),
      []
   )

   const virtualizer = useVirtualizer({
      count: rows.length,
      getScrollElement: () => parentRef.current,
      estimateSize: () => rowHeight,
      overscan: 10,
   })

   if (data.length === 0) {
      return (
         <div className={cn("flex items-center justify-center py-8 text-sm text-text-muted", className)}>
            {emptyMessage}
         </div>
      )
   }

   return (
      <div className={cn("overflow-hidden w-full h-full", className)}>
         <div ref={parentRef} className="h-full overflow-auto custom-scrollbar relative bg-[#0c0c0c]">
            <table className="w-full text-left border-collapse border-spacing-0">
               <thead className="sticky top-0 z-10 bg-[#0c0c0c] border-b border-[#1e1e1e]">
                  {table.getHeaderGroups().map((headerGroup) => (
                     <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                           <th
                              key={header.id}
                              className={cn(
                                 "h-9 px-6 text-[12px] font-mono text-text-muted whitespace-nowrap bg-[#0c0c0c]",
                                 "border-r border-b border-[#1e1e1e] last:border-r-0",
                                 "hover:text-text-primary transition-colors",
                                 header.column.getCanSort() && "cursor-pointer select-none"
                              )}
                              onClick={header.column.getToggleSortingHandler()}
                           >
                              <div className="flex items-center justify-between gap-3">
                                 {flexRender(header.column.columnDef.header, header.getContext())}
                                 
                                 <div className="flex items-center gap-1.5 opacity-60">
                                    {/* Icon from Image, like text format # T */}
                                    <span className="text-[10px] font-mono font-bold">{header.column.id.includes('amount') || header.column.id.includes('id') || header.column.id.includes('rank') ? '#' : 'T'}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                 </div>
                              </div>
                           </th>
                        ))}
                     </tr>
                  ))}
               </thead>
               <tbody className="bg-[#0c0c0c]">
                  {virtualizer.getVirtualItems().map((virtualRow) => {
                     const row = rows[virtualRow.index]
                     return (
                        <tr
                           key={row.id}
                           className="group border-b border-[#1e1e1e]/50 hover:bg-[#111111]/80 transition-colors"
                           style={{ height: virtualRow.size }}
                        >
                           {row.getVisibleCells().map((cell) => (
                              <td key={cell.id} className="px-6 py-2.5 text-[13px] text-text-primary font-mono whitespace-nowrap overflow-hidden text-ellipsis max-w-sm border-r border-[#1e1e1e]/50 last:border-r-0">
                                 {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </td>
                           ))}
                        </tr>
                     )
                  })}
               </tbody>
            </table>
         </div>
      </div>
   )
}
