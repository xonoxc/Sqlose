import { IconArrowRight, IconAlertTriangle } from "@tabler/icons-react"
import { cn } from "@sqlose/ui"
import { motion } from "motion/react"
import type { DBType, DockerAvailability } from "@sqlose/shared"
import { DB_CARDS } from "./db-cards"

interface SelectTypeStepProps {
   dockerAvailable: boolean | null
   dockerStatus: DockerAvailability | null
   onSelectType: (type: DBType) => void
}

export function SelectTypeStep({
   dockerAvailable,
   dockerStatus,
   onSelectType,
}: SelectTypeStepProps) {
   return (
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
            {DB_CARDS.map(card => {
               const isDisabled = card.requiresDocker && dockerAvailable === false
               return (
                  <div key={card.type} className="relative">
                     <button
                        disabled={isDisabled}
                        onClick={() => !isDisabled && onSelectType(card.type)}
                        className={cn(
                           "group w-full flex items-center justify-between p-6 rounded-[1.5rem] bg-bg-secondary/40 border border-border transition-all text-left overflow-hidden relative",
                           isDisabled
                              ? "opacity-40 cursor-not-allowed"
                              : "hover:border-accent/60 hover:bg-bg-tertiary"
                        )}
                     >
                        <div
                           className={cn(
                              "absolute inset-0 transition-colors",
                              isDisabled ? "bg-transparent" : "bg-accent/0 group-hover:bg-accent/5"
                           )}
                        />
                        <div className="flex items-center gap-6 relative z-10">
                           <div
                              className={cn(
                                 "h-14 w-14 rounded-2xl bg-bg-tertiary border border-border flex items-center justify-center transition-all",
                                 isDisabled
                                    ? ""
                                    : "group-hover:border-accent/40 group-hover:shadow-[0_0_20px_rgba(var(--color-accent),0.1)]",
                                 card.color
                              )}
                           >
                              <card.icon className="h-7 w-7" />
                           </div>
                           <div>
                              <h3
                                 className={cn(
                                    "text-lg font-bold transition-colors uppercase tracking-tight",
                                    isDisabled ? "text-text-muted" : "text-white"
                                 )}
                              >
                                 {card.label}
                              </h3>
                              <p className="text-[13px] text-text-muted max-w-[320px] font-medium mt-1 leading-snug opacity-70">
                                 {card.description}
                              </p>
                           </div>
                        </div>
                        <div
                           className={cn(
                              "h-10 w-10 rounded-xl border border-border flex items-center justify-center relative z-10 shadow-lg transition-all",
                              isDisabled
                                 ? "opacity-30"
                                 : "group-hover:bg-accent group-hover:border-accent group-hover:text-white active:scale-95"
                           )}
                        >
                           <IconArrowRight className="h-5 w-5" />
                        </div>
                     </button>
                     {isDisabled && (
                        <div className="flex items-start gap-2 mt-2 ml-2 px-3 py-2 rounded-xl bg-amber-500/5 border border-amber-500/10">
                           <IconAlertTriangle className="h-3.5 w-3.5 text-amber-400/80 shrink-0 mt-0.5" />
                           <div className="space-y-1">
                              <p className="text-[11px] font-semibold text-amber-400/90 leading-tight">
                                 {dockerStatus?.title ?? "Docker is not available"}
                              </p>
                              <p className="text-[11px] font-medium text-amber-400/70 leading-snug max-w-[520px]">
                                 {dockerStatus?.message ??
                                    "PostgreSQL and MySQL environments require Docker."}
                              </p>
                              {dockerStatus?.detail && (
                                 <p className="text-[10px] font-medium text-amber-300/60 leading-snug max-w-[520px]">
                                    {dockerStatus.detail}
                                 </p>
                              )}
                           </div>
                        </div>
                     )}
                  </div>
               )
            })}
         </div>
      </motion.div>
   )
}
