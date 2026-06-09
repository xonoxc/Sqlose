import { IconDatabase, IconPlus, IconServer, IconCircleFilled } from "@tabler/icons-react"
import { motion, AnimatePresence } from "motion/react"
import { useDashboardState } from "~/hooks/useDashboardState"
import { CreateDatabaseFlow } from "~/components/CreateDatabaseFlow"

export function Dashboard() {
   const { showCreateFlow, setShowCreateFlow, environments, handleSelectEnv } = useDashboardState()

   const slideVariants = {
      initial: (direction: number) => ({
         x: direction > 0 ? "100%" : "-100%",
         opacity: 0,
      }),
      enter: {
         x: 0,
         opacity: 1,
         transition: {
            duration: 0.5,
            ease: [0.25, 1, 0.5, 1] as const,
         },
      },
      exit: (direction: number) => ({
         x: direction < 0 ? "100%" : "-100%",
         opacity: 0,
         transition: {
            duration: 0.4,
            ease: [0.25, 1, 0.5, 1] as const,
         },
      }),
   }

   return (
      <div className="flex h-full w-full bg-bg-primary text-text-primary items-center justify-center p-6 overflow-hidden relative">
         <AnimatePresence mode="wait" initial={false} custom={showCreateFlow ? 1 : -1}>
            {!showCreateFlow ? (
               <motion.div
                  key="dashboard-main"
                  custom={-1}
                  variants={slideVariants}
                  initial="initial"
                  animate="enter"
                  exit="exit"
                  className="w-full max-w-[400px] flex flex-col items-center shrink-0"
               >
                  {/* Branding / Logo */}
                  <div className="flex flex-col items-center mb-16">
                     <div className="h-16 w-16 rounded-[1.5rem] bg-bg-tertiary border border-border/80 shadow-[0_0_60px_rgba(var(--color-accent),0.2)] flex items-center justify-center mb-6 relative">
                        <div className="absolute inset-0 bg-accent/5 rounded-[1.5rem]" />
                        <IconDatabase className="h-8 w-8 text-text-primary relative z-10" />
                     </div>
                     <h1 className="text-2xl font-bold tracking-tight text-white uppercase tracking-[0.25em] mb-2 leading-none text-center">
                        SQLOSE
                     </h1>
                     <p className="text-[13px] text-text-muted font-medium opacity-70 text-center">
                        Select a database instance to begin
                     </p>
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
                                 className="w-full flex items-center justify-between p-4 rounded-[1.25rem] bg-bg-secondary/60 border border-border/60 hover:bg-bg-tertiary hover:border-accent/40 transition-all group overflow-hidden"
                              >
                                 <div className="flex items-center gap-4 text-left">
                                    <div className="h-10 w-10 rounded-xl bg-bg-tertiary border border-border flex items-center justify-center transition-all group-hover:border-accent/30 group-hover:bg-accent/5">
                                       {env.dbType === "sqlite" ? (
                                          <IconDatabase className="h-5 w-5 text-text-primary opacity-90 group-hover:text-accent group-hover:opacity-100 transition-all" />
                                       ) : (
                                          <IconServer className="h-5 w-5 text-text-primary opacity-90 group-hover:text-accent group-hover:opacity-100 transition-all" />
                                       )}
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

                                 <div className="flex items-center gap-2">
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
                                 </div>
                              </motion.button>
                           ))
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
                        transition={{ delay: 0.1 }}
                        onClick={() => setShowCreateFlow(true)}
                        className="w-full h-12 flex items-center justify-center gap-2.5 mt-8 rounded-xl bg-transparent border border-border/60 text-[13px] font-bold text-text-muted hover:text-white hover:border-accent/30 hover:bg-accent/5 transition-all outline-none"
                     >
                        <IconPlus className="h-4 w-4" />
                        <span>Create Workspace</span>
                     </motion.button>
                  </div>
               </motion.div>
            ) : (
               <motion.div
                  key="creation-flow"
                  custom={1}
                  variants={slideVariants}
                  initial="initial"
                  animate="enter"
                  exit="exit"
                  className="w-full h-full flex flex-col items-center justify-center shrink-0"
               >
                  <CreateDatabaseFlow onClose={() => setShowCreateFlow(false)} />
               </motion.div>
            )}
         </AnimatePresence>
      </div>
   )
}
