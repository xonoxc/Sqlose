import { motion, AnimatePresence } from "motion/react"
import { useDashboardState } from "~/hooks/useDashboardState"
import { CreateDatabaseFlow } from "~/components/CreateDatabaseFlow"
import { ConfirmDialog } from "~/components/ConfirmDialog"
import { slideVariants } from "./slideVariants"
import { Branding } from "./Branding"
import { EnvironmentList } from "./EnvironmentList"

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
   )
}
