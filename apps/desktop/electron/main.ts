// CJS compat shims for bundled packages
import { fileURLToPath } from "node:url"
import path from "node:path"
import { execFileSync } from "node:child_process"
import { app, BrowserWindow, dialog, ipcMain } from "electron"
import { autoUpdater } from "electron-updater"
import type { DockerAvailability } from "@sqlose/shared"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
import { attemptSync } from "@sqlose/shared"
import {
   initDocker,
   stopOrphanedContainers,
   reconcileEnvironmentStatuses,
   stopAllContainers,
   countRunningContainers,
} from "@sqlose/core"
import { registerAllHandlers } from "./ipc-handlers"
import { initDatabase, closeDatabase } from "./db"
import { registerDbHandlers } from "./db-handlers"

process.env.APP_ROOT = path.join(__dirname, "..")

// Wayland support for Linux: force native Wayland when running under a Wayland session
if (process.platform === "linux") {
   if (process.env.WAYLAND_DISPLAY) {
      app.commandLine.appendSwitch("ozone-platform", "wayland")
   }
   app.commandLine.appendSwitch("enable-features", "WaylandWindowDecorations")
   app.commandLine.appendSwitch("enable-wayland-ime")
}

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"]
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron")
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist")

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
   ? path.join(process.env.APP_ROOT, "public")
   : RENDERER_DIST

let win: BrowserWindow | null
let dockerAvailable = false
let updatePollingInterval: ReturnType<typeof setInterval> | null = null

type UpdateState =
   | { state: "idle" }
   | { state: "checking" }
   | { state: "available"; version: string; releaseNotes?: string }
   | { state: "downloading"; version: string }
   | { state: "downloaded" }
   | { state: "error"; message: string }

let updateState: UpdateState = { state: "idle" }
const MAX_RETRY_ATTEMPTS = 3
const BACKOFF_BASE_MS = 2000
const POLL_INTERVAL_MS = 4 * 60 * 60 * 1000 // 4 hours

function sendUpdateToRenderer(channel: string, ...args: unknown[]) {
   win?.webContents?.send(channel, ...args)
}

function setUpdateState(newState: UpdateState) {
   updateState = newState
   sendUpdateToRenderer("update-state-changed", newState)
}

function checkForUpdatesWithRetry(attempt: number = 0) {
   setUpdateState({ state: "checking" })

   autoUpdater
      .checkForUpdates()
      .then(() => {
         // Success — reset is handled by the update-available or "no update" path
         // If no update is available, electron-updater doesn't fire update-available,
         // so we reset to idle and start polling
         if (updateState.state === "checking") {
            setUpdateState({ state: "idle" })
            startUpdatePolling()
         }
      })
      .catch(err => {
         if (attempt < MAX_RETRY_ATTEMPTS - 1) {
            const delay = BACKOFF_BASE_MS * Math.pow(2, attempt)
            setTimeout(() => checkForUpdatesWithRetry(attempt + 1), delay)
         } else {
            const message = err?.message ?? String(err)
            setUpdateState({ state: "error", message })
            sendUpdateToRenderer("update-error", message)
         }
      })
}

function startUpdatePolling() {
   if (updatePollingInterval) return
   updatePollingInterval = setInterval(() => {
      checkForUpdatesWithRetry(0)
   }, POLL_INTERVAL_MS)
}

function isDockerCliInstalled(): boolean {
   return attemptSync(() => {
      execFileSync("docker", ["--version"], { stdio: "ignore" })
      return true
   }).unwrapOr(false)
}

function dockerUnavailableStatus(): DockerAvailability {
   const cliInstalled = isDockerCliInstalled()
   const isWindows = process.platform === "win32"
   const isLinux = process.platform === "linux"

   if (!cliInstalled) {
      return {
         available: false,
         reason: "not-installed",
         title: isWindows ? "Docker Desktop Not Installed" : "Docker Not Installed",
         message: isWindows
            ? "Docker Desktop is not installed or is not available in PATH."
            : "Docker is not installed or is not available in PATH.",
         detail: isLinux
            ? "Install Docker Engine and make sure your user can access the Docker socket. SQLite will work without Docker."
            : "PostgreSQL and MySQL environments require Docker. SQLite will work without it.",
      }
   }

   if (isWindows) {
      return {
         available: false,
         reason: "not-running",
         title: "Docker Desktop Is Not Running",
         message: "Open Docker Desktop, then try creating the database again.",
         detail:
            "Tip: in Docker Desktop, enable Settings -> General -> Start Docker Desktop when you sign in.",
      }
   }

   if (isLinux) {
      return {
         available: false,
         reason: "not-running",
         title: "Docker Daemon Is Not Running",
         message: "Start the Docker daemon, then try creating the database again.",
         detail:
            "On Ubuntu, run `sudo systemctl start docker` and ensure your user has permission for /var/run/docker.sock. SQLite will work without Docker.",
      }
   }

   return {
      available: false,
      reason: "not-running",
      title: "Docker Is Not Running",
      message: "Start Docker, then try creating the database again.",
      detail: "PostgreSQL and MySQL environments require Docker. SQLite will work without it.",
   }
}

