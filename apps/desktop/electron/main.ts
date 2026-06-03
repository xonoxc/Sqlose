// CJS compat shims for bundled packages
import { fileURLToPath } from "node:url"
import path from "node:path"
import { app, BrowserWindow, dialog } from "electron"
import { autoUpdater } from "electron-updater"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
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

// Wayland support for Linux: enable Ozone platform and native decorations
if (process.platform === "linux") {
   app.commandLine.appendSwitch("ozone-platform-hint", "auto")
   app.commandLine.appendSwitch("enable-features", "WaylandWindowDecorations")
   // Enable per-monitor DPI scaling on Wayland
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

function createWindow() {
   win = new BrowserWindow({
      icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
      width: 1100,
      height: 750,
      webPreferences: {
         preload: path.join(__dirname, "preload.mjs"),
         sandbox: true,
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

autoUpdater.logger = console
autoUpdater.autoDownload = false

autoUpdater.on("update-available", info => {
   win?.webContents?.send("update-available", info)
})

autoUpdater.on("download-progress", progress => {
   win?.webContents?.send("download-progress", progress)
})

autoUpdater.on("update-downloaded", () => {
   win?.webContents?.send("update-downloaded")
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

   const dockerResult = await initDocker()
   dockerAvailable = dockerResult.isOk()

   if (dockerAvailable) {
      await Promise.all([stopOrphanedContainers(), reconcileEnvironmentStatuses()])
   }

   registerAllHandlers()
   registerDbHandlers()
   createWindow()

   if (!dockerAvailable) {
      win?.webContents.send("docker:not-available")
      dialog.showMessageBox(win!, {
         type: "warning",
         title: "Docker Not Found",
         message: "Docker is not available on this system.",
         detail: "PostgreSQL and MySQL environments require Docker. SQLite will work without it.",
      })
   }

   if (!VITE_DEV_SERVER_URL) autoUpdater.checkForUpdatesAndNotify()
})
