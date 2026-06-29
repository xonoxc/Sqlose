import { ipcRenderer, contextBridge } from "electron"
import type { IPCChannel, IPCRequest, IPCResponse } from "@sqlose/shared"
import type { IPCSerializedResult } from "./ipc-handlers"
import type { SavedQuery, HistoryEntry } from "../src/lib/types"
import type { UpdateInfo, ProgressInfo } from "electron-updater"

function createInvoke<C extends IPCChannel>(channel: C) {
   return (request: IPCRequest<C>): Promise<IPCSerializedResult<IPCResponse<C>>> =>
      ipcRenderer.invoke(channel, request)
}

type DbResult<T> = { success: true; data: T } | { success: false; error: string }

function dbInvoke<T>(channel: string, ...args: unknown[]): Promise<DbResult<T>> {
   return ipcRenderer.invoke(channel, ...args) as Promise<DbResult<T>>
}

type UpdateAvailableInfo = UpdateInfo & { isPackageManaged: boolean }

const api = {
   docker: {
      startEnv: createInvoke("docker:start-env"),
      stopEnv: createInvoke("docker:stop-env"),
      restartEnv: createInvoke("docker:restart-env"),
      health: createInvoke("docker:health"),
      cleanup: createInvoke("docker:cleanup"),
      pullImage: createInvoke("docker:pull-image"),
      createContainer: createInvoke("docker:create-container"),
      checkAvailable: createInvoke("docker:check-available"),
      onPullProgress: (callback: (dbType: string, percentage: number) => void) => {
         const handler = (
            _event: Electron.IpcRendererEvent,
            data: { dbType: string; percentage: number }
         ) => {
            callback(data.dbType, data.percentage)
         }
         ipcRenderer.on("docker:pull-progress", handler)
         return () => ipcRenderer.removeListener("docker:pull-progress", handler)
      },
      onRestoreProgress: (callback: (progress: number, label: string) => void) => {
         const handler = (
            _event: Electron.IpcRendererEvent,
            data: { progress: number; label: string }
         ) => {
            callback(data.progress, data.label)
         }
         ipcRenderer.on("docker:restore-progress", handler)
         return () => ipcRenderer.removeListener("docker:restore-progress", handler)
      },
   },
   env: {
      create: createInvoke("env:create"),
      destroy: createInvoke("env:destroy"),
      list: createInvoke("env:list"),
      get: createInvoke("env:get"),
      duplicate: createInvoke("env:duplicate"),
      reset: createInvoke("env:reset"),
      nuke: createInvoke("env:nuke"),
   },
   query: {
      execute: createInvoke("query:execute"),
   },
   import: {
      csv: createInvoke("import:csv"),
      sql: createInvoke("import:sql"),
      previewCSV: createInvoke("import:preview-csv"),
   },
   dataset: {
      list: createInvoke("dataset:list"),
      import: createInvoke("dataset:import"),
   },
   db: {
      get: (key: string) => dbInvoke<string | null>("db:get", key),
      set: (key: string, value: string) => dbInvoke<void>("db:set", key, value),
      delete: (key: string) => dbInvoke<void>("db:delete", key),
      getSavedQueries: (environmentId?: string | null) =>
         dbInvoke<SavedQuery[]>("db:get-saved-queries", environmentId),
      saveQuery: (
         id: string,
         name: string,
         sql: string,
         tags: string[],
         environmentId: string | null,
         result: string | null
      ) => dbInvoke<void>("db:save-query", id, name, sql, tags, environmentId, result),
      updateQuery: (id: string, name: string, sql: string, tags: string[], result: string | null) =>
         dbInvoke<boolean>("db:update-query", id, name, sql, tags, result),
      deleteQuery: (id: string) => dbInvoke<void>("db:delete-query", id),
      getHistory: (environmentId?: string | null, limit?: number) =>
         dbInvoke<HistoryEntry[]>("db:get-history", environmentId, limit),
      addHistoryEntry: (
         id: string,
         sql: string,
         environmentId: string | null,
         dbType: string,
         duration: number,
         rowCount: number,
         status: string,
         error: string | null,
         executedAt: string,
         result: string | null
      ) =>
         dbInvoke<void>(
            "db:add-history-entry",
            id,
            sql,
            environmentId,
            dbType,
            duration,
            rowCount,
            status,
            error,
            executedAt,
            result
         ),
      deleteHistoryEntry: (id: string) => dbInvoke<void>("db:delete-history-entry", id),
      clearHistory: () => dbInvoke<void>("db:clear-history"),
   },
   update: {
      onUpdateAvailable: (callback: (info: UpdateAvailableInfo) => void) => {
         const handler = (_event: Electron.IpcRendererEvent, info: UpdateAvailableInfo) =>
            callback(info)
         ipcRenderer.on("update-available", handler)
         return () => ipcRenderer.removeListener("update-available", handler)
      },
      onDownloadProgress: (callback: (progress: ProgressInfo) => void) => {
         const handler = (_event: Electron.IpcRendererEvent, progress: ProgressInfo) =>
            callback(progress)
         ipcRenderer.on("download-progress", handler)
         return () => ipcRenderer.removeListener("download-progress", handler)
      },
      onUpdateDownloaded: (callback: () => void) => {
         const handler = () => callback()
         ipcRenderer.on("update-downloaded", handler)
         return () => ipcRenderer.removeListener("update-downloaded", handler)
      },
      onUpdateError: (callback: (message: string) => void) => {
         const handler = (_event: Electron.IpcRendererEvent, message: string) => callback(message)
         ipcRenderer.on("update-error", handler)
         return () => ipcRenderer.removeListener("update-error", handler)
      },
      downloadUpdate: () => ipcRenderer.invoke("update:download"),
      quitAndInstall: () => ipcRenderer.invoke("update:quit-and-install"),
   },
}

contextBridge.exposeInMainWorld("sqlose", api)

export type SqloseAPI = typeof api
