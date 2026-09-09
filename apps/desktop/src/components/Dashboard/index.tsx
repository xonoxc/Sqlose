import { motion, AnimatePresence } from "motion/react"
import { useDashboardState } from "~/hooks/useDashboardState"
import { CreateDatabaseFlow } from "~/components/CreateDatabaseFlow"
import { ConfirmDialog } from "~/components/ConfirmDialog"
import { slideVariants } from "./slideVariants"
import { Branding } from "./Branding"
import { EnvironmentList } from "./EnvironmentList"
import { IconPlugConnected, IconBox } from "@tabler/icons-react"
import { useSettingsStore } from "~/stores/settingsStore"

export function Dashboard() {
   const {
      showCreateFlow,
      isLoading,
      setShowCreateFlow,
      environments,
      handleSelectEnv,
      handleDestroyEnv,
      destroyTarget,
      setDestroyTarget,
      confirmDestroy,
   } = useDashboardState()
   
   const appMode = useSettingsStore(s => s.appMode)
   const setAppMode = useSettingsStore(s => s.setAppMode)

   return (
      <div className="flex flex-col h-full w-full bg-bg-primary text-text-primary overflow-hidden relative">
         {/* Mode Switcher */}
         <div className="flex justify-center p-6 shrink-0">
            <div className="flex items-center gap-1 bg-bg-secondary border border-border/40 rounded-xl p-1 shadow-sm">
               <button
                  onClick={() => setAppMode("sandbox")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                     appMode === "sandbox"
                        ? "bg-accent/10 text-accent border border-accent/20"
                        : "text-text-muted hover:text-text-primary hover:bg-bg-tertiary"
                  }`}
               >
                  <IconBox className="h-4 w-4" />
                  Sandbox
               </button>
               <button
                  onClick={() => setAppMode("client")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                     appMode === "client"
                        ? "bg-accent/10 text-accent border border-accent/20"
                        : "text-text-muted hover:text-text-primary hover:bg-bg-tertiary"
                  }`}
               >
                  <IconPlugConnected className="h-4 w-4" />
                  DB Client
               </button>
            </div>
         </div>

         <div className="flex-1 flex items-center justify-center p-6 relative">
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
                  <Branding />

                  <EnvironmentList
                     environments={environments}
                     isLoading={isLoading}
                     onSelect={handleSelectEnv}
                     onDestroy={handleDestroyEnv}
                     onCreate={() => setShowCreateFlow(true)}
                  />
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
         <ConfirmDialog
            open={!!destroyTarget}
            onCancel={() => setDestroyTarget(null)}
            onConfirm={confirmDestroy}
            title="Delete Workspace"
            description={
               <>
                  Are you sure you want to delete{" "}
                  <strong>
                     {environments.find(e => e.id === destroyTarget)?.name || "this workspace"}
                  </strong>
                  ? This will remove the container and all data. This action cannot be undone.
               </>
            }
         />
         </div>
      </div>
   )
}
