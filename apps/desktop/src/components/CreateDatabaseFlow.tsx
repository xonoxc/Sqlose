import {
   IconDatabase,
   IconServer,
   IconCheck,
   IconLoader2,
   IconCircleCheck,
   IconX,
   IconArrowRight,
   IconDatabaseImport,
   IconPlus,
} from "@tabler/icons-react"
import { Button, Input, Badge, cn } from "@sqlose/ui"
import type { DBType } from "@sqlose/shared"
import { useCreateDatabaseFlowLogic } from "../hooks/useCreateDatabaseFlowLogic"
import { motion, AnimatePresence } from "motion/react"

const DB_CARDS: {
   type: DBType
   label: string
   description: string
   icon: typeof IconDatabase | typeof IconServer
   accent: string
   color: string
}[] = [
   {
      type: "sqlite",
      label: "SQLite",
      description: "Lightweight embedded database with zero configuration. Perfect for local dev.",
      icon: IconDatabase,
      accent: "from-teal-500/20 to-teal-400/5",
      color: "text-teal-400",
   },
   {
      type: "postgres",
      label: "PostgreSQL",
      description: "Advanced relational database with record-breaking compliance and features.",
      icon: IconServer,
      accent: "from-blue-500/20 to-blue-400/5",
      color: "text-blue-400",
   },
   {
      type: "mysql",
      label: "MySQL",
      description: "Reliable and fast relational database, extensively used in web apps.",
      icon: IconServer,
      accent: "from-orange-500/20 to-orange-400/5",
      color: "text-orange-400",
   },
]

const CATEGORY_COLORS: Record<string, "default" | "secondary" | "warning" | "success"> = {
   ecommerce: "success",
   analytics: "default",
   social: "warning",
   finance: "secondary",
}

