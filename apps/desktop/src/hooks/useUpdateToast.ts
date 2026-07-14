import { useEffect, useRef } from "react"
import { toast } from "sonner"

export function useUpdateToast() {
   const downloadingToastRef = useRef<string | number | null>(null)

   useEffect(() => {
      // Check current state on mount
      window.sqlose.update.getState().then(state => {
         if (state.state === "checking") {
            toast.loading("Checking for updates...", { id: "update-checking" })
         } else if (state.state === "error") {
            toast.error("Update Check Failed", {
               description: state.message,
               action: {
                  label: "Retry",
                  onClick: () => window.sqlose.update.downloadUpdate(),
               },
               duration: 10_000,
            })
         }
      })

      const unsubAvailable = window.sqlose.update.onUpdateAvailable(info => {
         toast.dismiss("update-checking")

         if (info.isPackageManaged) {
            toast.info("Update Available", {
               description: `Sqlose v${info.version} is available — use your package manager to upgrade.`,
               duration: 10_000,
            })
            return
         }

         toast("Update Available", {
            description: `Sqlose v${info.version} is ready to download.`,
            action: {
               label: "Download",
               onClick: () => {
                  window.sqlose.update.downloadUpdate()
               },
            },
            duration: 10_000,
         })
      })

      const unsubProgress = window.sqlose.update.onDownloadProgress(progress => {
         if (downloadingToastRef.current != null) {
            toast.loading("Downloading update...", {
               id: downloadingToastRef.current,
               description: `${Math.round(progress.percent)}%`,
            })
         } else {
            const id = toast.loading("Downloading update...", {
               description: `${Math.round(progress.percent)}%`,
            })
            downloadingToastRef.current = id
         }
      })

      const unsubDownloaded = window.sqlose.update.onUpdateDownloaded(() => {
         downloadingToastRef.current = null
         toast.success("Update Ready", {
            description: "Restart to install the latest version.",
            action: {
               label: "Install Now",
               onClick: () => {
                  window.sqlose.update.quitAndInstall()
               },
            },
            duration: Infinity,
         })
      })

      const unsubError = window.sqlose.update.onUpdateError(message => {
         downloadingToastRef.current = null
         toast.error("Update Check Failed", {
            description: message,
            action: {
               label: "Retry",
               onClick: () => window.sqlose.update.downloadUpdate(),
            },
            duration: 10_000,
         })
      })

      return () => {
         unsubAvailable()
         unsubProgress()
         unsubDownloaded()
         unsubError()
      }
   }, [])
}
