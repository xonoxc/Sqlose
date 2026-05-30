import { describe, it, expect, expectTypeOf } from "vitest"
import {
   AppError,
   DockerError,
   EnvironmentError,
   QueryError,
   ImportError,
   IPCError,
   VimError,
   ERROR_CODES,
   ERROR_CATEGORIES,
   okResult,
   errResult,
   DB_TYPES,
   ENVIRONMENT_STATUSES,
   DATASET_CATEGORIES,
   IMPORT_FORMATS,
   IPC_CHANNELS,
   isErrorCode,
   isAppError,
   isDBType,
} from "./index"
import type {
   ErrorCode,
   DBType,
   Environment,
   QueryResult,
   QueryHistory,
   Dataset,
   ImportPayload,
   IPCChannel,
   IPCRequest,
   IPCResponse,
   IPCRequestMap,
   IPCResponseMap,
} from "./index"

describe("Error Hierarchy", () => {
   it("ERROR_CODES should contain all error codes as const", () => {
      expect(ERROR_CODES).toContain("docker:container_failed")
      expect(ERROR_CODES).toContain("env:not_found")
      expect(ERROR_CODES).toContain("query:execution_failed")
      expect(ERROR_CODES).toContain("import:parse_failed")
      expect(ERROR_CODES).toContain("ipc:invalid_payload")
      expect(ERROR_CODES).toContain("vim:mode_error")
   })

   it("ERROR_CATEGORIES should contain all categories", () => {
      expect(ERROR_CATEGORIES).toEqual(["docker", "env", "query", "import", "ipc", "db", "vim"])
   })

   it("should instantiate AppError with code and default message", () => {
      const error = new AppError("docker:container_failed")
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(AppError)
      expect(error.code).toBe("docker:container_failed")
      expect(error.category).toBe("docker")
      expect(error.message).toBe("docker:container_failed")
      expect(error.name).toBe("AppError")
   })

   it("should accept custom message", () => {
      const error = new AppError("env:not_found", "Custom message")
      expect(error.message).toBe("Custom message")
   })

   it("toJSON should serialize correctly", () => {
      const error = new AppError("query:timeout", "Query timed out")
      const json = error.toJSON()
      expect(json).toEqual({
         name: "AppError",
         code: "query:timeout",
         category: "query",
         message: "Query timed out",
      })
   })

   describe("typed error subclasses", () => {
      it("DockerError should have docker category", () => {
         const error = new DockerError("docker:port_conflict")
         expect(error).toBeInstanceOf(AppError)
         expect(error.name).toBe("DockerError")
         expect(error.category).toBe("docker")
      })

      it("EnvironmentError should have env category", () => {
         const error = new EnvironmentError("env:not_found")
         expect(error.name).toBe("EnvironmentError")
         expect(error.category).toBe("env")
      })

      it("QueryError should have query category", () => {
         const error = new QueryError("query:invalid_syntax")
         expect(error.name).toBe("QueryError")
         expect(error.category).toBe("query")
      })

      it("ImportError should have import category", () => {
         const error = new ImportError("import:parse_failed")
         expect(error.name).toBe("ImportError")
         expect(error.category).toBe("import")
      })

      it("IPCError should have ipc category", () => {
         const error = new IPCError("ipc:unauthorized")
         expect(error.name).toBe("IPCError")
         expect(error.category).toBe("ipc")
      })

      it("VimError should have vim category", () => {
         const error = new VimError("vim:mode_error")
         expect(error.name).toBe("VimError")
         expect(error.category).toBe("vim")
      })
   })

   describe("error code matching at type level", () => {
      it("DockerError should only accept docker-prefixed codes at compile time", () => {
         const error = new DockerError("docker:container_failed")
         expect(error.code).toBe("docker:container_failed")
      })

      it("should only accept valid error codes", () => {
         expect(ERROR_CODES.includes("docker:container_failed" as ErrorCode)).toBe(true)
      })
   })

   describe("Result helpers", () => {
      it("okResult should create an Ok result", () => {
         const result = okResult(42)
         expect(result.isOk()).toBe(true)
         expect(result._unsafeUnwrap()).toBe(42)
      })

      it("errResult should create an Err result", () => {
         const result = errResult("env:create_failed", "Could not create env")
         expect(result.isErr()).toBe(true)
         expect(result._unsafeUnwrapErr()).toBeInstanceOf(AppError)
         expect(result._unsafeUnwrapErr().message).toBe("Could not create env")
      })
   })
})

