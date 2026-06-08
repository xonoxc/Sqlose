import { useEffect, useRef } from "react"
import { toast } from "sonner"

export function useUpdateToast() {
   const downloadingToastRef = useRef<string | number | null>(null)

   useEffect(() => {
      const unsubAvailable = window.sqlose.update.onUpdateAvailable(info => {
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
         console.error("Update error:", message)
      })

      return () => {
         unsubAvailable()
         unsubProgress()
         unsubDownloaded()
         unsubError()
      }
   }, [])
}
