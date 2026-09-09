import { useState } from "react"
import {
   IconPlus,
   IconDatabase,
   IconServer,
   IconTrash,
   IconLoader2,
   IconCircleFilled,
   IconEdit,
   IconPlugConnected,
   IconBox,
} from "@tabler/icons-react"
import { motion, AnimatePresence } from "motion/react"
import type { DbClientConnection } from "~/stores/dbClientStore"
import { useDbClientStore } from "~/stores/dbClientStore"
import { useSettingsStore } from "~/stores/settingsStore"
import { AddConnectionDialog } from "./AddConnectionDialog"

function DbTypeIcon({ dbType, className }: { dbType: string; className?: string }) {
   if (dbType === "sqlite") return <IconDatabase className={className} />
   return <IconServer className={className} />
}

interface ConnectionItemProps {
   conn: DbClientConnection
   isSelected: boolean
   onSelect: () => void
   onDelete: () => void
   onEdit: () => void
}

function ConnectionItem({ conn, isSelected, onSelect, onDelete, onEdit }: ConnectionItemProps) {
   return (
      <motion.div
         initial={{ opacity: 0, x: -8 }}
         animate={{ opacity: 1, x: 0 }}
         exit={{ opacity: 0, x: -8 }}
         className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all border ${
            isSelected
               ? "bg-bg-tertiary border-border/60"
               : "border-transparent hover:bg-bg-tertiary/50 hover:border-border/30"
         }`}
         onClick={onSelect}
      >
         {/* Color accent bar */}
         <div
            className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full transition-opacity"
            style={{
               background: conn.color,
               opacity: isSelected ? 1 : 0.4,
            }}
         />

         {/* Icon */}
         <div
            className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ml-1"
            style={{
               background: `${conn.color}18`,
               border: `1.5px solid ${conn.color}40`,
               color: conn.color,
            }}
         >
            <DbTypeIcon dbType={conn.dbType} className="h-4 w-4" />
         </div>

         {/* Name + type */}
         <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-text-primary truncate">{conn.name}</p>
            <p className="text-[10px] text-text-muted uppercase tracking-widest font-black">{conn.dbType}</p>
         </div>

         {isSelected && (
            <IconCircleFilled className="h-1.5 w-1.5 shrink-0" style={{ color: conn.color }} />
         )}

         {/* Actions */}
         <div className="absolute right-2 top-0 bottom-0 items-center gap-1 hidden group-hover:flex">
            <button
               onClick={e => { e.stopPropagation(); onEdit() }}
               className="h-6 w-6 rounded flex items-center justify-center text-text-muted/40 hover:text-text-primary hover:bg-bg-quaternary transition-colors"
            >
               <IconEdit className="h-3 w-3" />
            </button>
            <button
               onClick={e => { e.stopPropagation(); onDelete() }}
               className="h-6 w-6 rounded flex items-center justify-center text-text-muted/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
               <IconTrash className="h-3 w-3" />
            </button>
         </div>
      </motion.div>
   )
}

export function DbClientConnectionList() {
   const {
      connections,
      selectedConnectionId,
      isLoading,
      selectConnection,
      deleteConnection,
   } = useDbClientStore()
   const setAppMode = useSettingsStore(s => s.setAppMode)

   const [showAdd, setShowAdd] = useState(false)
   const [editingConn, setEditingConn] = useState<DbClientConnection | null>(null)

   return (
      <div className="flex flex-col h-full">
         {/* Header */}
         <div className="flex items-center justify-between px-4 py-3 border-b border-border/20 shrink-0">
            <div className="flex items-center gap-2">
               <IconPlugConnected className="h-4 w-4 text-accent" />
               <span className="text-[12px] font-bold text-text-muted uppercase tracking-widest">Connections</span>
            </div>
            <button
               onClick={() => setShowAdd(true)}
               className="h-6 w-6 rounded-md flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-quaternary transition-colors"
               aria-label="Add connection"
            >
               <IconPlus className="h-3.5 w-3.5" />
            </button>
         </div>

         {/* Connection list */}
         <div className="flex-1 overflow-y-auto p-2 min-h-0">
            {isLoading ? (
               <div className="flex items-center justify-center py-8">
                  <IconLoader2 className="h-5 w-5 text-text-muted animate-spin" />
               </div>
            ) : connections.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-bg-tertiary border border-border/50 flex items-center justify-center">
                     <IconPlugConnected className="h-5 w-5 text-text-muted/60" />
                  </div>
                  <div>
                     <p className="text-[13px] font-semibold text-text-primary/80">No connections yet</p>
                     <p className="text-[11px] text-text-muted mt-0.5">Add a database connection to get started</p>
                  </div>
                  <button
                     onClick={() => setShowAdd(true)}
                     className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition-all"
                  >
                     <IconPlus className="h-3 w-3" />
                     Add Connection
                  </button>
               </div>
            ) : (
               <AnimatePresence mode="popLayout">
                  {connections.map(conn => (
                     <ConnectionItem
                        key={conn.id}
                        conn={conn}
                        isSelected={selectedConnectionId === conn.id}
                        onSelect={() => selectConnection(conn.id)}
                        onDelete={() => deleteConnection(conn.id)}
                        onEdit={() => { setEditingConn(conn); setShowAdd(true) }}
                     />
                  ))}
               </AnimatePresence>
            )}

            {connections.length > 0 && (
               <button
                  onClick={() => setShowAdd(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 mt-1 rounded-xl text-[12px] font-semibold text-text-muted/60 hover:text-text-muted border border-dashed border-border/30 hover:border-border/60 hover:bg-bg-tertiary/30 transition-all"
               >
                  <IconPlus className="h-3 w-3" />
                  Add Connection
               </button>
            )}
         </div>

         {/* Footer - Switch to Sandbox */}
         <div className="p-2 border-t border-border/20 shrink-0">
            <button
               onClick={() => setAppMode("sandbox")}
               className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-semibold text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-all group"
            >
               <IconBox className="h-4 w-4 opacity-70 group-hover:opacity-100" />
               Switch to Sandbox
            </button>
         </div>

         <AddConnectionDialog
            open={showAdd}
            onClose={() => { setShowAdd(false); setEditingConn(null) }}
            editingConnection={editingConn}
         />
      </div>
   )
}
