import { useState, useEffect } from "react"
import { api } from "~/lib/api"

let _cachedStatus: boolean | null = null

/**
 * Hook that queries the main process to determine if Docker is available.
 * Caches the result so subsequent mounts don't re-query.
 */
export function useDockerStatus() {
   const [dockerAvailable, setDockerAvailable] = useState<boolean | null>(_cachedStatus)

   useEffect(() => {
      if (_cachedStatus !== null) return

      api.docker.checkAvailable().then(result => {
         const available = result.isOk() ? result.value.available : false
         _cachedStatus = available
         setDockerAvailable(available)
      })
   }, [])

   return { dockerAvailable }
}
