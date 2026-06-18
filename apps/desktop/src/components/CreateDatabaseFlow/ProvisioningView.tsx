import { IconCheck, IconLoader2, IconX } from "@tabler/icons-react"
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
   const completed = steps.filter(step => step.status === "done").length

   const progress = allDone ? 100 : Math.round((completed / steps.length) * 100)

   const current = steps.find(step => step.status === "in-progress")

   return (
      <div
         className={cn(
            "grid w-full max-w-5xl",
            "grid-cols-[1fr_460px]",
            "gap-20",
            "animate-in fade-in duration-500"
         )}
      >
         {/* LEFT */}
         <section className={cn("flex flex-col justify-center", "space-y-8")}>
            <div className="space-y-5">
               <span className="text-sm text-white/40">Workspace runtime</span>

               <h1 className={cn("max-w-xl", "text-5xl font-semibold tracking-tight")}>
                  Preparing your isolated environment
               </h1>

               <p className={cn("max-w-md", "text-base leading-7", "text-white/40")}>
                  Creating a secure containerized workspace with an independent filesystem and
                  runtime.
               </p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-md">
               {["Container isolation", "Agent runtime", "Filesystem sync", "Health checks"].map(
                  item => (
                     <div
                        key={item}
                        className={cn(
                           "rounded-md border border-white/10",
                           "px-4 py-3",
                           "text-md text-white/50"
                        )}
                     >
                        {item}
                     </div>
                  )
               )}
            </div>
         </section>

         {/* RIGHT CARD */}
         <section
            className={cn(
               "relative overflow-hidden",
               "rounded-xl",
               "border border-white/5",
               "bg-bg-secondary/60",
               "p-8",
               "backdrop-blur-xl"
            )}
         >
            <div className="space-y-8">
               {/* header */}

               <div>
                  <h2 className="text-xl font-semibold">
                     {error
                        ? "Workspace failed"
                        : allDone
                          ? "Workspace ready"
                          : "Initializing workspace"}
                  </h2>

                  <p className="mt-2 text-sm text-white/40">
                     {error || current?.message || "Provisioning container..."}
                  </p>
               </div>

               {/* progress */}

               <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                     <span className="text-white/40">Progress</span>

                     <span>{progress}%</span>
                  </div>

                  <div className={cn("h-6 rounded-sm", "bg-white/10", "p-1")}>
                     <div
                        style={{
                           width: `${progress}%`,
                        }}
                        className={cn(
                           "h-full rounded-sm",
                           "bg-white/60",
                           "transition-all duration-700"
                        )}
                     />
                  </div>
               </div>

               {/* STEPS */}

               <div className="space-y-6">
                  {steps.map(step => (
                     <div
                        key={step.id}
                        className={cn(
                           "flex gap-4",

                           step.status === "pending" && "opacity-30"
                        )}
                     >
                        <div className="grid size-5 place-items-center">
                           {step.status === "done" ? (
                              <IconCheck size={16} />
                           ) : step.status === "in-progress" ? (
                              <IconLoader2 size={16} className="animate-spin" />
                           ) : step.status === "error" ? (
                              <IconX size={16} />
                           ) : (
                              <span className="size-2 rounded-full bg-white/30" />
                           )}
                        </div>

                        <div>
                           <p className="text-sm font-medium">{step.label}</p>

                           {step.status === "in-progress" && step.message && (
                              <p className="mt-1 text-xs text-white/40">{step.message}</p>
                           )}
                        </div>
                     </div>
                  ))}
               </div>

               {(allDone || error) && (
                  <Button onClick={onClose} className="h-12 w-full rounded-xl">
                     Enter workspace
                  </Button>
               )}
            </div>
         </section>
      </div>
   )
}
