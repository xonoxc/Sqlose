import { ERROR_CODES, type ErrorCode, AppError } from "./errors"
import { DB_TYPES, type DBType } from "./types"

export function isErrorCode(value: unknown): value is ErrorCode {
   return typeof value === "string" && (ERROR_CODES as readonly string[]).includes(value)
}

export function isAppError(value: unknown): value is AppError {
   return value instanceof AppError
}

export function isDBType(value: unknown): value is DBType {
   return typeof value === "string" && (DB_TYPES as readonly string[]).includes(value)
}
