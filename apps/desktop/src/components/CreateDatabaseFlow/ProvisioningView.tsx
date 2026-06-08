import { IconCheck, IconCircleCheck, IconLoader2, IconX } from "@tabler/icons-react"
import { Button, cn } from "@sqlose/ui"

interface ProvisioningStep {
   id: string
   label: string
   status: "pending" | "in-progress" | "done" | "error"
   message?: string
}

interface ProvisioningViewProps {
   steps: ProvisioningStep[]
   allDone: boolean
   error: string | null
   onClose: () => void
}

export function ProvisioningView({ steps, allDone, error, onClose }: ProvisioningViewProps) {
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
                  ) : error ? (
                     <IconX className="h-10 w-10 text-error" />
                  ) : (
                     <IconLoader2 className="h-10 w-10 text-accent animate-spin" />
                  )}
               </div>

               <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-white tracking-tight uppercase tracking-widest">
                     {error ? "FAILED" : allDone ? "DEPLOYED" : "INITIALIZING"}
                  </h2>
                  <p className="text-base text-text-muted font-medium max-w-[280px] mx-auto opacity-80">
                     {error
                        ? "The deployment cycle was interrupted."
                        : allDone
                          ? "Your high-redundancy environment is online."
                          : "Provisioning isolated workspace container..."}
                  </p>
               </div>

               <div className="w-full space-y-3">
                  {steps.map(ps => (
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
                        <span className="flex-1 uppercase tracking-widest leading-none">
                           {ps.message ? ps.message : ps.label}
                        </span>
                     </div>
                  ))}
               </div>

               {(error || allDone) && (
                  <Button
                     onClick={onClose}
                     className="w-full h-14 rounded-2xl bg-accent text-white font-black uppercase tracking-widest shadow-xl shadow-accent/20"
                  >
                     Enter Workspace
                  </Button>
               )}
            </div>
         </div>
      </div>
   )
}
