import { IconDatabase, IconServer, IconCircleFilled, IconTrash } from "@tabler/icons-react"
import { motion } from "motion/react"
import type { ComponentType } from "react"
import type { DBType, Environment } from "@sqlose/shared"

const DB_TYPE_ICONS: Record<DBType, ComponentType<{ className?: string }>> = {
   sqlite: IconDatabase,
   postgres: IconServer,
   mysql: IconServer,
}

interface EnvironmentCardProps {
   env: Environment
   index: number
   onSelect: (id: string) => void
   onDestroy: (e: React.MouseEvent, id: string) => void
}

export function EnvironmentCard({ env, index, onSelect, onDestroy }: EnvironmentCardProps) {
   const DbIcon = DB_TYPE_ICONS[env.dbType]

   return (
      <motion.button
         key={env.id}
         initial={{ opacity: 0, y: 5 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: index * 0.05 }}
         onClick={() => onSelect(env.id)}
         className="w-full flex items-center justify-between p-4 rounded-[1.25rem] bg-bg-secondary/60 border border-border/60 hover:bg-bg-tertiary hover:border-accent/40 transition-all group overflow-hidden"
      >
         <div className="flex items-center gap-4 text-left">
            <div className="h-10 w-10 rounded-xl bg-bg-tertiary border border-border flex items-center justify-center">
               <DbIcon className="h-5 w-5 text-text-primary" />
            </div>
            <div className="flex flex-col items-start translate-y-[-1px]">
               <span className="text-[14px] font-bold text-text-primary group-hover:text-white transition-colors truncate max-w-[180px]">
                  {env.name || `${env.dbType} Sandbox`}
               </span>
               <span className="text-[10px] text-text-muted uppercase tracking-widest font-black">
                  {env.dbType}
               </span>
            </div>
         </div>

         <div className="flex items-center gap-1">
            {env.status === "running" ? (
               <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-accent/20 border border-accent/30 transition-all">
                  <IconCircleFilled className="h-1.5 w-1.5 text-white animate-pulse" />
                  <span className="text-[11px] font-black text-white uppercase tracking-wider">
                     Active
                  </span>
               </div>
            ) : (
               <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-bg-tertiary border border-border/50">
                  <IconCircleFilled className="h-1.5 w-1.5 text-text-muted/60" />
                  <span className="text-[11px] font-bold text-text-muted/80 uppercase tracking-wider">
                     Offline
                  </span>
               </div>
            )}
            <button
               onClick={e => onDestroy(e, env.id)}
               className="ml-1 h-9 w-9 flex items-center justify-center rounded-lg text-text-muted/30 group-hover:text-text-muted/80 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
               <IconTrash className="h-4 w-4" />
            </button>
         </div>
      </motion.button>
   )
}