async function checkDockerAvailability(): Promise<DockerAvailability> {
   const dockerResult = await initDocker()
   dockerAvailable = dockerResult.isOk()

   if (dockerAvailable) {
      return {
         available: true,
         reason: "available",
         title: "Docker Available",
         message: "Docker is available.",
         detail: "",
      }
   }

   return dockerUnavailableStatus()
}

function createWindow() {
   win = new BrowserWindow({
      icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
      width: 1100,
      height: 750,
      webPreferences: {
         preload: path.join(__dirname, "preload.mjs"),
         sandbox: false,
         contextIsolation: true,
         nodeIntegration: false,
      },
      autoHideMenuBar: true,
   })

   if (VITE_DEV_SERVER_URL) {
      win.loadURL(VITE_DEV_SERVER_URL)
   } else {
      win.loadFile(path.join(RENDERER_DIST, "index.html"))
   }
}

const isPackageManaged =
   process.platform === "linux" &&
   (process.resourcesPath.startsWith("/usr/") || process.resourcesPath.startsWith("/snap/"))

autoUpdater.logger = console
autoUpdater.autoDownload = false

autoUpdater.on("update-available", info => {
   setUpdateState({
      state: "available",
      version: info.version,
      releaseNotes: Array.isArray(info.releaseNotes)
         ? info.releaseNotes.map(r => r.note).join("\n")
         : info.releaseNotes ?? undefined,
   })
   sendUpdateToRenderer("update-available", { ...info, isPackageManaged })
   startUpdatePolling()
})

autoUpdater.on("download-progress", progress => {
   sendUpdateToRenderer("download-progress", progress)
})

autoUpdater.on("update-downloaded", () => {
   setUpdateState({ state: "downloaded" })
   sendUpdateToRenderer("update-downloaded")
})

autoUpdater.on("error", err => {
   const message = err?.message ?? String(err)
   setUpdateState({ state: "error", message })
   sendUpdateToRenderer("update-error", message)
})

ipcMain.handle("update:download", () => {
   if (updateState.state === "available") {
      setUpdateState({ state: "downloading", version: updateState.version })
   }
   autoUpdater.downloadUpdate()
})

ipcMain.handle("update:quit-and-install", async () => {
   if (updateState.state !== "downloaded") return

   let activeQueries = 0
   let runningContainers = 0

   // Count running Docker containers
   if (dockerAvailable) {
      const containerResult = await countRunningContainers()
      if (containerResult.isOk()) {
         runningContainers = containerResult.value
      }
   }

   // Ask renderer for active query count
   if (win && !win.isDestroyed()) {
      try {
         activeQueries = await win.webContents.executeJavaScript(
            `window.__SQLOSE_ACTIVE_QUERY_COUNT__ ?? 0`
         )
      } catch {
         // Renderer not available, proceed without query check
      }
   }

   if (activeQueries > 0 || runningContainers > 0) {
      const details: string[] = []
      if (activeQueries > 0) details.push(`${activeQueries} active quer${activeQueries > 1 ? "ies" : "y"}`)
      if (runningContainers > 0) details.push(`${runningContainers} running container${runningContainers > 1 ? "s" : ""}`)

      const result = await dialog.showMessageBox(win!, {
         type: "warning",
         title: "Update Ready to Install",
         message: "There are active processes that will be interrupted:",
         detail: details.join("\n") + "\n\nInstall update now?",
         buttons: ["Install Now", "Cancel"],
         defaultId: 1,
         cancelId: 1,
      })

      if (result.response === 1) return

      // Gracefully stop containers before quitting
      if (runningContainers > 0) {
         try {
            await stopAllContainers()
         } catch (e) {
            console.error("Failed to stop containers:", e)
         }
      }
   }

   autoUpdater.quitAndInstall()
})

ipcMain.handle("update:get-state", () => {
   return updateState
})

app.on("window-all-closed", () => {
   if (process.platform !== "darwin") {
      app.quit()
      win = null
   }
})

app.on("activate", () => {
   if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
   }
})

app.on("will-quit", async () => {
   if (updatePollingInterval) {
      clearInterval(updatePollingInterval)
      updatePollingInterval = null
   }
   if (dockerAvailable) await stopAllContainers()
   closeDatabase()
})

app.whenReady().then(async () => {
   await initDatabase()

   const dockerStatus = await checkDockerAvailability()

   if (dockerAvailable) {
      await Promise.all([stopOrphanedContainers(), reconcileEnvironmentStatuses()])
   }

   ipcMain.handle("docker:check-available", async () => ({
      success: true,
      data: await checkDockerAvailability(),
   }))

   registerAllHandlers()
   registerDbHandlers()
   createWindow()

   if (!dockerAvailable) {
      win?.webContents.send("docker:not-available")
      dialog.showMessageBox(win!, {
         type: "warning",
         title: dockerStatus.title,
         message: dockerStatus.message,
         detail: dockerStatus.detail,
      })
   }

   if (!VITE_DEV_SERVER_URL) checkForUpdatesWithRetry(0)
})
