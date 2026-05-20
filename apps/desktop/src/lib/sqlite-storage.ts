import { createJSONStorage } from "zustand/middleware"

const storage = {
   getItem: async (name: string): Promise<string | null> => {
      const result = await window.sqlose.db.get(name)
      return result.success ? result.data : null
   },
   setItem: async (name: string, value: string): Promise<void> => {
      await window.sqlose.db.set(name, value)
   },
   removeItem: async (name: string): Promise<void> => {
      await window.sqlose.db.delete(name)
   },
}

export const sqliteStorage = createJSONStorage(() => storage)
