import { ok, err } from "neverthrow"
import { EnvironmentError, okResult } from "@sqlose/shared"
import type { DBType, Environment, AsyncAppResult } from "@sqlose/shared"
import { loadEnvironments, loadEnvironment, saveEnvironment, deleteEnvironment } from "./store"

let envCounter = 0

function generateId(): string {
   envCounter++
   return `env-${Date.now()}-${envCounter}`
}

export async function createEnvironmentRecord(
   dbType: DBType,
   name?: string
): AsyncAppResult<Environment> {
   try {
      const env: Environment = {
         id: generateId(),
         name: name ?? `${dbType}-${envCounter}`,
         dbType,
         status: "creating",
         port: 0,
         uptime: null,
         connectionString: "",
         containerId: null,
         createdAt: new Date().toISOString(),
      }
      saveEnvironment(env)
      return ok(env)
   } catch (e) {
      return err(
         new EnvironmentError(
            "env:create_failed",
            (e as Error).message ?? "Failed to create environment"
         )
      )
   }
}

export async function getEnvironment(id: string): AsyncAppResult<Environment> {
   const env = loadEnvironment(id)
   return env
      ? ok(env)
      : err(new EnvironmentError("env:not_found", `Environment ${id} not found`))
}

export async function listEnvironments(): AsyncAppResult<Environment[]> {
   return ok(loadEnvironments())
}

export async function updateEnvironment(
   id: string,
   updates: Partial<Environment>
): AsyncAppResult<Environment> {
   const env = loadEnvironment(id)
   if (!env) {
      return err(new EnvironmentError("env:not_found", `Environment ${id} not found`))
   }
   const updated = { ...env, ...updates }
   saveEnvironment(updated)
   return ok(updated)
}

export async function destroyEnvironmentRecord(id: string): AsyncAppResult<void> {
   const env = loadEnvironment(id)
   if (!env) {
      return err(new EnvironmentError("env:not_found", `Environment ${id} not found`))
   }
   deleteEnvironment(id)
   return okResult(undefined)
}

export async function duplicateEnvironmentRecord(id: string): AsyncAppResult<Environment> {
   const env = loadEnvironment(id)
   if (!env) {
      return err(new EnvironmentError("env:not_found", `Environment ${id} not found`))
   }
   const duplicate: Environment = {
      ...env,
      id: generateId(),
      name: `${env.name} (copy)`,
      status: "creating",
      port: 0,
      uptime: null,
      connectionString: "",
      containerId: null,
      createdAt: new Date().toISOString(),
   }
   saveEnvironment(duplicate)
   return ok(duplicate)
}

export async function resetEnvironmentRecord(id: string): AsyncAppResult<Environment> {
   const env = loadEnvironment(id)
   if (!env) {
      return err(new EnvironmentError("env:not_found", `Environment ${id} not found`))
   }
   const reset: Environment = {
      ...env,
      status: "creating",
      port: 0,
      uptime: null,
      connectionString: "",
      containerId: null,
   }
   saveEnvironment(reset)
   return ok(reset)
}
