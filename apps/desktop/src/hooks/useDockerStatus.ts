import { useState, useEffect } from "react"
import type { DockerAvailability } from "@sqlose/shared"
import { api } from "~/lib/api"

let _cachedStatus: DockerAvailability | null = null

/**
 * Hook that queries the main process to determine if Docker is available.
 * Keeps retrying while Docker is unavailable so starting Docker/Desktop is picked up.
 */
export function useDockerStatus() {
   const [dockerStatus, setDockerStatus] = useState<DockerAvailability | null>(_cachedStatus)

   useEffect(() => {
      let cancelled = false
      let retryTimer: ReturnType<typeof setTimeout> | null = null

      const checkDocker = () => {
         api.docker.checkAvailable().then(result => {
            if (cancelled) return

            const status = result.isOk()
               ? result.value
               : {
                    available: false,
                    reason: "not-running" as const,
                    title: "Docker Is Not Available",
                    message: result.error.message,
                    detail:
                       "PostgreSQL and MySQL environments require Docker. SQLite will work without it.",
                 }
            _cachedStatus = status
            setDockerStatus(status)

            if (!status.available) {
               retryTimer = setTimeout(checkDocker, 5000)
            }
         })
      }

      checkDocker()

      return () => {
         cancelled = true
         if (retryTimer) clearTimeout(retryTimer)
      }
   }, [])

   return { dockerAvailable: dockerStatus?.available ?? null, dockerStatus }
}
