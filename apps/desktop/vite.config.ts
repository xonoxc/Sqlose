import { defineConfig } from "vite"
import path from "node:path"
import { existsSync, readdirSync } from "node:fs"
import electron from "vite-plugin-electron/simple"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

const DESKTOP_DIR = __dirname

// Task runners such as turbo strip the Wayland session vars (WAYLAND_DISPLAY,
// HYPRLAND_INSTANCE_SIGNATURE, XDG_SESSION_TYPE) from dev task env. Electron
// reads them at process spawn, so they must be set before it starts or the
// window comes up as a double-scaled (1228x768 instead of 1536x960) blank
// surface. The vite process spawns electron, so heal here.
function healSessionEnv() {
   if (process.platform !== "linux") return
   const runtimeDir = process.env.XDG_RUNTIME_DIR ?? (process.getuid ? `/run/user/${process.getuid()}` : null)
   if (!runtimeDir || !existsSync(runtimeDir)) return
   if (!process.env.WAYLAND_DISPLAY) {
      const name = readdirSync(runtimeDir).find(e => e.startsWith("wayland-") && !e.includes("."))
      if (name) process.env.WAYLAND_DISPLAY = name
   }
   if (process.env.WAYLAND_DISPLAY && !process.env.XDG_SESSION_TYPE) {
      process.env.XDG_SESSION_TYPE = "wayland"
   }
   if (!process.env.HYPRLAND_INSTANCE_SIGNATURE) {
      const hyprDir = path.join(runtimeDir, "hypr")
      if (existsSync(hyprDir)) {
         const sig = readdirSync(hyprDir, { withFileTypes: true }).find(
            d => d.isDirectory() && existsSync(path.join(hyprDir, d.name, ".socket.sock"))
         )?.name
         if (sig) process.env.HYPRLAND_INSTANCE_SIGNATURE = sig
      }
   }
}
healSessionEnv()

// Native Node.js packages that must NOT be bundled by Rollup.
const NATIVE_EXTERNALS = [
   "sqlite3",
   "pg",
   "pg-native",
   "mysql2",
   "dockerode",
   "electron-store",
   "sql.js",
   "font-list",
]

export default defineConfig({
   plugins: [
      react({
         babel: {
            plugins: [["babel-plugin-react-compiler", {}]],
         },
      }),
      tailwindcss(),
      electron({
         main: {
            entry: "electron/main.ts",
            vite: {
               resolve: {
                  alias: {
                     "@sqlose/shared": path.resolve(DESKTOP_DIR, "../../packages/shared/src"),
                     "@sqlose/core": path.resolve(DESKTOP_DIR, "../../packages/core/src"),
                  },
               },
               build: {
                  rollupOptions: {
                     external: (id: string) => {
                        // Externalize native packages and their subpaths (e.g. "sqlite3/lib/...")
                        if (id.endsWith(".node")) {
                           return true
                        }
                        for (const ext of NATIVE_EXTERNALS) {
                           if (id === ext || id.startsWith(ext + "/")) {
                              return true
                           }
                        }
                        return false
                     },
                  },
               },
            },
         },
         preload: {
            input: path.join(DESKTOP_DIR, "electron/preload.ts"),
            vite: {
               resolve: {
                  alias: {
                     "@sqlose/shared": path.resolve(DESKTOP_DIR, "../../packages/shared/src"),
                  },
               },
               build: {
                  rollupOptions: {
                     output: {
                        format: "es",
                     },
                  },
               },
            },
         },
      }),
   ],
   resolve: {
      alias: {
         "~": path.resolve(DESKTOP_DIR, "src"),
         "@sqlose/shared": path.resolve(DESKTOP_DIR, "../../packages/shared/src"),
         "@sqlose/ui": path.resolve(DESKTOP_DIR, "../../packages/ui/src"),
         "@sqlose/core": path.resolve(DESKTOP_DIR, "../../packages/core/src"),
      },
   },
})
