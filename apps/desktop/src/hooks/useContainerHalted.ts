import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"
import { useEnvironmentStore } from "~/stores/environmentStore"
import { useDatabaseStore } from "~/stores/databaseStore"
import { api } from "~/lib/api"

export function useContainerHalted() {
   const [stuckEnvId, setStuckEnvId] = useState<string | null>(null)
   const [isRestoring, setIsRestoring] = useState(false)
   const [restoreProgress, setRestoreProgress] = useState(0)
   const [restoreLabel, setRestoreLabel] = useState("")
   const cleanupRef = useRef<(() => void) | null>(null)

   const selectedEnvironmentId = useEnvironmentStore(s => s.selectedEnvironmentId)
   const environments = useEnvironmentStore(s => s.environments)
   const startEnvironment = useEnvironmentStore(s => s.startEnvironment)
   const nukeEnvironment = useEnvironmentStore(s => s.nukeEnvironment)
   const selectEnvironment = useEnvironmentStore(s => s.selectEnvironment)
   const fetchTables = useDatabaseStore(s => s.fetchTables)
   const reset = useDatabaseStore(s => s.reset)

   useEffect(() => {
      if (!selectedEnvironmentId) {
         setStuckEnvId(null)
      } else if (stuckEnvId === null && !isRestoring) {
         const env = environments.find(e => e.id === selectedEnvironmentId)
         if (env && env.status === "stopped" && env.containerId) {
            setStuckEnvId(env.id)
         }
      }
   }, [selectedEnvironmentId, environments, stuckEnvId, isRestoring])

   useEffect(() => {
      return () => {
         cleanupRef.current?.()
      }
   }, [])

   const handleRestoreEnv = useCallback(async () => {
      if (!stuckEnvId) return

      setIsRestoring(true)
      setRestoreProgress(0)
      setRestoreLabel("Starting...")

      const env = environments.find(e => e.id === stuckEnvId)
      const dbType = env?.dbType ?? "postgres"

      cleanupRef.current = api.docker.onRestoreProgress((progress, label) => {
         setRestoreProgress(progress)
         setRestoreLabel(label)
      })

      try {
         const result = await startEnvironment(stuckEnvId)
         cleanupRef.current?.()
         cleanupRef.current = null

         if (result.isOk()) {
            setRestoreProgress(100)
            setRestoreLabel("Restore complete")

            reset(stuckEnvId)
            await fetchTables(stuckEnvId, dbType as import("@sqlose/shared").DBType)

            toast.success("Database restored successfully.")
            setIsRestoring(false)
            setStuckEnvId(null)
         } else {
            toast.error("Failed to restore database")
            setIsRestoring(false)
         }
      } catch {
         cleanupRef.current?.()
         cleanupRef.current = null
         toast.error("Failed to restore database")
         setIsRestoring(false)
      }
   }, [stuckEnvId, startEnvironment, fetchTables, reset])

   const handleExitAndNuke = useCallback(async () => {
      if (stuckEnvId) {
         await nukeEnvironment(stuckEnvId)
         selectEnvironment(null)
         setStuckEnvId(null)
      }
   }, [stuckEnvId, nukeEnvironment, selectEnvironment])

   const stuckEnv = stuckEnvId ? (environments.find(e => e.id === stuckEnvId) ?? null) : null

   return {
      stuckEnvId,
      stuckEnv,
      handleRestoreEnv,
      handleExitAndNuke,
      isRestoring,
      restoreProgress,
      restoreLabel,
   }
}
