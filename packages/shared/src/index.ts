export {
   ERROR_CODES,
   ERROR_CATEGORIES,
   AppError,
   DockerError,
   EnvironmentError,
   QueryError,
   ImportError,
   IPCError,
   VimError,
   okResult,
   errResult,
} from "./errors"
export type { ErrorCode, ErrorCategory, AppResult, AsyncAppResult } from "./errors"

export { DB_TYPES, ENVIRONMENT_STATUSES, DATASET_CATEGORIES, IMPORT_FORMATS } from "./types"
export type {
   DBType,
   EnvironmentStatus,
   DatasetCategory,
   ImportFormat,
   Environment,
   QueryResult,
   QueryHistory,
   Dataset,
   ImportPayload,
   ImportResult,
} from "./types"

export { IPC_CHANNELS, IPC_CHANNEL_GROUPS } from "./ipc"
export type {
   IPCChannel,
   IPCRequestMap,
   IPCResponseMap,
   IPCRequest,
   IPCResponse,
   IPCHandler,
   IPCChannelGroup,
   DockerAvailability,
   DockerAvailabilityReason,
} from "./ipc"

export { isErrorCode, isAppError, isDBType } from "./guards"
