import { Handle, Position } from "@xyflow/react"
import { cn } from "@sqlose/ui"
import { IconKey } from "@tabler/icons-react"
import type { ColumnInfo } from "../../lib/schema"
import { useThemeStore } from "../../stores/theme-store"

interface TableNodeData {
   label: string
   columns: ColumnInfo[]
}

export function TableNode({ data }: { data: TableNodeData }) {
   const { currentTheme } = useThemeStore()
   return (
      <div 
         className="w-64 rounded-lg shadow-2xl border overflow-hidden font-sans"
         style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border }}
      >
         <div 
            className="px-3 py-1.5 flex items-center justify-between opacity-90"
            style={{ backgroundColor: currentTheme.colors.accent }}
         >
            <span 
               className="font-bold text-[13px] tracking-wide"
               style={{ color: currentTheme.colors.background }}
            >
               {data.label}
            </span>
         </div>
         <div className="flex flex-col py-1">
            {data.columns.map(col => (
               <div
                  key={col.name}
                  className="flex items-center justify-between px-3 py-1 relative group"
                  style={{ backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = currentTheme.colors.surface2}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
               >
                  <div className="flex items-center gap-1.5 min-w-0">
                     {col.primaryKey && (
                        <IconKey className="h-3 w-3 text-yellow-500 shrink-0 opacity-80" />
                     )}
                     <span
                        className="text-[12px] truncate"
                        style={{ color: col.primaryKey ? currentTheme.colors.text : currentTheme.colors.secondary, fontWeight: col.primaryKey ? 500 : 400 }}
                     >
                        {col.name}
                     </span>
                  </div>
                  <span 
                     className="text-[10px] uppercase font-mono tracking-wider truncate ml-2"
                     style={{ color: currentTheme.colors.textMuted, opacity: 0.6 }}
                  >
                     {col.type}
                  </span>
                  
                  {/* We can place handles dynamically for each column if needed, or just let ReactFlow draw edges to the node itself.
                      In this design, we will just have a top/bottom handle or left/right for the entire Node for simplicity,
                      but letting each column have a handle is cooler. We'll stick to full node for now to keep it clean. */}
               </div>
            ))}
         </div>
         <Handle type="target" position={Position.Top} className="w-2 h-2 border-none opacity-50" style={{ backgroundColor: currentTheme.colors.accent }} />
         <Handle type="source" position={Position.Bottom} className="w-2 h-2 border-none opacity-50" style={{ backgroundColor: currentTheme.colors.accent }} />
      </div>
   )
}
