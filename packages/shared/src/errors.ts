import { Result, ok, err } from "neverthrow"

export const ERROR_CODES = [
   "docker:container_failed",
   "docker:port_conflict",
   "docker:health_timeout",
   "docker:cleanup_failed",
   "docker:list_failed",
   "docker:pull_failed",
   "docker:stop_failed",
   "docker:not_available",
   "env:not_found",
   "env:already_running",
   "env:not_running",
   "env:create_failed",
   "env:destroy_failed",
   "env:duplicate_name",
   "env:start_failed",
   "env:stop_failed",
   "env:duplicate_failed",
   "query:execution_failed",
   "query:invalid_syntax",
   "query:connection_failed",
   "query:timeout",
   "import:parse_failed",
   "import:schema_inference_failed",
   "import:write_failed",
   "ipc:invalid_payload",
   "ipc:handler_not_found",
   "ipc:unauthorized",
   "db:error",
   "vim:mode_error",
   "vim:command_error",
] as const

export type ErrorCode = (typeof ERROR_CODES)[number]

type DockerErrorCode = Extract<ErrorCode, `docker:${string}`>
type EnvironmentErrorCode = Extract<ErrorCode, `env:${string}`>
type QueryErrorCode = Extract<ErrorCode, `query:${string}`>
type ImportErrorCode = Extract<ErrorCode, `import:${string}`>
type IPCErrorCode = Extract<ErrorCode, `ipc:${string}`>
type VimErrorCode = Extract<ErrorCode, `vim:${string}`>

export const ERROR_CATEGORIES = ["docker", "env", "query", "import", "ipc", "db", "vim"] as const

export type ErrorCategory = (typeof ERROR_CATEGORIES)[number]

const getCategory = (code: ErrorCode): ErrorCategory => code.split(":")[0] as ErrorCategory

export class AppError extends Error {
   public readonly code: ErrorCode
   public readonly category: ErrorCategory

   constructor(code: ErrorCode, message?: string) {
      super(message ?? code)
      this.name = "AppError"
      this.code = code
      this.category = getCategory(code)
   }

   toJSON() {
      return {
         name: this.name,
         code: this.code,
         category: this.category,
         message: this.message,
      }
   }
}

export class DockerError extends AppError {
   constructor(code: DockerErrorCode, message?: string) {
      super(code, message)
      this.name = "DockerError"
   }
}

export class EnvironmentError extends AppError {
   constructor(code: EnvironmentErrorCode, message?: string) {
      super(code, message)
      this.name = "EnvironmentError"
   }
}

export class QueryError extends AppError {
   constructor(code: QueryErrorCode, message?: string) {
      super(code, message)
      this.name = "QueryError"
   }
}

export class ImportError extends AppError {
   constructor(code: ImportErrorCode, message?: string) {
      super(code, message)
      this.name = "ImportError"
   }
}

export class IPCError extends AppError {
   constructor(code: IPCErrorCode, message?: string) {
      super(code, message)
      this.name = "IPCError"
   }
}

export class VimError extends AppError {
   constructor(code: VimErrorCode, message?: string) {
      super(code, message)
      this.name = "VimError"
   }
}

export type AppResult<T> = Result<T, AppError>
export type AsyncAppResult<T> = Promise<AppResult<T>>

export const okResult = <T>(value: T): AppResult<T> => ok(value)
export const errResult = <T>(code: ErrorCode, message?: string): AppResult<T> =>
   err(new AppError(code, message))
