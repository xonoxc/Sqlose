import { z } from "zod"
import { ERROR_CODES, type ErrorCode, AppError } from "./errors"
import { DB_TYPES, type DBType } from "./types"
import {
   ENVIRONMENT_STATUSES,
   IMPORT_FORMATS,
   type EnvironmentStatus,
   type Environment,
   type ImportFormat,
} from "./types"
import type { DockerAvailability } from "./ipc"

export function isErrorCode(value: unknown): value is ErrorCode {
   return typeof value === "string" && (ERROR_CODES as readonly string[]).includes(value)
}

export function isAppError(value: unknown): value is AppError {
   return value instanceof AppError
}

export function isDBType(value: unknown): value is DBType {
   return typeof value === "string" && (DB_TYPES as readonly string[]).includes(value)
}

export function isEnvironmentStatus(value: unknown): value is EnvironmentStatus {
   return (
      typeof value === "string" &&
      (ENVIRONMENT_STATUSES as readonly string[]).includes(value)
   )
}

export function isImportFormat(value: unknown): value is ImportFormat {
   return (
      typeof value === "string" && (IMPORT_FORMATS as readonly string[]).includes(value)
   )
}

const environmentSchema = z.object({
   id: z.string(),
   name: z.string(),
   dbType: z.enum(["postgres", "mysql", "sqlite"]),
   status: z.enum(["creating", "running", "stopped", "error", "destroyed"]),
   port: z.number(),
   uptime: z.number().nullable(),
   connectionString: z.string(),
   containerId: z.string().nullable(),
   createdAt: z.string(),
})

export function isEnvironment(value: unknown): value is Environment {
   return environmentSchema.safeParse(value).success
}

const dockerAvailabilitySchema = z.object({
   available: z.boolean(),
   reason: z.enum(["available", "not-running", "not-installed"]),
   title: z.string(),
   message: z.string(),
   detail: z.string(),
})

export function isDockerAvailability(value: unknown): value is DockerAvailability {
   return dockerAvailabilitySchema.safeParse(value).success
}
