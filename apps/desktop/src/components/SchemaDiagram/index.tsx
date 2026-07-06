import { useEffect, useState, useCallback } from "react"
import {
   ReactFlow,
   Background,
   Controls,
   MiniMap,
   useNodesState,
   useEdgesState,
   MarkerType,
   type Node,
   type Edge,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { TableNode } from "~/components/SchemaDiagram/TableNode"
import { ForeignKeyEdge } from "~/components/SchemaDiagram/ForeignKeyEdge"
import { computeLayout } from "~/components/SchemaDiagram/layoutEngine"
import { useDatabaseStore } from "~/stores/databaseStore"
import { useEnvironmentStore } from "~/stores/environmentStore"
import { useThemeStore } from "~/stores/theme-store"
import { api } from "~/lib/api"
import { listTables, type ColumnInfo } from "~/lib/schema"
import type { DBType } from "@sqlose/shared"

const nodeTypes = {
   tableNode: TableNode,
}

const edgeTypes = {
   foreignKey: ForeignKeyEdge,
}

export interface ForeignKeyRelation {
   fromCol: string
   toTable: string
   toCol: string
}

async function fetchForeignKeys(
   envId: string,
   tableName: string,
   dbType: DBType
): Promise<ForeignKeyRelation[]> {
   const safeTableName = tableName.replace(/'/g, "''")
   let sql: string

   if (dbType === "sqlite") {
      sql = `PRAGMA foreign_key_list('${safeTableName}')`
      const res = await api.query.execute(envId, sql)
      if (res.isOk()) {
         return res.value.rows.map((r: Record<string, unknown>) => ({
            fromCol: String(r.from),
            toTable: String(r.table),
            toCol: String(r.to),
         }))
      }
      return []
   }

   if (dbType === "postgres") {
      sql = `
         SELECT
            kcu.column_name       AS from_col,
            ccu.table_name        AS to_table,
            ccu.column_name       AS to_col
         FROM information_schema.table_constraints AS tc
         JOIN information_schema.key_column_usage AS kcu
           ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema    = kcu.table_schema
         JOIN information_schema.constraint_column_usage AS ccu
           ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema    = tc.table_schema
         WHERE tc.constraint_type = 'FOREIGN KEY'
           AND tc.table_name      = '${safeTableName}'
           AND tc.table_schema    = 'public'
      `
      const res = await api.query.execute(envId, sql)
      if (res.isOk()) {
         return res.value.rows.map((r: Record<string, unknown>) => ({
            fromCol: String(r.from_col),
            toTable: String(r.to_table),
            toCol:   String(r.to_col),
         }))
      }
      return []
   }

   if (dbType === "mysql") {
      sql = `
         SELECT
            COLUMN_NAME           AS from_col,
            REFERENCED_TABLE_NAME AS to_table,
            REFERENCED_COLUMN_NAME AS to_col
         FROM information_schema.KEY_COLUMN_USAGE
         WHERE TABLE_NAME = '${safeTableName}'
           AND TABLE_SCHEMA = DATABASE()
           AND REFERENCED_TABLE_NAME IS NOT NULL
      `
      const res = await api.query.execute(envId, sql)
      if (res.isOk()) {
         return res.value.rows.map((r: Record<string, unknown>) => ({
            fromCol: String(r.from_col),
            toTable: String(r.to_table),
            toCol:   String(r.to_col),
         }))
      }
      return []
   }

   return []
}

function inferForeignKeys(
   tableName: string,
   columns: ColumnInfo[],
   allTableNames: string[],
   allTableColumns: Record<string, ColumnInfo[]>
): ForeignKeyRelation[] {
   const relations: ForeignKeyRelation[] = []
   const lowerTableNames = allTableNames.map(t => t.toLowerCase())

   for (const col of columns) {
      const colNameLower = col.name.toLowerCase()
      if (colNameLower === "id" || !colNameLower.endsWith("_id")) continue

      const base = col.name.slice(0, -3)
      if (!base) continue

      const candidates = new Set<string>([base, `${base}s`, `${base}es`])
      if (base.endsWith("y") && base.length > 1 && !"aeiou".includes(base[base.length - 2])) {
         candidates.add(`${base.slice(0, -1)}ies`)
      }
      if (base.endsWith("s") && !base.endsWith("ss")) {
         candidates.add(base.slice(0, -1))
      }

      let matchedTable: string | null = null
      for (const candidate of candidates) {
         const idx = lowerTableNames.indexOf(candidate.toLowerCase())
         if (idx !== -1) {
            matchedTable = allTableNames[idx]
            break
         }
      }

      if (matchedTable && matchedTable !== tableName) {
         const targetCols = allTableColumns[matchedTable] || []
         const pkCol = targetCols.find(tc => tc.primaryKey)
         if (pkCol) {
            relations.push({ fromCol: col.name, toTable: matchedTable, toCol: pkCol.name })
         }
      }
   }

   return relations
}

/**
 * Build a foreign key edge.
 * Direction: source = parent PK table (right handle), target = child FK table (left handle).
 * This means the arrow flows from the referenced table → the table with the FK column.
 */
export function buildForeignKeyEdge(
   tableName: string,
   foreignKey: ForeignKeyRelation,
   accentColor: string,
   surfaceColor: string
): Edge {
   return {
      id: `e-${tableName}-${foreignKey.fromCol}->${foreignKey.toTable}-${foreignKey.toCol}`,
      source: foreignKey.toTable,
      sourceHandle: `source-${foreignKey.toCol}`,
      target: tableName,
      targetHandle: `target-${foreignKey.fromCol}`,
      type: "foreignKey",
      animated: false,
      label: `FK: ${foreignKey.fromCol}`,
      labelBgStyle: {
         fill: surfaceColor,
         fillOpacity: 0.95,
      },
      labelBgPadding: [6, 3] as [number, number],
      labelBgBorderRadius: 6,
      labelStyle: {
         fill: accentColor,
         fontSize: 11,
         fontWeight: 600,
      },
      style: {
         stroke: accentColor,
         strokeWidth: 2,
      },
      markerEnd: { type: MarkerType.ArrowClosed, color: accentColor },
      zIndex: 10,
   }
}

type LoadingPhase = "analyzing" | "cleaning" | "done"

const LOADING_MESSAGES: Record<Exclude<LoadingPhase, "done">, string> = {
   analyzing: "Analyzing schema...",
   cleaning: "Laying out diagram...",
}

export function SchemaDiagram() {
   const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
   const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
   const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>("analyzing")
   const [reactFlowInstance, setReactFlowInstance] =
      useState<{ fitView: (opts?: { duration?: number; padding?: number }) => void } | null>(null)

   const envId = useEnvironmentStore(s => s.selectedEnvironmentId)
   const dbType = useEnvironmentStore(s => s.environments.find(e => e.id === envId)?.dbType)
   const tablesByEnv = useDatabaseStore(s => s.tables)
   const fetchTables = useDatabaseStore(s => s.fetchTables)
   const fetchColumns = useDatabaseStore(s => s.fetchColumns)
   const { currentTheme } = useThemeStore()
   const tables = envId ? (tablesByEnv[envId] ?? []) : []

   const initializeDiagram = useCallback(async () => {
      if (!envId || !dbType) return

      setLoadingPhase("analyzing")

      if (tables.length === 0) {
         await fetchTables(envId, dbType)
      }

      let myTables: string[] = []
      try {
         myTables = await listTables(envId, dbType)
      } catch {
         setLoadingPhase("done")
         return
      }

      const newNodes: Node[] = []
      const newEdges: Edge[] = []
      const allTableNames: string[] = []
      const allTableColumns: Record<string, ColumnInfo[]> = {}

      for (const tName of myTables) {
         await fetchColumns(envId, tName, dbType)
         const cols: ColumnInfo[] =
            (useDatabaseStore.getState().tableColumns[envId]?.[tName]) || []

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
                  tName, fk, currentTheme.colors.accent, currentTheme.colors.surface
               )
            )
         }

         const inferredFks = inferForeignKeys(
            tName, allTableColumns[tName], allTableNames, allTableColumns
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
                     tName, fk, currentTheme.colors.accent, currentTheme.colors.surface
                  )
               )
            }
         }
      }

      setLoadingPhase("cleaning")

      const { nodes: layoutedNodes, edges: layoutedEdges } = await computeLayout(
         newNodes,
         newEdges
      )

      setNodes(layoutedNodes)
      setEdges(layoutedEdges)

      setLoadingPhase("done")
   }, [envId, dbType])

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

   const handleRelayout = useCallback(async () => {
      if (nodes.length === 0) return
      setLoadingPhase("cleaning")
      const { nodes: layoutedNodes, edges: layoutedEdges } = await computeLayout(nodes, edges)
      setNodes(layoutedNodes)
      setEdges(layoutedEdges)
      setTimeout(() => {
         reactFlowInstance?.fitView({ duration: 300, padding: 0.15 })
      }, 50)
      setLoadingPhase("done")
   }, [nodes, edges, reactFlowInstance])

   if (loadingPhase !== "done") {
      return (
         <div className="flex h-full items-center justify-center bg-bg-primary">
            <div className="h-6 w-6 rounded-full border-[3px] border-accent/30 border-t-accent animate-spin" />
            <span className="ml-3 text-text-muted">
               {LOADING_MESSAGES[loadingPhase]}
            </span>
         </div>
      )
   }

   return (
      <div className="relative h-full w-full react-diagram-wrapper bg-bg-primary">
         <style>{`
            .react-diagram-wrapper {
               --xy-background-color: transparent;
               --xy-controls-button-background-color: ${currentTheme.colors.surface};
               --xy-controls-button-background-color-hover: ${currentTheme.colors.surface2};
               --xy-controls-button-color: ${currentTheme.colors.text};
               --xy-controls-button-color-hover: ${currentTheme.colors.text};
               --xy-controls-button-border-color: ${currentTheme.colors.border};
               --xy-minimap-background-color: ${currentTheme.colors.surface};
            }
            .react-diagram-wrapper .react-flow {
               background-color: transparent !important;
            }
            .react-diagram-wrapper .react-flow__minimap {
               background-color: ${currentTheme.colors.surface};
               border: 1px solid ${currentTheme.colors.border};
               border-radius: 4px;
            }
            .react-diagram-wrapper .react-flow__controls-button {
               background-color: ${currentTheme.colors.surface};
               border-bottom: 1px solid ${currentTheme.colors.border};
               fill: ${currentTheme.colors.text};
            }
            .react-diagram-wrapper .react-flow__controls-button:hover {
               background-color: ${currentTheme.colors.surface2};
            }
            .react-flow__node {
               transition: transform 0.3s ease;
            }
         `}</style>
         <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            colorMode={currentTheme.monaco.base === "vs-dark" ? "dark" : "light"}
            style={{ backgroundColor: "transparent" }}
            fitView
            minZoom={0.1}
            onInit={setReactFlowInstance}
         >
            <Background color={currentTheme.colors.border} gap={24} />
            <Controls className="bg-bg-secondary border border-border" />
            <MiniMap
               nodeStrokeColor={currentTheme.colors.border}
               nodeColor={currentTheme.colors.surface2}
               maskColor="rgba(0,0,0,0.4)"
            />
         </ReactFlow>
         <button
            onClick={handleRelayout}
            className="absolute bottom-4 right-4 z-50 rounded-lg border px-3 py-1.5 text-xs font-medium shadow-md transition-colors hover:bg-accent/10"
            style={{
               backgroundColor: currentTheme.colors.surface,
               borderColor: currentTheme.colors.border,
               color: currentTheme.colors.text,
            }}
            title="Re-run layout"
         >
            Re-layout
         </button>
      </div>
   )
}