export function CreateDatabaseFlow({ onClose }: { onClose: () => void }) {
   const {
      step,
      selectedDbType,
      selectedDataset,
      setSelectedDataset,
      dbName,
      setDbName,
      provisioningSteps,
      provisioningError,
      datasets,
      datasetsLoading,
      creating,
      allDone,
      handleSelectType,
      handleCreate,
      setStep,
   } = useCreateDatabaseFlowLogic(onClose)

   const containerVariants = {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.25, 0, 0, 1] } },
      exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
   }

   const cardVariants = {
      initial: { opacity: 0, x: -10 },
      animate: (i: number) => ({
         opacity: 1,
         x: 0,
         transition: { delay: i * 0.05, duration: 0.3 }
      }),
   }

   if (step === "provisioning") {
      return (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/60 backdrop-blur-xl"
               onClick={allDone ? onClose : undefined}
            />
            <motion.div
               variants={containerVariants}
               initial="initial"
               animate="animate"
               exit="exit"
               className="bg-bg-primary border border-white/10 rounded-[2.5rem] p-12 max-w-md w-full relative z-10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] overflow-hidden"
            >
               {/* Glowing success light */}
               {allDone && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-accent/20 blur-[60px] pointer-events-none rounded-full" />
               )}

               <div className="flex flex-col items-center gap-10 relative z-10">
                  <div className="relative">
                     <div className={cn(
                        "h-24 w-24 rounded-[2rem] border border-white/5 flex items-center justify-center transition-all duration-500",
                        allDone ? "bg-accent/10 border-accent/20 shadow-[0_0_40px_rgba(var(--color-accent),0.15)]" : "bg-bg-secondary"
                     )}>
                        {allDone ? (
                           <IconCircleCheck className="h-10 w-10 text-accent" />
                        ) : provisioningError ? (
                           <IconX className="h-10 w-10 text-error" />
                        ) : (
                           <IconLoader2 className="h-10 w-10 text-accent animate-spin" />
                        )}
                     </div>
                  </div>

                  <div className="text-center space-y-2">
                     <h2 className="text-3xl font-bold text-white tracking-tight">
                        {provisioningError ? "Setup Halted" : allDone ? "Project Ready" : "Initializing..."}
                     </h2>
                     <p className="text-base text-text-muted font-light leading-relaxed px-4">
                        {provisioningError
                           ? "We encountered an error while provisioning your database container."
                           : allDone
                              ? "Environment is active and ready for commands."
                              : "Provisioning isolated workspace container..."}
                     </p>
                  </div>

                  <div className="w-full space-y-2.5">
                     {provisioningSteps.map(ps => (
                        <div
                           key={ps.id}
                           className={cn(
                              "flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[13px] font-medium transition-all duration-300",
                              ps.status === "in-progress"
                                 ? "bg-accent/10 border border-accent/20 text-white"
                                 : ps.status === "done"
                                   ? "bg-white/[0.03] border border-white/5 text-text-muted/80"
                                   : ps.status === "error"
                                     ? "bg-error/10 border border-error/20 text-error"
                                      : "bg-transparent opacity-30 border border-transparent"
                           )}
                        >
                           {ps.status === "done" ? (
                              <IconCheck className="h-4 w-4 text-accent shrink-0" />
                           ) : ps.status === "in-progress" ? (
                              <IconLoader2 className="h-4 w-4 text-accent animate-spin shrink-0" />
                           ) : ps.status === "error" ? (
                              <IconX className="h-4 w-4 text-error shrink-0" />
                           ) : (
                              <div className="h-4 w-4 rounded-full border border-dashed border-white/20 shrink-0" />
                           )}
                           <span className="flex-1">{ps.label}</span>
                           {ps.message && (
                              <span className="text-[11px] opacity-60 font-mono">
                                 {ps.message}
                              </span>
                           )}
                        </div>
                     ))}
                  </div>

                  {provisioningError && (
                     <Button variant="secondary" onClick={onClose} className="w-full rounded-2xl h-12">
                        Dismiss
                     </Button>
                  )}
               </div>
            </motion.div>
         </div>
      )
   }

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
         <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-xl"
            onClick={onClose}
         />
         <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="bg-bg-primary border border-white/10 rounded-[2.5rem] w-full max-w-2xl relative z-10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden max-h-[90vh]"
         >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 shrink-0">
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-6">
                     <div className="flex flex-col gap-0.5">
                        <span className={cn(
                           "text-[10px] font-black uppercase tracking-[0.2em] transition-colors",
                           step === "select-type" ? "text-accent" : "text-text-muted"
                        )}>
                           Stage 01
                        </span>
                        <span className={cn(
                           "text-sm font-bold",
                           step === "select-type" ? "text-white" : "text-text-muted"
                        )}>
                           Engine Selection
                        </span>
                     </div>
                     <IconArrowRight className="h-4 w-4 text-white/10" />
                     <div className="flex flex-col gap-0.5">
                        <span className={cn(
                           "text-[10px] font-black uppercase tracking-[0.2em] transition-colors",
                           step === "configure" ? "text-accent" : "text-text-muted"
                        )}>
                           Stage 02
                        </span>
                        <span className={cn(
                           "text-sm font-bold",
                           step === "configure" ? "text-white" : "text-text-muted"
                        )}>
                           Environment Setup
                        </span>
                     </div>
                  </div>
               </div>
               <button
                  onClick={onClose}
                  className="h-10 w-10 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center text-text-muted hover:text-white transition-all active:scale-95"
               >
                  <IconX className="h-5 w-5" />
               </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
               {step === "select-type" && (
                  <div className="space-y-8">
                     <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">
                           Database Architecture
                        </h2>
                        <p className="text-base text-text-muted font-light mt-1.5 leading-relaxed">
                           Choose the core engine for your new workspace environment.
                        </p>
                     </div>
                     <div className="grid gap-4">
                        {DB_CARDS.map((card, i) => (
                           <motion.button
                              key={card.type}
                              custom={i}
                              variants={cardVariants}
                              animate="animate"
                              initial="initial"
                              whileHover={{ x: 4 }}
                              onClick={() => handleSelectType(card.type)}
                              className="flex items-center gap-6 bg-white/[0.02] border border-white/5 hover:border-accent/40 hover:bg-white/[0.04] rounded-[1.5rem] p-5 text-left transition-all cursor-pointer group"
                           >
                              <div
                                 className={cn(
                                    "h-16 w-16 rounded-2xl bg-gradient-to-br border border-white/5 flex items-center justify-center shrink-0 shadow-lg transition-transform duration-500 group-hover:scale-105",
                                    card.accent
                                 )}
                              >
                                 <card.icon className={cn("h-8 w-8 text-white shadow-xl", card.color)} />
                              </div>
                              <div className="flex-1 min-w-0">
                                 <h3 className="text-lg font-bold text-white group-hover:text-accent transition-colors">
                                    {card.label}
                                 </h3>
                                 <p className="text-[13px] text-text-muted mt-1 leading-normal font-light">
                                    {card.description}
                                 </p>
                              </div>
                              <div className="h-10 w-10 rounded-full border border-white/5 bg-white/5 flex items-center justify-center shrink-0 group-hover:border-accent/40 group-hover:bg-accent/10 transition-all">
                                 <IconArrowRight className="h-5 w-5 text-text-muted group-hover:text-accent transition-colors" />
                              </div>
                           </motion.button>
                        ))}
                     </div>
                  </div>
               )}

               {step === "configure" && (
                  <motion.div
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     className="space-y-10"
                  >
                     <div className="space-y-6">
                        <div>
                           <h2 className="text-2xl font-bold text-white tracking-tight">Identity & Resources</h2>
                           <p className="text-base text-text-muted font-light mt-1.5 leading-relaxed">
                              Configure the workspace metadata and seed data.
                           </p>
                        </div>

                        <div className="space-y-2">
                           <label className="text-[11px] font-black uppercase tracking-widest text-text-muted ml-1">Workspace Name</label>
                           <Input
                              autoFocus
                              value={dbName}
                              onChange={e => setDbName(e.target.value)}
                              placeholder="e.g. production-mirror-test"
                              className="w-full h-14 bg-white/[0.02] border-white/10 focus:border-accent/50 rounded-2xl text-lg px-6"
                           />
                        </div>
                     </div>

                     <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                           <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
                              Blueprint Templates
                           </h3>
                           {selectedDataset && (
                              <button
                                 onClick={() => setSelectedDataset(null)}
                                 className="text-xs font-bold text-accent hover:text-white transition-colors"
                              >
                                 Deselect All
                              </button>
                           )}
                        </div>

                        {datasetsLoading ? (
                           <div className="flex items-center justify-center py-12">
                              <IconLoader2 className="h-8 w-8 text-accent animate-spin" />
                           </div>
                        ) : datasets.length === 0 ? (
                           <div className="bg-bg-secondary/40 border border-dashed border-white/5 rounded-[2rem] p-10 text-center">
                              <IconDatabaseImport className="h-10 w-10 text-white/5 mx-auto mb-3" />
                              <p className="text-base text-text-muted font-medium">No blueprints available</p>
                              <p className="text-sm text-text-muted/60 mt-1.5 font-light leading-relaxed">
                                 The selected engine has no certified templates.
                                 <br />Proceed with a clean instance.
                              </p>
                           </div>
                        ) : (
                           <div className="grid gap-3 max-h-[320px] overflow-y-auto custom-scrollbar pr-3">
                              {datasets
                                 .filter(ds => ds.dbTypes.includes(selectedDbType!))
                                 .map(ds => (
                                    <button
                                       key={ds.id}
                                       onClick={() =>
                                          setSelectedDataset(
                                             selectedDataset?.id === ds.id ? null : ds
                                          )
                                       }
                                       className={cn(
                                          "flex items-center gap-5 rounded-2xl p-5 text-left transition-all duration-300 border",
                                          selectedDataset?.id === ds.id
                                             ? "border-accent/40 bg-accent/5"
                                             : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                                       )}
                                    >
                                       <div
                                          className={cn(
                                             "h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500 shadow-inner",
                                             selectedDataset?.id === ds.id
                                                ? "bg-accent/20 text-accent"
                                                : "bg-bg-tertiary text-text-muted"
                                          )}
                                       >
                                          <IconDatabaseImport className="h-6 w-6" />
                                       </div>
                                       <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2.5">
                                             <span className="text-[15px] font-bold text-white">
                                                {ds.name}
                                             </span>
                                             <Badge
                                                variant="secondary"
                                                className="text-[9px] font-black tracking-widest px-1.5 py-0 bg-white/5 border-white/5 uppercase"
                                             >
                                                {ds.category}
                                             </Badge>
                                          </div>
                                          <p className="text-[12px] text-text-muted/70 mt-1 font-light truncate">
                                             {ds.description}
                                          </p>
                                       </div>
                                       <div className={cn(
                                          "h-6 w-6 rounded-full border flex items-center justify-center transition-all",
                                          selectedDataset?.id === ds.id ? "border-accent bg-accent text-bg-primary scale-100" : "border-white/10 scale-90 opacity-0"
                                       )}>
                                          <IconCheck className="h-4 w-4 stroke-[3]" />
                                       </div>
                                    </button>
                                 ))}
                           </div>
                        )}
                     </div>
                  </motion.div>
               )}
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-white/5 shrink-0 bg-[#080808]/50 backdrop-blur-md">
               <div className="flex items-center justify-between">
                  {step === "configure" ? (
                     <button
                        onClick={() => {
                           setSelectedDataset(null)
                           setStep("select-type")
                        }}
                        className="h-12 px-6 text-sm font-bold text-text-muted hover:text-white transition-all flex items-center gap-2 group"
                     >
                        <IconArrowRight className="h-4 w-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                        Previous Step
                     </button>
                  ) : (
                     <div />
                  )}

                  <div className="flex gap-3">
                     {step === "select-type" && (
                         <Button variant="secondary" onClick={onClose} className="h-12 px-8 rounded-2xl bg-white/5 hover:bg-white/10 border-white/5 text-white font-bold">
                           Cancel
                        </Button>
                     )}
                     <Button
                        onClick={step === "select-type" ? undefined : handleCreate}
                        disabled={step === "select-type" || creating}
                        className={cn(
                           "h-12 px-10 rounded-2xl gap-3 font-bold text-[15px] transition-all shadow-xl shadow-accent/10 active:scale-95",
                           step === "select-type" && "opacity-0 pointer-events-none"
                        )}
                     >
                        {creating ? (
                           <>
                              <IconLoader2 className="h-5 w-5 animate-spin" />
                              Warming Up...
                           </>
                        ) : (
                           <>
                              <IconPlus className="h-5 w-5" />
                              Deploy Environment
                           </>
                        )}
                     </Button>
                  </div>
               </div>
            </div>
         </motion.div>
      </div>
   )
}
