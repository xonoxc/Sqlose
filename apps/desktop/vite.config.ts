import { defineConfig } from "vite"
import path from "node:path"
import electron from "vite-plugin-electron/simple"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

const DESKTOP_DIR = __dirname

// Native Node.js packages that must NOT be bundled by Rollup.
const NATIVE_EXTERNALS = [
   "sqlite3",
   "pg",
   "pg-native",
   "mysql2",
   "dockerode",
   "electron-store",
   "sql.js",
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
                        if (id.endsWith(".node")) return true
                        for (const ext of NATIVE_EXTERNALS) {
                           if (id === ext || id.startsWith(ext + "/")) return true
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
