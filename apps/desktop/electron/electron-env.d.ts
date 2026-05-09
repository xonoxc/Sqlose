/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
   interface ProcessEnv {
      APP_ROOT: string
      VITE_PUBLIC: string
   }
}

interface Window {
   sqlose: import("./preload").SqloseAPI
}
