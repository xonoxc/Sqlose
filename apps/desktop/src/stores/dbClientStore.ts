import { create } from "zustand"
import { persist } from "zustand/middleware"
import { sqliteStorage } from "~/lib/sqlite-storage"
import { attempt, type DBType, type QueryResult } from "@sqlose/shared"

export interface DbClientConnection {
   id: string
   name: string
   dbType: DBType
   connectionString: string
   createdAt: string
   lastConnectedAt: string | null
   color: string
}

export interface DbClientTab {
   id: string
   connectionId: string
   title: string
   query: string
   result: QueryResult | null
   error: string | null
   isExecuting: boolean
   executionTimeMs?: number
}

export interface DbClientWorkspace {
   connectionId: string
   tabs: DbClientTab[]
   activeTabId: string | null
   tables: string[]
   tablesLoading: boolean
}

function createTab(connectionId: string): DbClientTab {
   const id = `dbt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
   return {
      id,
      connectionId,
      title: "New Query",
      query: "",
      result: null,
      error: null,
      isExecuting: false,
   }
}

interface DbClientStore {
   connections: DbClientConnection[]
   selectedConnectionId: string | null
   workspaces: Record<string, DbClientWorkspace>
   isLoading: boolean
   error: string | null

   // Connection management
   loadConnections: () => Promise<void>
   saveConnection: (
      conn: Omit<DbClientConnection, "createdAt" | "lastConnectedAt">
   ) => Promise<void>
   deleteConnection: (id: string) => Promise<void>
   selectConnection: (id: string | null) => void
   testConnection: (payload: {
      dbType: string
      connectionString: string
   }) => Promise<{ latencyMs: number } | null>

   // Workspace / tab management
   openWorkspace: (connectionId: string) => void
   loadSchema: (connectionId: string) => Promise<void>
   openTab: (connectionId: string) => DbClientTab
   closeTab: (connectionId: string, tabId: string) => void
   setActiveTab: (connectionId: string, tabId: string) => void
   updateTab: (connectionId: string, tabId: string, updates: Partial<DbClientTab>) => void
   executeQuery: (connectionId: string, tabId: string, sql: string) => Promise<void>
}

function getSqloseAPI() {
   if (typeof window === "undefined" || !window.sqlose) return null
   return window.sqlose
}

export const useDbClientStore = create<DbClientStore>()(
   persist(
      (set, get) => ({
         connections: [],
         selectedConnectionId: null,
         workspaces: {},
         isLoading: false,
         error: null,

         loadConnections: async () => {
            const api = getSqloseAPI()
            if (!api) return
            set({ isLoading: true })

            const listRes = await attempt(api.dbclient.list())
            listRes.match(
               res => {
                  if (res.success) {
                     set({
                        connections: res.data as DbClientConnection[],
                        isLoading: false,
                     })
                  } else {
                     set({
                        isLoading: false,
                        error: String(res.error),
                     })
                  }
               },
               error => set({ isLoading: false, error: String(error) })
            )
         },

         saveConnection: async conn => {
            const api = getSqloseAPI()
            if (!api) return
            const result = await api.dbclient.save(conn)
            if ((result as { success: boolean }).success) {
               await get().loadConnections()
            }
         },

         deleteConnection: async id => {
            const api = getSqloseAPI()
            if (!api) return
            await api.dbclient.delete(id)
            set(s => ({
               connections: s.connections.filter(c => c.id !== id),
               selectedConnectionId: s.selectedConnectionId === id ? null : s.selectedConnectionId,
            }))
         },

         selectConnection: id => {
            set({ selectedConnectionId: id })
            if (id) {
               get().openWorkspace(id)
               get().loadSchema(id)
            }
         },

         testConnection: async payload => {
            const api = getSqloseAPI()
            if (!api) return null
            const result = await api.dbclient.test(payload)
            if ((result as { success: boolean }).success) {
               return (result as { data: { latencyMs: number } }).data
            }
            return null
         },

         openWorkspace: connectionId => {
            set(s => {
               if (s.workspaces[connectionId]) return s
               const tab = createTab(connectionId)
               return {
                  workspaces: {
                     ...s.workspaces,
                     [connectionId]: {
                        connectionId,
                        tabs: [tab],
                        activeTabId: tab.id,
                        tables: [],
                        tablesLoading: false,
                     },
                  },
               }
            })
         },

         loadSchema: async connectionId => {
            set(s => ({
               workspaces: {
                  ...s.workspaces,
                  [connectionId]: s.workspaces[connectionId]
                     ? { ...s.workspaces[connectionId], tablesLoading: true }
                     : {
                          connectionId,
                          tabs: [],
                          activeTabId: null,
                          tables: [],
                          tablesLoading: true,
                       },
               },
            }))

            const api = getSqloseAPI()
            if (!api) return

            const schemaRes = await attempt(api.dbclient.schema({ connectionId }))
            schemaRes.match(
               result => {
                  if ((result as { success: boolean }).success) {
                     const tables = (result as { data: { tables: string[] } }).data.tables
                     set(s => ({
                        workspaces: {
                           ...s.workspaces,
                           [connectionId]: s.workspaces[connectionId]
                              ? { ...s.workspaces[connectionId], tables, tablesLoading: false }
                              : {
                                   connectionId,
                                   tabs: [],
                                   activeTabId: null,
                                   tables,
                                   tablesLoading: false,
                                },
                        },
                     }))
                  } else {
                     set(s => ({
                        workspaces: {
                           ...s.workspaces,
                           [connectionId]: s.workspaces[connectionId]
                              ? { ...s.workspaces[connectionId], tablesLoading: false }
                              : {
                                   connectionId,
                                   tabs: [],
                                   activeTabId: null,
                                   tables: [],
                                   tablesLoading: false,
                                },
                        },
                     }))
                  }
               },
               () => {
                  set(s => ({
                     workspaces: {
                        ...s.workspaces,
                        [connectionId]: s.workspaces[connectionId]
                           ? { ...s.workspaces[connectionId], tablesLoading: false }
                           : {
                                connectionId,
                                tabs: [],
                                activeTabId: null,
                                tables: [],
                                tablesLoading: false,
                             },
                     },
                  }))
               }
            )
         },

         openTab: connectionId => {
            const tab = createTab(connectionId)
            set(s => {
               const ws = s.workspaces[connectionId] ?? {
                  connectionId,
                  tabs: [],
                  activeTabId: null,
                  tables: [],
                  tablesLoading: false,
               }
               return {
                  workspaces: {
                     ...s.workspaces,
                     [connectionId]: { ...ws, tabs: [...ws.tabs, tab], activeTabId: tab.id },
                  },
               }
            })
            return tab
         },

         closeTab: (connectionId, tabId) => {
            set(s => {
               const ws = s.workspaces[connectionId]
               if (!ws) return s
               let newTabs = ws.tabs.filter(t => t.id !== tabId)
               let newActiveId = ws.activeTabId
               if (newTabs.length === 0) {
                  const fresh = createTab(connectionId)
                  newTabs = [fresh]
                  newActiveId = fresh.id
               } else if (newActiveId === tabId) {
                  newActiveId = newTabs[newTabs.length - 1]?.id ?? null
               }
               return {
                  workspaces: {
                     ...s.workspaces,
                     [connectionId]: { ...ws, tabs: newTabs, activeTabId: newActiveId },
                  },
               }
            })
         },

         setActiveTab: (connectionId, tabId) => {
            set(s => {
               const ws = s.workspaces[connectionId]
               if (!ws) return s
               return {
                  workspaces: {
                     ...s.workspaces,
                     [connectionId]: { ...ws, activeTabId: tabId },
                  },
               }
            })
         },

         updateTab: (connectionId, tabId, updates) => {
            set(s => {
               const ws = s.workspaces[connectionId]
               if (!ws) return s
               const tabs = ws.tabs.map(t => (t.id === tabId ? { ...t, ...updates } : t))
               return {
                  workspaces: { ...s.workspaces, [connectionId]: { ...ws, tabs } },
               }
            })
         },

         executeQuery: async (connectionId, tabId, sql) => {
            const api = getSqloseAPI()
            if (!api) return

            get().updateTab(connectionId, tabId, {
               isExecuting: true,
               result: null,
               error: null,
            })

            const start = Date.now()
            try {
               const result = await api.dbclient.execute({ connectionId, sql })
               const elapsed = Date.now() - start
               if ((result as { success: boolean }).success) {
                  const qr = (result as { data: QueryResult }).data
                  get().updateTab(connectionId, tabId, {
                     isExecuting: false,
                     result: qr,
                     error: null,
                     executionTimeMs: elapsed,
                  })
               } else {
                  get().updateTab(connectionId, tabId, {
                     isExecuting: false,
                     result: null,
                     error: String((result as { error: string }).error),
                     executionTimeMs: elapsed,
                  })
               }
            } catch (e) {
               get().updateTab(connectionId, tabId, {
                  isExecuting: false,
                  result: null,
                  error: String(e),
               })
            }
         },
      }),
      {
         name: "sqlose-db-client",
         storage: sqliteStorage,
         partialize: state => ({
            connections: state.connections,
            selectedConnectionId: state.selectedConnectionId,
         }),
      }
   )
)
