import { ipcRenderer, contextBridge } from "electron"
import type { IPCChannel, IPCRequest, IPCResponse } from "@sqlose/shared"
import type { IPCSerializedResult } from "./ipc-handlers"
import type { SavedQuery, HistoryEntry } from "../src/lib/types"

function createInvoke<C extends IPCChannel>(channel: C) {
   return (request: IPCRequest<C>): Promise<IPCSerializedResult<IPCResponse<C>>> =>
      ipcRenderer.invoke(channel, request)
}

type DbResult<T> =
   | { success: true; data: T }
   | { success: false; error: string }

function dbInvoke<T>(channel: string, ...args: unknown[]): Promise<DbResult<T>> {
   return ipcRenderer.invoke(channel, ...args) as Promise<DbResult<T>>
}

const api = {
   docker: {
      startEnv: createInvoke("docker:start-env"),
      stopEnv: createInvoke("docker:stop-env"),
      restartEnv: createInvoke("docker:restart-env"),
      health: createInvoke("docker:health"),
      cleanup: createInvoke("docker:cleanup"),
      pullImage: createInvoke("docker:pull-image"),
      createContainer: createInvoke("docker:create-container"),
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
         environmentId: string | null
      ) => dbInvoke<void>("db:save-query", id, name, sql, tags, environmentId),
      updateQuery: (id: string, name: string, sql: string, tags: string[]) =>
         dbInvoke<boolean>("db:update-query", id, name, sql, tags),
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
         executedAt: string
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
            executedAt
         ),
      deleteHistoryEntry: (id: string) => dbInvoke<void>("db:delete-history-entry", id),
      clearHistory: () => dbInvoke<void>("db:clear-history"),
   },
}

contextBridge.exposeInMainWorld("sqlose", api)

export type SqloseAPI = typeof api
