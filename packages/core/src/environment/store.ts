import Store from "electron-store"
import type { Environment } from "@sqlose/shared"

interface StoreSchema {
   environments: Record<string, Environment>
}

let store: Store<StoreSchema> | null = null

function getStore(): Store<StoreSchema> {
   if (!store) {
      store = new Store<StoreSchema>({
         name: "sqlose-environments",
         defaults: { environments: {} },
      })
   }
   return store
}

export function loadEnvironments(): Environment[] {
   const data = getStore().get("environments")
   return Object.values(data)
}

export function loadEnvironment(id: string): Environment | null {
   const data = getStore().get("environments")
   return data[id] ?? null
}

export function saveEnvironment(environment: Environment): void {
   const data = getStore().get("environments")
   data[environment.id] = environment
   getStore().set("environments", data)
}

export function deleteEnvironment(id: string): void {
   const data = getStore().get("environments")
   delete data[id]
   getStore().set("environments", data)
}

export function clearEnvironments(): void {
   getStore().set("environments", {})
}
