import { ipcRenderer, contextBridge } from "electron"
import type { IPCChannel, IPCRequest, IPCResponse } from "@sqlose/shared"
import type { IPCSerializedResult } from "./ipc-handlers"

function createInvoke<C extends IPCChannel>(channel: C) {
   return (request: IPCRequest<C>): Promise<IPCSerializedResult<IPCResponse<C>>> =>
      ipcRenderer.invoke(channel, request)
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
}

contextBridge.exposeInMainWorld("sqlose", api)

export type SqloseAPI = typeof api