describe("Shared Type Definitions", () => {
   it("DB_TYPES should contain all database types", () => {
      expect(DB_TYPES).toEqual(["postgres", "mysql", "sqlite"])
   })

   it("ENVIRONMENT_STATUSES should contain all statuses", () => {
      expect(ENVIRONMENT_STATUSES).toEqual(["creating", "running", "stopped", "error", "destroyed"])
   })

   it("DATASET_CATEGORIES should contain all dataset categories", () => {
      expect(DATASET_CATEGORIES).toEqual(["ecommerce", "analytics", "social", "finance", "retail", "healthcare", "entertainment", "education", "business", "environment"])
   })

   it("IMPORT_FORMATS should contain all import formats", () => {
      expect(IMPORT_FORMATS).toEqual(["csv", "sql"])
   })

   describe("Environment interface", () => {
      it("should create a valid environment object", () => {
         const env: Environment = {
            id: "env-1",
            name: "Test Postgres",
            dbType: "postgres",
            status: "running",
            port: 5432,
            uptime: 3600,
            connectionString: "postgresql://localhost:5432/test",
            containerId: "abc123",
            createdAt: "2024-01-01T00:00:00Z",
         }
         expect(env.dbType).toBe("postgres")
         expect(env.status).toBe("running")
      })
   })

   describe("QueryResult interface", () => {
      it("should create a valid query result object", () => {
         const result: QueryResult = {
            columns: ["id", "name"],
            rows: [{ id: 1, name: "test" }],
            rowCount: 1,
            executionTimeMs: 10,
         }
         expect(result.rowCount).toBe(1)
         expect(result.executionTimeMs).toBe(10)
      })
   })

   describe("QueryHistory interface", () => {
      it("should create a valid query history object", () => {
         const history: QueryHistory = {
            id: "hist-1",
            environmentId: "env-1",
            sql: "SELECT 1",
            result: null,
            error: null,
            executedAt: "2024-01-01T00:00:00Z",
         }
         expect(history.id).toBe("hist-1")
      })
   })

   describe("Dataset interface", () => {
      it("should create a valid dataset object", () => {
         const dataset: Dataset = {
            id: "ds-1",
            name: "Sample Ecommerce",
            description: "Sample ecommerce dataset",
            category: "ecommerce",
            dbTypes: ["postgres", "mysql"],
         }
         expect(dataset.category).toBe("ecommerce")
      })
   })

   describe("ImportPayload interface", () => {
      it("should create a valid import payload object", () => {
         const payload: ImportPayload = {
            environmentId: "env-1",
            fileName: "data.csv",
            content: "id,name\n1,test",
            format: "csv",
            tableName: "my_table",
         }
         expect(payload.format).toBe("csv")
      })
   })
})

describe("Type Guards", () => {
   describe("isErrorCode", () => {
      it("should return true for valid error codes", () => {
         expect(isErrorCode("docker:container_failed")).toBe(true)
         expect(isErrorCode("env:not_found")).toBe(true)
         expect(isErrorCode("query:execution_failed")).toBe(true)
      })

      it("should return false for invalid values", () => {
         expect(isErrorCode(undefined)).toBe(false)
         expect(isErrorCode(null)).toBe(false)
         expect(isErrorCode(42)).toBe(false)
         expect(isErrorCode("")).toBe(false)
         expect(isErrorCode("invalid:code")).toBe(false)
         expect(isErrorCode("unknown")).toBe(false)
      })
   })

   describe("isAppError", () => {
      it("should return true for AppError instances", () => {
         expect(isAppError(new AppError("docker:port_conflict"))).toBe(true)
         expect(isAppError(new DockerError("docker:container_failed"))).toBe(true)
         expect(isAppError(new QueryError("query:timeout"))).toBe(true)
      })

      it("should return false for regular Errors", () => {
         expect(isAppError(new Error("test"))).toBe(false)
      })

      it("should return false for non-Errors", () => {
         expect(isAppError("string")).toBe(false)
         expect(isAppError(null)).toBe(false)
      })
   })

   describe("isDBType", () => {
      it("should return true for valid DB types", () => {
         expect(isDBType("postgres")).toBe(true)
         expect(isDBType("mysql")).toBe(true)
         expect(isDBType("sqlite")).toBe(true)
      })

      it("should return false for invalid DB types", () => {
         expect(isDBType("mongodb")).toBe(false)
         expect(isDBType("redis")).toBe(false)
         expect(isDBType(undefined)).toBe(false)
      })
   })
})

describe("IPC Type Contracts", () => {
   it("IPC_CHANNELS should contain all channel names", () => {
      expect(IPC_CHANNELS).toContain("docker:start-env")
      expect(IPC_CHANNELS).toContain("env:create")
      expect(IPC_CHANNELS).toContain("query:execute")
      expect(IPC_CHANNELS).toContain("import:csv")
      expect(IPC_CHANNELS).toContain("dataset:list")
   })

   it("every IPC channel should have a corresponding request type", () => {
      type HasAllRequests = {
         [C in IPCChannel]: C extends keyof IPCRequestMap ? true : false
      }
      type Result = HasAllRequests[keyof HasAllRequests]
      expectTypeOf<Result>().toEqualTypeOf<true>()
   })

   it("every IPC channel should have a corresponding response type", () => {
      type HasAllResponses = {
         [C in IPCChannel]: C extends keyof IPCResponseMap ? true : false
      }
      type Result = HasAllResponses[keyof HasAllResponses]
      expectTypeOf<Result>().toEqualTypeOf<true>()
   })

   it("IPCRequest should resolve to correct type per channel", () => {
      type StartEnvRequest = IPCRequest<"docker:start-env">
      expectTypeOf<StartEnvRequest>().toMatchTypeOf<{ environmentId: string }>()

      type CreateEnvRequest = IPCRequest<"env:create">
      expectTypeOf<CreateEnvRequest>().toMatchTypeOf<{ dbType: DBType }>()
   })

   it("IPCResponse should resolve to correct type per channel", () => {
      type ListEnvsResponse = IPCResponse<"env:list">
      expectTypeOf<ListEnvsResponse>().toMatchTypeOf<Environment[]>()

      type QueryResponse = IPCResponse<"query:execute">
      expectTypeOf<QueryResponse>().toMatchTypeOf<QueryResult>()
   })

   it("import:csv request should include ImportPayload fields", () => {
      type CSVRequest = IPCRequest<"import:csv">
      expectTypeOf<CSVRequest>().toHaveProperty("fileName")
      expectTypeOf<CSVRequest>().toHaveProperty("content")
      expectTypeOf<CSVRequest>().toHaveProperty("format")
   })

   it("IPCRequest/Response types should be covariant per channel", () => {
      type StartEnvRequest = IPCRequest<"docker:start-env">
      type StartEnvResponse = IPCResponse<"docker:start-env">
      expectTypeOf<StartEnvRequest>().toMatchTypeOf<Record<string, unknown>>()
      expectTypeOf<StartEnvResponse>().toMatchTypeOf<Record<string, unknown>>()
   })
})
