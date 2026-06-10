import { Handle, Position } from "@xyflow/react"
import { IconKey, IconTable, IconLink } from "@tabler/icons-react"
import type { ColumnInfo } from "~/lib/schema"
import { useThemeStore } from "~/stores/theme-store"

interface TableNodeData {
   label: string
   columns: ColumnInfo[]
}

export function TableNode({ data }: { data: TableNodeData }) {
   const { currentTheme } = useThemeStore()
   return (
      <div
         className="w-72 rounded-[8px] shadow-[0_8px_30px_rgb(0,0,0,0.4)] transition-all duration-300 font-sans border flex flex-col group animate-in fade-in zoom-in-95 relative overflow-hidden"
         style={{
            backgroundColor: currentTheme.colors.surface,
            borderColor: currentTheme.colors.border,
         }}
      >
         {/* Subtle Glow Overlay on Hover */}
         <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none duration-500 z-10"
            style={{
               boxShadow: `inset 0 0 20px ${currentTheme.colors.accent}10, 0 0 0 1px ${currentTheme.colors.accent}20`,
            }}
         />

         {/* Header */}
         <div
            className="px-4 py-3 flex items-center justify-between border-b relative z-20"
            style={{
               backgroundColor: currentTheme.colors.surface2,
               borderColor: currentTheme.colors.border,
            }}
         >
            <div className="flex items-center gap-2">
               <IconTable
                  className="h-4 w-4 opacity-70"
                  style={{ color: currentTheme.colors.text }}
               />
               <span
                  className="font-semibold text-[14px] tracking-wide"
                  style={{ color: currentTheme.colors.text, opacity: 0.9 }}
               >
                  {data.label}
               </span>
            </div>
         </div>

         {/* Columns */}
         <div className="flex flex-col py-2 px-1 relative z-20 bg-transparent">
            {data.columns.map(col => (
               <div
                  key={col.name}
                  className="flex items-center justify-between px-3 py-1.5 relative rounded-md mx-1 transition-colors"
                  style={{ backgroundColor: "transparent" }}
                  onMouseEnter={e =>
                     (e.currentTarget.style.backgroundColor = currentTheme.colors.surface2)
                  }
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
               >
                  <Handle
                     type="target"
                     position={Position.Left}
                     id={`target-${col.name}`}
                     className="w-1.5 h-3 rounded-sm opacity-0 hover:opacity-100 transition-opacity"
                     style={{
                        backgroundColor: currentTheme.colors.text,
                        border: "none",
                        left: -5,
                        right: "auto",
                     }}
                  />

                  <div className="flex items-center gap-2 min-w-0 flex-1">
                     {col.primaryKey ? (
                        <IconKey
                           className="h-3 w-3 shrink-0"
                           style={{ color: currentTheme.colors.warning, opacity: 0.8 }}
                        />
                     ) : col.name.endsWith("_id") || col.name.includes("id_") ? (
                        <IconLink
                           className="h-3 w-3 shrink-0"
                           style={{ color: currentTheme.colors.textMuted, opacity: 0.6 }}
                        />
                     ) : (
                        <div className="h-3 w-3 shrink-0 flex items-center justify-center" />
                     )}
                     <span
                        className="text-[12.5px] truncate"
                        style={{
                           color: currentTheme.colors.text,
                           fontWeight: col.primaryKey ? 500 : 400,
                           opacity: col.primaryKey ? 0.9 : 0.8,
                        }}
                     >
                        {col.name}
                     </span>
                  </div>
                  <span
                     className="text-[11px] uppercase tracking-wider truncate ml-3 shrink-0"
                     style={{ color: currentTheme.colors.textMuted, opacity: 0.4 }}
                  >
                     {col.type}
                  </span>

                  <Handle
                     type="source"
                     position={Position.Right}
                     id={`source-${col.name}`}
                     className="w-1.5 h-3 rounded-sm opacity-0 hover:opacity-100 transition-opacity"
                     style={{
                        backgroundColor: currentTheme.colors.text,
                        border: "none",
                        right: -5,
                        left: "auto",
                     }}
                  />
               </div>
            ))}
         </div>
      </div>
   )
}
