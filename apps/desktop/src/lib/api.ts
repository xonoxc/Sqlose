import { ok, err, type Result } from "neverthrow"
import { AppError, type ErrorCode } from "@sqlose/shared"
import type { DBType, ImportPayload } from "@sqlose/shared"

type SerializedError = { code: string; message: string }
type SerializedResult<T> =
   | {
        success: true
        data: T
     }
   | {
        success: false
        error: SerializedError
     }

function deserializeResult<T>(serialized: SerializedResult<T>): Result<T, AppError> {
   if (serialized.success) {
      return ok(serialized.data)
   }
   const errorCode = serialized.error.code as ErrorCode
   return err(new AppError(errorCode, serialized.error.message))
}

function getSqloseAPI(): typeof window.sqlose {
   if (typeof window === "undefined" || typeof window.sqlose === "undefined") {
      throw new Error("sqlose API not available - running outside Electron renderer context")
   }
   return window.sqlose
}

export const api = {
   docker: {
      async startEnv(environmentId: string) {
         const api = getSqloseAPI()
         const result = await api.docker.startEnv({ environmentId })
         return deserializeResult(result)
      },

      async stopEnv(environmentId: string) {
         const api = getSqloseAPI()
         const result = await api.docker.stopEnv({ environmentId })
         return deserializeResult(result)
      },

      async restartEnv(environmentId: string) {
         const api = getSqloseAPI()
         const result = await api.docker.restartEnv({ environmentId })
         return deserializeResult(result)
      },

      async health(environmentId: string) {
         const api = getSqloseAPI()
         const result = await api.docker.health({ environmentId })
         return deserializeResult(result)
      },

      async cleanup() {
         const api = getSqloseAPI()
         const result = await api.docker.cleanup({})
         return deserializeResult(result)
      },

      async pullImage(dbType: DBType) {
         const api = getSqloseAPI()
         const result = await api.docker.pullImage({ dbType })
         return deserializeResult(result)
      },

      async createContainer(environmentId: string) {
         const api = getSqloseAPI()
         const result = await api.docker.createContainer({ environmentId })
         return deserializeResult(result)
      },
   },

   env: {
      async create(dbType: DBType, name?: string) {
         const api = getSqloseAPI()
         const result = await api.env.create({ dbType, name })
         return deserializeResult(result)
      },

      async destroy(environmentId: string) {
         const api = getSqloseAPI()
         const result = await api.env.destroy({ environmentId })
         return deserializeResult(result)
      },

      async list() {
         const api = getSqloseAPI()
         const result = await api.env.list({})
         return deserializeResult(result)
      },

      async get(environmentId: string) {
         const api = getSqloseAPI()
         const result = await api.env.get({ environmentId })
         return deserializeResult(result)
      },

      async duplicate(environmentId: string) {
         const api = getSqloseAPI()
         const result = await api.env.duplicate({ environmentId })
         return deserializeResult(result)
      },

      async reset(environmentId: string) {
         const api = getSqloseAPI()
         const result = await api.env.reset({ environmentId })
         return deserializeResult(result)
      },
   },

   query: {
      async execute(environmentId: string, sql: string) {
         const api = getSqloseAPI()
         const result = await api.query.execute({ environmentId, sql })
         return deserializeResult(result)
      },
   },

   import: {
      async csv(payload: Omit<ImportPayload, "format"> & { format?: "csv" }) {
         const api = getSqloseAPI()
         const result = await api.import.csv({ ...payload, format: "csv" })
         return deserializeResult(result)
      },

      async sql(payload: Omit<ImportPayload, "format"> & { format?: "sql" }) {
         const api = getSqloseAPI()
         const result = await api.import.sql({ ...payload, format: "sql" })
         return deserializeResult(result)
      },

      async previewCSV(content: string) {
         const api = getSqloseAPI()
         const result = await api.import.previewCSV({ content })
         return deserializeResult(result)
      },
   },

   dataset: {
      async list() {
         const api = getSqloseAPI()
         const result = await api.dataset.list({})
         return deserializeResult(result)
      },

      async import(datasetId: string, environmentId: string) {
         const api = getSqloseAPI()
         const result = await api.dataset.import({ datasetId, environmentId })
         return deserializeResult(result)
      },
   },
}

export type Api = typeof api
