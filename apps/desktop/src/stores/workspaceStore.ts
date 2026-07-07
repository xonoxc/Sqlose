import { create } from "zustand"
import { persist } from "zustand/middleware"
import { ok, err, type Result } from "neverthrow"
import { AppError } from "@sqlose/shared"
import type { Tab, PaneSizes } from "~/lib/types"
import { createTab, createDefaultPaneSizes, generateTabTitle } from "~/lib/types"
import { sqliteStorage } from "~/lib/sqlite-storage"

interface WorkspaceData {
   tabs: Tab[]
   activeTabId: string | null
   paneSizes: PaneSizes
}

interface WorkspaceStore {
   workspaces: Record<string, WorkspaceData>
   activeWorkspaceId: string | null
   tabs: Tab[]
   activeTabId: string | null
   paneSizes: PaneSizes

   setActiveWorkspace: (environmentId: string | null) => void
   openTab: (overrides?: Partial<Tab>) => Result<Tab, AppError>
   closeTab: (tabId: string) => Result<{ closedId: string; newActiveId: string | null }, AppError>
   setActiveTab: (tabId: string) => Result<string, AppError>
   updateTab: (tabId: string, updates: Partial<Tab>) => Result<Tab, AppError>
   moveTab: (fromIndex: number, toIndex: number) => Result<void, AppError>
   updatePaneSizes: (updates: Partial<PaneSizes>) => Result<PaneSizes, AppError>
   getActiveTab: () => Tab | undefined
   resetWorkspace: (environmentId: string) => void
   removeWorkspace: (environmentId: string) => void
}

function createDefaultWorkspace(paneSizes?: PaneSizes): WorkspaceData {
   const tab = createTab()
   return {
      tabs: [tab],
      activeTabId: tab.id,
      paneSizes: paneSizes ?? createDefaultPaneSizes(),
   }
}

function mirrorWorkspace(workspace: WorkspaceData) {
   return {
      tabs: workspace.tabs,
      activeTabId: workspace.activeTabId,
      paneSizes: workspace.paneSizes,
   }
}

