import { IconCheck, IconDatabaseImport, IconLoader2 } from "@tabler/icons-react"
import { cn, Input } from "@sqlose/ui"
import { motion } from "motion/react"
import type { DBType, Dataset } from "@sqlose/shared"

interface ConfigureStepProps {
   dbName: string
   setDbName: (v: string) => void
   selectedDbType: DBType | null
   datasets: Dataset[]
   datasetsLoading: boolean
   selectedDataset: Dataset | null
   setSelectedDataset: (ds: Dataset | null) => void
}

const scrollbarStyles = `
   .custom-scrollbar::-webkit-scrollbar { width: 4px; }
   .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
   .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 10px; }
`

export function ConfigureStep({
   dbName,
   setDbName,
   selectedDbType,
   datasets,
   datasetsLoading,
   selectedDataset,
   setSelectedDataset,
}: ConfigureStepProps) {
   return (
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
               This environment will be isolated in a dedicated container with your selected
               blueprint.
            </p>
         </div>

         <div className="space-y-10">
            <div className="space-y-3">
               <label className="text-[11px] text-white/80 text-accent px-1 uppercase tracking-[0.2em] leading-none">
                  Workspace Identity
               </label>
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
                  <label className="text-[11px] text-white/80 text-accent px-1 uppercase tracking-[0.2em] leading-none">
                     Blueprint Templates
                  </label>
                  {selectedDataset && (
                     <button
                        onClick={() => setSelectedDataset(null)}
                        className="text-[10px] font-black text-text-muted hover:text-accent transition-colors uppercase tracking-widest"
                     >
                        Deselect All
                     </button>
                  )}
               </div>
               <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-3 custom-scrollbar scrollbar-thin-subtle focus-within:ring-0">
                  <style>{scrollbarStyles}</style>
                  {datasetsLoading ? (
                     <div className="py-20 flex justify-center">
                        <IconLoader2 className="animate-spin h-8 w-8 text-accent" />
                     </div>
                  ) : datasets.length === 0 ? (
                     <div className="p-12 text-center bg-bg-secondary/20 border border-dashed border-border rounded-3xl">
                        <IconDatabaseImport className="h-8 w-8 text-text-muted/20 mx-auto mb-4" />
                        <p className="text-text-muted text-sm italic font-light">
                           No templates found for this engine. Proceeding with clean DB.
                        </p>
                     </div>
                  ) : (
                     datasets
                        .filter(ds => ds.dbTypes.includes(selectedDbType!))
                        .map(ds => (
                           <button
                              key={ds.id}
                              onClick={() =>
                                 setSelectedDataset(selectedDataset?.id === ds.id ? null : ds)
                              }
                              className={cn(
                                 "flex items-center gap-5 p-5 rounded-[1.5rem] border transition-all text-left group relative overflow-hidden",
                                 selectedDataset?.id === ds.id
                                    ? "bg-accent/10 border-accent/40"
                                    : "bg-bg-secondary/40 border-border hover:bg-bg-tertiary hover:border-accent/20"
                              )}
                           >
                              <div
                                 className={cn(
                                    "h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border border-border transition-all",
                                    selectedDataset?.id === ds.id
                                       ? "bg-accent shadow-[0_0_15px_rgba(var(--color-accent),0.3)] text-white"
                                       : "bg-bg-tertiary text-text-muted group-hover:text-text-primary"
                                 )}
                              >
                                 <IconDatabaseImport className="h-6 w-6" />
                              </div>
                              <div className="flex-1">
                                 <span
                                    className={cn(
                                       "text-[15px] font-bold block transition-colors",
                                       selectedDataset?.id === ds.id
                                          ? "text-white"
                                          : "text-text-primary"
                                    )}
                                 >
                                    {ds.name}
                                 </span>
                                 <span className="text-[12px] text-text-muted font-medium truncate block mt-1 opacity-70">
                                    {ds.description}
                                 </span>
                              </div>
                              <div
                                 className={cn(
                                    "h-6 w-6 rounded-lg border flex items-center justify-center transition-all",
                                    selectedDataset?.id === ds.id
                                       ? "bg-accent border-accent text-white scale-100"
                                       : "border-border bg-bg-tertiary opacity-0 group-hover:opacity-100 scale-90"
                                 )}
                              >
                                 <IconCheck className="h-4 w-4 stroke-[4]" />
                              </div>
                           </button>
                        ))
                  )}
               </div>
            </div>
         </div>
      </motion.div>
   )
}
