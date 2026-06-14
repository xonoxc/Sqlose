import { IconLoader2, IconPlus } from "@tabler/icons-react"
import { Button, cn } from "@sqlose/ui"
import { AnimatePresence } from "motion/react"
import { useCreateDatabaseFlowLogic } from "~/hooks/useCreateDatabaseFlowLogic"
import { useDockerStatus } from "~/hooks/useDockerStatus"
import { StepIndicator } from "./StepIndicator"
import { SelectTypeStep } from "./SelectTypeStep"
import { ConfigureStep } from "./ConfigureStep"
import { ProvisioningView } from "./ProvisioningView"

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
      duplicateNameError,
      handleSelectType,
      handleCreate,
   } = useCreateDatabaseFlowLogic(onClose)
   const { dockerAvailable, dockerStatus } = useDockerStatus()

   const currentStepIndex = step === "select-type" ? 0 : step === "configure" ? 1 : 2

   if (step === "provisioning") {
      return (
         <ProvisioningView
            steps={provisioningSteps}
            allDone={allDone}
            error={provisioningError}
            onClose={onClose}
         />
      )
   }

   return (
      <div className="w-full max-w-2xl px-6">
         <div className="mb-16">
            <StepIndicator currentStepIndex={currentStepIndex} />
         </div>

         <AnimatePresence mode="wait">
            {step === "select-type" && (
               <SelectTypeStep
                  dockerAvailable={dockerAvailable}
                  dockerStatus={dockerStatus}
                  onSelectType={handleSelectType}
               />
            )}

             {step === "configure" && (
                <ConfigureStep
                   dbName={dbName}
                   setDbName={setDbName}
                   selectedDbType={selectedDbType}
                   datasets={datasets}
                   datasetsLoading={datasetsLoading}
                   selectedDataset={selectedDataset}
                   setSelectedDataset={setSelectedDataset}
                   nameError={duplicateNameError}
                />
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
                disabled={step === "select-type" || creating || !!duplicateNameError}
                onClick={handleCreate}
               className={cn(
                  "h-14 px-14 rounded-2xl text-[14px] font-black uppercase tracking-[0.2em] gap-3 transition-all flex items-center justify-center",
                  step === "select-type"
                     ? "opacity-0 pointer-events-none"
                     : "bg-accent text-white shadow-[0_10px_30px_rgba(var(--color-accent),0.3)] hover:scale-[1.02] active:scale-[0.98]"
               )}
            >
               {creating ? (
                  <>
                     <IconLoader2 className="h-5 w-5 animate-spin" /> Provisioning
                  </>
               ) : (
                  <>
                     <IconPlus className="h-5 w-5" strokeWidth={3} /> Launch
                  </>
               )}
            </Button>
         </div>
      </div>
   )
}