export const useWorkspaceStore = create<WorkspaceStore>()(
   persist(
      (set, get) => ({
         workspaces: {},
         activeWorkspaceId: null,
         tabs: [],
         activeTabId: null,
         paneSizes: createDefaultPaneSizes(),

         setActiveWorkspace: (environmentId: string | null) => {
            if (environmentId === null) {
               set({
                  activeWorkspaceId: null,
                  tabs: [],
                  activeTabId: null,
               })
               return
            }
            const state = get()
            let workspace = state.workspaces[environmentId]
            if (!workspace) {
               const currentPaneSizes = state.activeWorkspaceId
                  ? state.workspaces[state.activeWorkspaceId]?.paneSizes
                  : undefined
               workspace = createDefaultWorkspace(currentPaneSizes ?? state.paneSizes)
               set(state => ({
                  workspaces: { ...state.workspaces, [environmentId]: workspace },
               }))
            }
            set({
               activeWorkspaceId: environmentId,
               ...mirrorWorkspace(workspace),
            })
         },

         resetWorkspace: (environmentId: string) => {
            const state = get()
            const existing = state.workspaces[environmentId]
            const fresh = createDefaultWorkspace(existing?.paneSizes)
            set(s => ({
               workspaces: { ...s.workspaces, [environmentId]: fresh },
               ...(s.activeWorkspaceId === environmentId ? mirrorWorkspace(fresh) : {}),
            }))
         },

         removeWorkspace: (environmentId: string) => {
            set(state => {
               const rest = { ...state.workspaces }
               delete rest[environmentId]
               const update: Partial<WorkspaceStore> = { workspaces: rest }
               if (state.activeWorkspaceId === environmentId) {
                  update.activeWorkspaceId = null
                  update.tabs = []
                  update.activeTabId = null
               }
               return update
            })
         },

           openTab: (overrides?: Partial<Tab>) => {
              const state = get()
              const envId = state.activeWorkspaceId
              if (!envId) {
                 return err(new AppError("env:not_found", "No active workspace"))
              }
              const workspace = state.workspaces[envId]
              if (!workspace) {
                 return err(new AppError("env:not_found", `Workspace ${envId} not found`))
              }

              if (overrides?.tableName) {
                 const existing = workspace.tabs.find(
                    t => t.tableName === overrides.tableName
                 )
                 if (existing) {
                    const updatedWorkspace: WorkspaceData = {
                       ...workspace,
                       activeTabId: existing.id,
                    }
                    set(state => ({
                       workspaces: { ...state.workspaces, [envId]: updatedWorkspace },
                       tabs: workspace.tabs,
                       activeTabId: existing.id,
                    }))
                    return ok(existing)
                 }
              }

              if (overrides?.type && ["diagram", "saved", "history"].includes(overrides.type)) {
                 const existing = workspace.tabs.find(t => t.type === overrides.type)
                 if (existing) {
                    const updatedWorkspace: WorkspaceData = {
                       ...workspace,
                       activeTabId: existing.id,
                    }
                    set(state => ({
                       workspaces: { ...state.workspaces, [envId]: updatedWorkspace },
                       tabs: workspace.tabs,
                       activeTabId: existing.id,
                    }))
                    return ok(existing)
                 }
              }

             const newTab = createTab(envId, overrides?.tableName)
             const merged = { ...newTab, ...overrides }
             const newTabs = [...workspace.tabs, merged]
             const updatedWorkspace: WorkspaceData = {
                ...workspace,
                tabs: newTabs,
                activeTabId: merged.id,
             }
             set(state => ({
                workspaces: { ...state.workspaces, [envId]: updatedWorkspace },
                tabs: newTabs,
                activeTabId: merged.id,
             }))
             return ok(merged)
          },

         closeTab: (tabId: string) => {
            const state = get()
            const envId = state.activeWorkspaceId
            if (!envId) {
               return err(new AppError("env:not_found", "No active workspace"))
            }
            const workspace = state.workspaces[envId]
            if (!workspace) {
               return err(new AppError("env:not_found", `Workspace ${envId} not found`))
            }
            const tabIndex = workspace.tabs.findIndex(t => t.id === tabId)
            if (tabIndex === -1) {
               return err(new AppError("env:not_found", `Tab ${tabId} not found`))
            }

            let newTabs: Tab[]
            let newActiveId: string | null

            if (workspace.tabs.length === 1) {
               const newTab = createTab(envId)
               newTabs = [newTab]
               newActiveId = newTab.id
            } else {
               newTabs = workspace.tabs.filter(t => t.id !== tabId)
               newActiveId = state.activeTabId
               if (newActiveId === tabId) {
                  const newIndex = Math.min(tabIndex, newTabs.length - 1)
                  newActiveId = newTabs[newIndex]?.id ?? null
               }
            }

            const updatedWorkspace: WorkspaceData = {
               ...workspace,
               tabs: newTabs,
               activeTabId: newActiveId,
            }
            set(state => ({
               workspaces: { ...state.workspaces, [envId]: updatedWorkspace },
               tabs: newTabs,
               activeTabId: newActiveId,
            }))
            return ok({ closedId: tabId, newActiveId })
         },

         setActiveTab: (tabId: string) => {
            const state = get()
            const envId = state.activeWorkspaceId
            if (!envId) {
               return err(new AppError("env:not_found", "No active workspace"))
            }
            const workspace = state.workspaces[envId]
            if (!workspace) {
               return err(new AppError("env:not_found", `Workspace ${envId} not found`))
            }
            const exists = workspace.tabs.some(t => t.id === tabId)
            if (!exists) {
               return err(new AppError("env:not_found", `Tab ${tabId} not found`))
            }
            const updatedWorkspace = { ...workspace, activeTabId: tabId }
            set(state => ({
               workspaces: { ...state.workspaces, [envId]: updatedWorkspace },
               activeTabId: tabId,
            }))
            return ok(tabId)
         },

         updateTab: (tabId: string, updates: Partial<Tab>) => {
            const state = get()
            const envId = state.activeWorkspaceId
            if (!envId) {
               return err(new AppError("env:not_found", "No active workspace"))
            }
            const workspace = state.workspaces[envId]
            if (!workspace) {
               return err(new AppError("env:not_found", `Workspace ${envId} not found`))
            }
            const tabIndex = workspace.tabs.findIndex(t => t.id === tabId)
            if (tabIndex === -1) {
               return err(new AppError("env:not_found", `Tab ${tabId} not found`))
            }

            const current = workspace.tabs[tabIndex]
            const merged = { ...current, ...updates }

             if (updates.query !== undefined && updates.query !== current.query && updates.title === undefined) {
                const newTitle = generateTabTitle(updates.query)
                if (newTitle !== current.title) {
                   merged.title = newTitle
                }
             }

            const newTabs = [...workspace.tabs]
            newTabs[tabIndex] = merged

            const updatedWorkspace = { ...workspace, tabs: newTabs }
            set(state => ({
               workspaces: { ...state.workspaces, [envId]: updatedWorkspace },
               tabs: newTabs,
            }))
            return ok(merged)
         },

         moveTab: (fromIndex: number, toIndex: number) => {
            const state = get()
            const envId = state.activeWorkspaceId
            if (!envId) {
               return err(new AppError("env:not_found", "No active workspace"))
            }
            const workspace = state.workspaces[envId]
            if (!workspace) {
               return err(new AppError("env:not_found", `Workspace ${envId} not found`))
            }
            if (
               fromIndex < 0 ||
               fromIndex >= workspace.tabs.length ||
               toIndex < 0 ||
               toIndex >= workspace.tabs.length
            ) {
               return err(
                  new AppError(
                     "ipc:invalid_payload",
                     `Invalid tab indices: ${fromIndex} -> ${toIndex}`
                  )
               )
            }
            if (fromIndex === toIndex) {
               return ok(undefined)
            }

            const newTabs = [...workspace.tabs]
            const [moved] = newTabs.splice(fromIndex, 1)
            newTabs.splice(toIndex, 0, moved)

            const updatedWorkspace = { ...workspace, tabs: newTabs }
            set(state => ({
               workspaces: { ...state.workspaces, [envId]: updatedWorkspace },
               tabs: newTabs,
            }))
            return ok(undefined)
         },

         updatePaneSizes: (updates: Partial<PaneSizes>) => {
            const state = get()
            const envId = state.activeWorkspaceId
            const workspace = envId ? state.workspaces[envId] : undefined
            const currentSizes = workspace?.paneSizes ?? state.paneSizes
            const newSizes = { ...currentSizes, ...updates }
            if (envId && workspace) {
               const updatedWorkspace = { ...workspace, paneSizes: newSizes }
               set(state => ({
                  workspaces: { ...state.workspaces, [envId]: updatedWorkspace },
                  paneSizes: newSizes,
               }))
            } else {
               set({ paneSizes: newSizes })
            }
            return ok(newSizes)
         },

         getActiveTab: () => {
            const state = get()
            return state.tabs.find(t => t.id === state.activeTabId)
         },
      }),
      {
         name: "sqlose-workspace",
         storage: sqliteStorage,
         partialize: state => {
            const partialized: Record<string, unknown> = {}
            for (const [envId, ws] of Object.entries(state.workspaces)) {
               partialized[envId] = {
                  tabs: ws.tabs.map(tab => ({
                     ...tab,
                     result: null,
                     error: null,
                     isExecuting: false,
                  })),
                  activeTabId: ws.activeTabId,
                  paneSizes: ws.paneSizes,
               }
            }
            return {
               workspaces: partialized,
               activeWorkspaceId: state.activeWorkspaceId,
            }
         },
         merge: (persisted, current) => {
            const p = persisted as Record<string, unknown>
            if (!p || !p.workspaces) {
               const oldTabs = (p as { tabs?: Tab[] })?.tabs
               const oldActiveTabId = (p as { activeTabId?: string | null })?.activeTabId
               const oldPaneSizes = (p as { paneSizes?: PaneSizes })?.paneSizes
               if (oldTabs && Array.isArray(oldTabs)) {
                  const sanitized = oldTabs.map(tab => ({
                     ...tab,
                     result: null,
                     error: null,
                     isExecuting: false,
                  }))
                  const defaultTab = createTab()
                  const migratedWorkspace = {
                     tabs: sanitized.length > 0 ? sanitized : [defaultTab],
                     activeTabId: oldActiveTabId ?? defaultTab.id,
                     paneSizes: oldPaneSizes ?? createDefaultPaneSizes(),
                  }
                  return {
                     ...current,
                     workspaces: { __migrated__: migratedWorkspace },
                     activeWorkspaceId: null,
                     tabs: [],
                     activeTabId: null,
                  }
               }
            }
            return { ...current, ...p }
         },
      }
   )
)
