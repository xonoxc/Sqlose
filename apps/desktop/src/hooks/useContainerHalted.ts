import { useState, useEffect, useCallback } from "react"
import { useEnvironmentStore } from "../stores/environmentStore"

export function useContainerHalted() {
   const [stuckEnvId, setStuckEnvId] = useState<string | null>(null)

   const selectedEnvironmentId = useEnvironmentStore(s => s.selectedEnvironmentId)
   const environments = useEnvironmentStore(s => s.environments)
   const startEnvironment = useEnvironmentStore(s => s.startEnvironment)
   const nukeEnvironment = useEnvironmentStore(s => s.nukeEnvironment)
   const selectEnvironment = useEnvironmentStore(s => s.selectEnvironment)

   useEffect(() => {
      if (!selectedEnvironmentId) {
         setStuckEnvId(null)
      } else if (stuckEnvId === null) {
         const env = environments.find(e => e.id === selectedEnvironmentId)
         if (env && env.status === "stopped" && env.containerId) {
            setStuckEnvId(env.id)
         }
      }
   }, [selectedEnvironmentId, environments, stuckEnvId])

   const handleRestoreEnv = useCallback(async () => {
      if (stuckEnvId) {
         await startEnvironment(stuckEnvId)
         setStuckEnvId(null)
      }
   }, [stuckEnvId, startEnvironment])

   const handleExitAndNuke = useCallback(async () => {
      if (stuckEnvId) {
         await nukeEnvironment(stuckEnvId)
         selectEnvironment(null)
         setStuckEnvId(null)
      }
   }, [stuckEnvId, nukeEnvironment, selectEnvironment])

   const stuckEnv = stuckEnvId
      ? environments.find(e => e.id === stuckEnvId) ?? null
      : null

   return { stuckEnvId, stuckEnv, handleRestoreEnv, handleExitAndNuke }
}
