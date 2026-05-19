import type { Result } from "neverthrow"
import type { AppError } from "./errors"
import type {
   DBType,
   Environment,
   QueryResult,
   Dataset,
   ImportPayload,
   ImportResult,
} from "./types"

export const IPC_CHANNELS = [
   "docker:start-env",
   "docker:stop-env",
   "docker:restart-env",
   "docker:health",
   "docker:cleanup",
   "docker:pull-image",
   "docker:create-container",
   "env:create",
   "env:destroy",
   "env:list",
   "env:get",
   "env:duplicate",
   "env:reset",
   "env:nuke",
   "query:execute",
   "import:csv",
   "import:sql",
   "import:preview-csv",
   "dataset:list",
   "dataset:import",
] as const

export type IPCChannel = (typeof IPC_CHANNELS)[number]

export interface IPCRequestMap {
   "docker:start-env": { environmentId: string }
   "docker:stop-env": { environmentId: string }
   "docker:restart-env": { environmentId: string }
   "docker:health": { environmentId: string }
   "docker:cleanup": Record<string, never>
   "docker:pull-image": { dbType: DBType }
   "docker:create-container": { environmentId: string }
   "env:create": { dbType: DBType; name?: string }
   "env:destroy": { environmentId: string }
   "env:list": Record<string, never>
   "env:get": { environmentId: string }
   "env:duplicate": { environmentId: string }
   "env:reset": { environmentId: string }
   "env:nuke": { environmentId: string }
   "query:execute": { environmentId: string; sql: string }
   "import:csv": ImportPayload & { format: "csv" }
   "import:sql": ImportPayload & { format: "sql" }
   "import:preview-csv": { content: string }
   "dataset:list": Record<string, never>
   "dataset:import": { datasetId: string; environmentId: string }
}

export interface IPCResponseMap {
   "docker:start-env": { environmentId: string; port: number; connectionString: string }
   "docker:stop-env": { environmentId: string }
   "docker:restart-env": { environmentId: string }
   "docker:health": { healthy: boolean; uptime: number }
   "docker:cleanup": { cleaned: number }
   "docker:pull-image": { image: string }
   "docker:create-container": Environment
   "env:create": Environment
   "env:destroy": { environmentId: string }
   "env:list": Environment[]
   "env:get": Environment
   "env:duplicate": Environment
   "env:reset": Environment
   "env:nuke": { environmentId: string }
   "query:execute": QueryResult
   "import:csv": ImportResult
   "import:sql": { tablesCreated: string[] }
   "import:preview-csv": { columns: string[]; preview: Record<string, string>[] }
   "dataset:list": Dataset[]
   "dataset:import": { tablesCreated: string[] }
}

export type IPCRequest<C extends IPCChannel> = C extends keyof IPCRequestMap
   ? IPCRequestMap[C]
   : never

export type IPCResponse<C extends IPCChannel> = C extends keyof IPCResponseMap
   ? IPCResponseMap[C]
   : never

export type IPCHandler<C extends IPCChannel> = (
   request: IPCRequest<C>
) => Promise<Result<IPCResponse<C>, AppError>>

export type IPCChannelGroup = "docker" | "env" | "query" | "import" | "dataset"

export const IPC_CHANNEL_GROUPS: Record<IPCChannel, IPCChannelGroup> = {
   "docker:start-env": "docker",
   "docker:stop-env": "docker",
   "docker:restart-env": "docker",
   "docker:health": "docker",
   "docker:cleanup": "docker",
   "docker:pull-image": "docker",
   "docker:create-container": "docker",
   "env:create": "env",
   "env:destroy": "env",
   "env:list": "env",
   "env:get": "env",
   "env:duplicate": "env",
   "env:reset": "env",
   "env:nuke": "env",
   "query:execute": "query",
   "import:csv": "import",
   "import:sql": "import",
   "import:preview-csv": "import",
   "dataset:list": "dataset",
   "dataset:import": "dataset",
}
