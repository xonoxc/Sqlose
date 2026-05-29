import { IconDatabase, IconPlus, IconServer, IconCircleFilled } from "@tabler/icons-react"
import { motion, AnimatePresence } from "motion/react"
import { useDashboardState } from "../hooks/useDashboardState"
import { CreateDatabaseFlow } from "./CreateDatabaseFlow"
import { cn } from "@sqlose/ui"

export function Dashboard() {
   const { showCreateFlow, setShowCreateFlow, environments, handleSelectEnv } = useDashboardState()

   return (
      <div className="flex h-full w-full flex-col bg-bg-primary text-text-primary items-center justify-center p-6 overflow-hidden">
         <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-[400px] flex flex-col items-center"
         >
            {/* Branding / Logo */}
            <div className="flex flex-col items-center mb-16">
               <div className="h-14 w-14 rounded-2xl bg-bg-secondary border border-border shadow-[0_0_40px_rgba(var(--color-accent),0.1)] flex items-center justify-center mb-6">
                  <IconDatabase className="h-7 w-7 text-accent" />
               </div>
               <h1 className="text-2xl font-bold tracking-tight text-text-primary uppercase tracking-[0.2em] mb-2">SQLOSE</h1>
               <p className="text-[13px] text-text-muted font-medium">Select a database instance to begin</p>
            </div>

            {/* Environments List */}
            <div className="w-full space-y-3">
               <AnimatePresence mode="popLayout" initial={false}>
                  {environments.length > 0 ? (
                     environments.map((env, i) => (
                        <motion.button
                           key={env.id}
                           initial={{ opacity: 0, y: 5 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: i * 0.05 }}
                           onClick={() => handleSelectEnv(env.id)}
                           className="w-full flex items-center justify-between p-4 rounded-xl bg-bg-secondary border border-border hover:bg-bg-tertiary hover:border-accent/40 transition-all group overflow-hidden"
                        >
                           <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-lg bg-bg-primary border border-border flex items-center justify-center group-hover:bg-accent/10 group-hover:border-accent/30 transition-all">
                                 {env.dbType === "sqlite" ? (
                                    <IconDatabase className="h-5 w-5 text-accent/80 group-hover:text-accent" />
                                 ) : (
                                    <IconServer className="h-5 w-5 text-accent/80 group-hover:text-accent" />
                                 )}
                              </div>
                              <div className="flex flex-col items-start translate-y-[-1px]">
                                 <span className="text-[14px] font-bold text-text-primary group-hover:text-accent transition-colors truncate max-w-[180px]">
                                    {env.name || `${env.dbType} Sandbox`}
                                 </span>
                                 <span className="text-[10px] text-text-muted uppercase tracking-widest font-black">
                                    {env.dbType}
                                 </span>
                              </div>
                           </div>

                           <div className="flex items-center gap-2">
                              {env.status === "running" && (
                                 <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20">
                                    <IconCircleFilled className="h-1.5 w-1.5 text-accent animate-pulse" />
                                    <span className="text-[10px] font-bold text-accent uppercase tracking-wider">ACTIVE</span>
                                 </div>
                              )}
                              {env.status !== "running" && (
                                 <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider px-2">OFFLINE</span>
                              )}
                           </div>
                        </motion.button>
                     ) )
                  ) : (
                     <div className="text-center py-12 px-6 rounded-2xl border border-dashed border-border bg-bg-secondary/30">
                        <p className="text-[13px] text-text-muted">No databases found.</p>
                     </div>
                  )}
               </AnimatePresence>

               {/* Create Action */}
               <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  onClick={() => setShowCreateFlow(true)}
                  className="w-full h-12 flex items-center justify-center gap-2.5 mt-8 rounded-xl bg-transparent border border-border text-[13px] font-bold text-text-muted hover:text-accent hover:border-accent/30 hover:bg-accent/5 transition-all"
               >
                  <IconPlus className="h-4 w-4" />
                  <span>Create Workspace</span>
               </motion.button>
            </div>
         </motion.div>

         {showCreateFlow && <CreateDatabaseFlow onClose={() => setShowCreateFlow(false)} />}
      </div>
   )
}
