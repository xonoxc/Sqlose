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
   win?.webContents?.send("update-available", { ...info, isPackageManaged })
})

autoUpdater.on("download-progress", progress => {
   win?.webContents?.send("download-progress", progress)
})

autoUpdater.on("update-downloaded", () => {
   win?.webContents?.send("update-downloaded")
})

autoUpdater.on("error", err => {
   win?.webContents?.send("update-error", err?.message ?? String(err))
})

ipcMain.handle("update:download", () => {
   autoUpdater.downloadUpdate()
})

ipcMain.handle("update:quit-and-install", () => {
   autoUpdater.quitAndInstall()
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

   if (!VITE_DEV_SERVER_URL) autoUpdater.checkForUpdates()
})
