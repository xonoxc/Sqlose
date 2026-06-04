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
import { Button, Input, cn } from "@sqlose/ui"
import type { DBType } from "@sqlose/shared"
import { useCreateDatabaseFlowLogic } from "~/hooks/useCreateDatabaseFlowLogic"
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
   } = useCreateDatabaseFlowLogic(onClose)

   const steps = ["Source", "Identity", "Review"]
   const currentStepIndex = step === "select-type" ? 0 : step === "configure" ? 1 : 2
   const progress = ((currentStepIndex + 1) / steps.length) * 100

   if (step === "provisioning") {
      return (
         <div className="w-full max-w-xl animate-in fade-in duration-500">
            <div className="bg-bg-secondary/40 border border-border/80 rounded-[3rem] p-12 w-full relative overflow-hidden backdrop-blur-md">
               {allDone && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-accent/20 blur-[80px] pointer-events-none rounded-full" />
               )}

               <div className="flex flex-col items-center gap-10 relative z-10">
                  <div className="h-24 w-24 rounded-[2.5rem] bg-bg-tertiary border border-border flex items-center justify-center shadow-[0_0_50px_rgba(var(--color-accent),0.1)] transition-all duration-700">
                     {allDone ? (
                        <IconCircleCheck className="h-10 w-10 text-accent" />
                     ) : provisioningError ? (
                        <IconX className="h-10 w-10 text-error" />
                     ) : (
                        <IconLoader2 className="h-10 w-10 text-accent animate-spin" />
                     )}
                  </div>

                  <div className="text-center space-y-2">
                     <h2 className="text-3xl font-bold text-white tracking-tight uppercase tracking-widest">
                        {provisioningError ? "FAILED" : allDone ? "DEPLOYED" : "INITIALIZING"}
                     </h2>
                     <p className="text-base text-text-muted font-medium max-w-[280px] mx-auto opacity-80">
                        {provisioningError
                           ? "The deployment cycle was interrupted."
                           : allDone
                              ? "Your high-redundancy environment is online."
                              : "Provisioning isolated workspace container..."}
                     </p>
                  </div>

                  <div className="w-full space-y-3">
                     {provisioningSteps.map(ps => (
                        <div
                           key={ps.id}
                           className={cn(
                              "flex items-center gap-4 px-6 py-4 rounded-2xl text-[13px] font-bold border transition-all",
                              ps.status === "in-progress"
                                 ? "bg-accent/10 border-accent/30 text-white"
                                 : ps.status === "done"
                                   ? "bg-white/[0.03] border-white/10 text-text-muted"
                                   : ps.status === "error"
                                     ? "bg-error/10 border-error/20 text-error"
                                      : "bg-transparent border-transparent opacity-20"
                           )}
                        >
                           {ps.status === "done" ? (
                              <IconCheck className="h-4 w-4 text-accent" strokeWidth={3} />
                           ) : ps.status === "in-progress" ? (
                              <IconLoader2 className="h-4 w-4 text-accent animate-spin" />
                           ) : ps.status === "error" ? (
                              <IconX className="h-4 w-4 text-error" />
                           ) : (
                              <div className="h-4 w-4 rounded-full border border-border" />
                           )}
                           <span className="flex-1 uppercase tracking-widest leading-none">{ps.label}</span>
                        </div>
                     ))}
                  </div>

                  {(provisioningError || allDone) && (
                     <Button onClick={onClose} className="w-full h-14 rounded-2xl bg-accent text-white font-black uppercase tracking-widest shadow-xl shadow-accent/20">
                        Enter Workspace
                     </Button>
                  )}
               </div>
            </div>
         </div>
      )
   }

   return (
      <div className="w-full max-w-2xl px-6">
         {/* Step Progress Bar */}
         <div className="w-full h-[4px] bg-border/40 rounded-full mb-6 overflow-hidden relative border border-white/5">
            <motion.div
               initial={{ width: 0 }}
               animate={{ width: `${progress}%` }}
               transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
               className="h-full bg-accent shadow-[0_0_15px_rgba(var(--color-accent),0.4)]"
            />
         </div>
         <div className="flex items-center justify-between mb-16">
            <div className="text-[11px] font-black text-accent uppercase tracking-[0.3em]">
               PROGRESS {currentStepIndex + 1}/{steps.length}
            </div>
            <div className="text-[11px] font-black text-text-muted uppercase tracking-[0.3em]">
               {steps[currentStepIndex]}
            </div>
         </div>

         <AnimatePresence mode="wait">
            {step === "select-type" && (
               <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-12"
               >
                  <div className="max-w-[480px]">
                     <h1 className="text-4xl font-black text-white tracking-tight mb-4 uppercase">
                        Select Engine
                     </h1>
                     <p className="text-lg text-text-muted leading-relaxed font-medium opacity-80">
                        Choose the core architecture that will power your new workspace environment.
                     </p>
                  </div>

                  <div className="grid gap-4">
                      {DB_CARDS.map(card => (
                        <button
                           key={card.type}
                           onClick={() => handleSelectType(card.type)}
                           className="group flex items-center justify-between p-6 rounded-[1.5rem] bg-bg-secondary/40 border border-border hover:border-accent/60 hover:bg-bg-tertiary transition-all text-left overflow-hidden relative"
                        >
                           <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/5 transition-colors" />
                           <div className="flex items-center gap-6 relative z-10">
                              <div className={cn("h-14 w-14 rounded-2xl bg-bg-tertiary border border-border flex items-center justify-center transition-all group-hover:border-accent/40 group-hover:shadow-[0_0_20px_rgba(var(--color-accent),0.1)]", card.color)}>
                                 <card.icon className="h-7 w-7" />
                              </div>
                              <div>
                                 <h3 className="text-lg font-bold text-white group-hover:text-accent transition-colors uppercase tracking-tight">{card.label}</h3>
                                 <p className="text-[13px] text-text-muted max-w-[320px] font-medium mt-1 leading-snug opacity-70">{card.description}</p>
                              </div>
                           </div>
                           <div className="h-10 w-10 rounded-xl border border-border flex items-center justify-center relative z-10 group-hover:bg-accent group-hover:border-accent group-hover:text-white transition-all shadow-lg active:scale-95">
                              <IconArrowRight className="h-5 w-5" />
                           </div>
                        </button>
                     ))}
                  </div>
               </motion.div>
            )}

            {step === "configure" && (
               <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-12"
               >
                  <div className="max-w-[480px]">
                     <h1 className="text-4xl font-black text-white tracking-tight mb-4 uppercase">
                        Configure
                     </h1>
                     <p className="text-lg text-text-muted leading-relaxed font-medium opacity-80">
                        This environment will be isolated in a dedicated container with your selected blueprint.
                     </p>
                  </div>

                  <div className="space-y-10">
                     <div className="space-y-3">
                        <label className="text-[11px] font-black text-accent px-1 uppercase tracking-[0.2em] leading-none">Workspace Identity</label>
                        <div className="relative group">
                           <Input
                              autoFocus
                              value={dbName}
                              onChange={e => setDbName(e.target.value)}
                              placeholder="e.g. finance-sandbox-v1"
                              className="w-full h-16 bg-bg-secondary/60 border-border focus:border-accent/60 focus:bg-bg-tertiary rounded-2xl text-xl px-7 transition-all font-bold text-white shadow-inner"
                           />
                        </div>
                     </div>

                     <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                           <label className="text-[11px] font-black text-accent px-1 uppercase tracking-[0.2em] leading-none">Blueprint Templates</label>
                           {selectedDataset && (
                              <button onClick={() => setSelectedDataset(null)} className="text-[10px] font-black text-text-muted hover:text-accent transition-colors uppercase tracking-widest">Deselect All</button>
                           )}
                        </div>
                        <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-3 custom-scrollbar scrollbar-thin-subtle focus-within:ring-0">
                           <style>{`
                              .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                              .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                              .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 10px; }
                           `}</style>
                           {datasetsLoading ? (
                              <div className="py-20 flex justify-center"><IconLoader2 className="animate-spin h-8 w-8 text-accent" /></div>
                           ) : datasets.length === 0 ? (
                              <div className="p-12 text-center bg-bg-secondary/20 border border-dashed border-border rounded-3xl">
                                 <IconDatabaseImport className="h-8 w-8 text-text-muted/20 mx-auto mb-4" />
                                 <p className="text-text-muted text-sm italic font-light">No templates found for this engine. Proceeding with clean DB.</p>
                              </div>
                           ) : (
                              datasets.filter(ds => ds.dbTypes.includes(selectedDbType!)).map(ds => (
                                 <button
                                    key={ds.id}
                                    onClick={() => setSelectedDataset(selectedDataset?.id === ds.id ? null : ds)}
                                    className={cn(
                                       "flex items-center gap-5 p-5 rounded-[1.5rem] border transition-all text-left group relative overflow-hidden",
                                       selectedDataset?.id === ds.id ? "bg-accent/10 border-accent/40" : "bg-bg-secondary/40 border-border hover:bg-bg-tertiary hover:border-accent/20"
                                    )}
                                 >
                                    <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border border-border transition-all", selectedDataset?.id === ds.id ? "bg-accent shadow-[0_0_15px_rgba(var(--color-accent),0.3)] text-white" : "bg-bg-tertiary text-text-muted group-hover:text-text-primary")}>
                                       <IconDatabaseImport className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1">
                                       <span className={cn("text-[15px] font-bold block transition-colors", selectedDataset?.id === ds.id ? "text-white" : "text-text-primary")}>{ds.name}</span>
                                       <span className="text-[12px] text-text-muted font-medium truncate block mt-1 opacity-70">{ds.description}</span>
                                    </div>
                                    <div className={cn("h-6 w-6 rounded-lg border flex items-center justify-center transition-all", selectedDataset?.id === ds.id ? "bg-accent border-accent text-white scale-100" : "border-border bg-bg-tertiary opacity-0 group-hover:opacity-100 scale-90")}>
                                       <IconCheck className="h-4 w-4 stroke-[4]" />
                                    </div>
                                 </button>
                              ))
                           )}
                        </div>
                     </div>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

         <div className="mt-20 flex items-center justify-end gap-6 border-t border-border/40 pt-10">
            <button
               onClick={onClose}
               className="h-14 px-10 rounded-2xl text-[14px] font-black uppercase tracking-[0.2em] text-text-primary/70 hover:text-white hover:bg-white/5 transition-all outline-none"
            >
               Cancel
            </button>
            <Button
               disabled={step === "select-type" || creating}
               onClick={handleCreate}
               className={cn(
                  "h-14 px-14 rounded-2xl text-[14px] font-black uppercase tracking-[0.2em] gap-3 transition-all",
                  step === "select-type" ? "opacity-0 pointer-events-none" : "bg-accent text-white shadow-[0_10px_30px_rgba(var(--color-accent),0.3)] hover:scale-[1.02] active:scale-[0.98]"
               )}
            >
               {creating ? <><IconLoader2 className="h-5 w-5 animate-spin" /> Provisioning</> : <><IconPlus className="h-5 w-5" strokeWidth={3} /> Launch</>}
            </Button>
         </div>
      </div>
   )
}
