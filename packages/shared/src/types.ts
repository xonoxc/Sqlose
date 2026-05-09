export const DB_TYPES = ["postgres", "mysql", "sqlite"] as const
export type DBType = (typeof DB_TYPES)[number]

export const ENVIRONMENT_STATUSES = [
   "creating",
   "running",
   "stopped",
   "error",
   "destroyed",
] as const
export type EnvironmentStatus = (typeof ENVIRONMENT_STATUSES)[number]

export const DATASET_CATEGORIES = ["ecommerce", "analytics", "social", "finance"] as const
export type DatasetCategory = (typeof DATASET_CATEGORIES)[number]

export const IMPORT_FORMATS = ["csv", "sql"] as const
export type ImportFormat = (typeof IMPORT_FORMATS)[number]

export interface Environment {
   id: string
   name: string
   dbType: DBType
   status: EnvironmentStatus
   port: number
   uptime: number | null
   connectionString: string
   containerId: string | null
   createdAt: string
}

export interface QueryResult {
   columns: string[]
   rows: Record<string, unknown>[]
   rowCount: number
   executionTimeMs: number
}

export interface QueryHistory {
   id: string
   environmentId: string
   sql: string
   result: QueryResult | null
   error: string | null
   executedAt: string
}

export interface Dataset {
   id: string
   name: string
   description: string
   category: DatasetCategory
   dbTypes: DBType[]
}

export interface ImportPayload {
   environmentId: string
   fileName: string
   content: string
   format: ImportFormat
   tableName?: string
}

export interface ImportResult {
   tableName: string
   rowCount: number
   columns: string[]
}
