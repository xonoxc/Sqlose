import { IconPlus, IconLoader2 } from "@tabler/icons-react"
import { motion, AnimatePresence } from "motion/react"
import type { Environment } from "@sqlose/shared"
import { EnvironmentCard } from "./EnvironmentCard"

interface EnvironmentListProps {
   environments: Environment[]
   isLoading: boolean
   onSelect: (id: string) => void
   onDestroy: (e: React.MouseEvent, id: string) => void
   onCreate: () => void
}

export function EnvironmentList({
   environments,
   isLoading,
   onSelect,
   onDestroy,
   onCreate,
}: EnvironmentListProps) {
   return (
      <div className="w-full space-y-3">
         <AnimatePresence mode="popLayout" initial={false}>
            {environments.length > 0 ? (
               environments.map((env, i) => (
                  <EnvironmentCard
                     key={env.id}
                     env={env}
                     index={i}
                     onSelect={onSelect}
                     onDestroy={onDestroy}
                  />
               ))
            ) : isLoading ? (
               <div className="flex items-center justify-center">
                  <IconLoader2 className="h-5 w-5 text-white/60 animate-spin" />
               </div>
            ) : (
               <div className="text-center py-12 px-6">
                  <p className="text-[13px] text-white/60">No databases found.</p>
               </div>
            )}
         </AnimatePresence>

         <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            onClick={onCreate}
            className="w-full h-12 flex items-center justify-center gap-2.5 mt-8 rounded-xl bg-transparent border border-border/60 text-[13px] font-bold text-text-muted hover:text-white hover:border-accent/30 hover:bg-accent/5 transition-all outline-none"
         >
            <IconPlus className="h-4 w-4" />
            <span>Create Workspace</span>
         </motion.button>
      </div>
   )
}
