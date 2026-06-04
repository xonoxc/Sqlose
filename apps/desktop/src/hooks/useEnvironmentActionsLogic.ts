import { useState } from "react"
import { useEnvironmentStore } from "~/stores/environmentStore"
import type { Environment } from "@sqlose/shared"

export function useEnvironmentActionsLogic(environment: Environment | null) {
   const [showDestroyConfirm, setShowDestroyConfirm] = useState(false)
   const [showNukeConfirm, setShowNukeConfirm] = useState(false)
   const startEnvironment = useEnvironmentStore(s => s.startEnvironment)
   const stopEnvironment = useEnvironmentStore(s => s.stopEnvironment)
   const restartEnvironment = useEnvironmentStore(s => s.restartEnvironment)
   const destroyEnvironment = useEnvironmentStore(s => s.destroyEnvironment)
   const nukeEnvironment = useEnvironmentStore(s => s.nukeEnvironment)
   const selectEnvironment = useEnvironmentStore(s => s.selectEnvironment)
   const isLoading = useEnvironmentStore(s => s.isLoading)

   const handleStart = () => {
      if (environment) startEnvironment(environment.id)
   }

   const handleStop = () => {
      if (environment) stopEnvironment(environment.id)
   }

   const handleRestart = () => {
      if (environment) restartEnvironment(environment.id)
   }

   const handleDestroy = async () => {
      if (environment) {
         await destroyEnvironment(environment.id)
         setShowDestroyConfirm(false)
      }
   }

   const handleNuke = async () => {
      if (environment) {
         await nukeEnvironment(environment.id)
         selectEnvironment(null)
         setShowNukeConfirm(false)
      }
   }

   return {
      showDestroyConfirm,
      setShowDestroyConfirm,
      showNukeConfirm,
      setShowNukeConfirm,
      isLoading,
      handleStart,
      handleStop,
      handleRestart,
      handleDestroy,
      handleNuke,
   }
}
