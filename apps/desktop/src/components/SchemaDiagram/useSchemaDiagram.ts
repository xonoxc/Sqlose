import { useEffect, useState } from "react"
import { useNodesState, useEdgesState, MarkerType, type Node, type Edge } from "@xyflow/react"
import { buildForeignKeyEdge } from "./buildForeignKeyEdge"
import { fetchForeignKeys } from "./fkQueries"
import { inferForeignKeys } from "./inferForeignKeys"
import { computeLayout } from "./layoutEngine"
import { useDatabaseStore } from "~/stores/databaseStore"
import { useEnvironmentStore } from "~/stores/environmentStore"
import { useThemeStore } from "~/stores/theme-store"
import { listTables, type ColumnInfo } from "~/lib/schema"

export type LoadingPhase = "analyzing" | "cleaning" | "done"

export const LOADING_MESSAGES: Record<Exclude<LoadingPhase, "done">, string> = {
   analyzing: "Analyzing schema...",
   cleaning: "Laying out diagram...",
}

interface ReactFlowInstance {
   fitView: (opts?: { duration?: number; padding?: number }) => void
}

export function useSchemaDiagram() {
   const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
   const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
   const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>("analyzing")
   const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)

   const envId = useEnvironmentStore(s => s.selectedEnvironmentId)
   const dbType = useEnvironmentStore(s => s.environments.find(e => e.id === envId)?.dbType)
   const tablesByEnv = useDatabaseStore(s => s.tables)
   const fetchTables = useDatabaseStore(s => s.fetchTables)
   const fetchColumns = useDatabaseStore(s => s.fetchColumns)
   const { currentTheme } = useThemeStore()
   const tables = envId ? (tablesByEnv[envId] ?? []) : []

   const initializeDiagram = async () => {
      if (!envId || !dbType) return

      setLoadingPhase("analyzing")

      if (tables.length === 0) {
         await fetchTables(envId, dbType)
      }

      const tableRes = await listTables(envId, dbType)
      if (tableRes.isErr()) {
         setLoadingPhase("done")
         return
      }

      const newNodes: Node[] = []
      const newEdges: Edge[] = []
      const allTableNames: string[] = []
      const allTableColumns: Record<string, ColumnInfo[]> = {}

      for (const tName of tableRes.value) {
         await fetchColumns(envId, tName, dbType)
         const cols: ColumnInfo[] = useDatabaseStore.getState().tableColumns[envId]?.[tName] ?? []

         allTableNames.push(tName)
         allTableColumns[tName] = cols

         newNodes.push({
            id: tName,
            type: "tableNode",
            position: { x: 0, y: 0 },
            data: { label: tName, columns: cols },
         })
      }

      for (const tName of allTableNames) {
         const explicitFks = await fetchForeignKeys(envId, tName, dbType)
         for (const fk of explicitFks) {
            newEdges.push(
               buildForeignKeyEdge(
                  tName,
                  fk,
                  currentTheme.colors.accent,
                  currentTheme.colors.surface
               )
            )
         }

         const inferredFks = inferForeignKeys(
            tName,
            allTableColumns[tName],
            allTableNames,
            allTableColumns
         )
         for (const fk of inferredFks) {
            const isDuplicate = newEdges.some(
               edge =>
                  edge.source === fk.toTable &&
                  edge.sourceHandle === `source-${fk.toCol}` &&
                  edge.target === tName
            )
            if (!isDuplicate) {
               newEdges.push(
                  buildForeignKeyEdge(
                     tName,
                     fk,
                     currentTheme.colors.accent,
                     currentTheme.colors.surface
                  )
               )
            }
         }
      }

      setLoadingPhase("cleaning")

      const { nodes: layoutedNodes, edges: layoutedEdges } = await computeLayout(newNodes, newEdges)

      setNodes(layoutedNodes)
      setEdges(layoutedEdges)

      setLoadingPhase("done")
   }

   useEffect(() => {
      initializeDiagram()
   }, [initializeDiagram])

   useEffect(() => {
      setEdges(prevEdges =>
         prevEdges.map(edge => ({
            ...edge,
            style: {
               ...edge.style,
               stroke: currentTheme.colors.accent,
            },
            markerEnd: {
               type: MarkerType.ArrowClosed,
               ...(typeof edge.markerEnd === "object" && edge.markerEnd ? edge.markerEnd : {}),
               color: currentTheme.colors.accent,
            },
            labelStyle: {
               ...edge.labelStyle,
               fill: currentTheme.colors.accent,
            },
            labelBgStyle: {
               ...edge.labelBgStyle,
               fill: currentTheme.colors.surface,
            },
         }))
      )
   }, [currentTheme, setEdges])

   const handleRelayout = async () => {
      if (nodes.length === 0) return

      setLoadingPhase("cleaning")
      const { nodes: layoutedNodes, edges: layoutedEdges } = await computeLayout(nodes, edges)
      setNodes(layoutedNodes)
      setEdges(layoutedEdges)

      setTimeout(() => {
         reactFlowInstance?.fitView({
            duration: 300,
            padding: 0.15,
         })
      }, 50)
      setLoadingPhase("done")
   }

   return {
      nodes,
      edges,
      onNodesChange,
      onEdgesChange,
      loadingPhase,
      currentTheme,
      setReactFlowInstance,
      handleRelayout,
   }
}
