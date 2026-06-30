import { useEffect, useState } from "react"
import {
   ReactFlow,
   Background,
   Controls,
   MiniMap,
   useNodesState,
   useEdgesState,
   MarkerType,
   Position,
   type Node,
   type Edge,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import dagre from "dagre"
import { TableNode } from "~/components/SchemaDiagram/TableNode"
import { useDatabaseStore } from "~/stores/databaseStore"
import { useEnvironmentStore } from "~/stores/environmentStore"
import { useThemeStore } from "~/stores/theme-store"
import { api } from "~/lib/api"
import { listTables, type ColumnInfo } from "~/lib/schema"
import type { DBType } from "@sqlose/shared"

const nodeTypes = {
   tableNode: TableNode,
}

export interface ForeignKeyRelation {
   fromCol: string
   toTable: string
   toCol: string
}

// Fetch real foreign key definitions using db-type-appropriate queries.
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

export function buildForeignKeyEdge(
   tableName: string,
   foreignKey: ForeignKeyRelation,
   accentColor: string,
   surfaceColor: string
): Edge {
   return {
      id: `e-${tableName}-${foreignKey.fromCol}->${foreignKey.toTable}-${foreignKey.toCol}`,
      source: tableName,
      sourceHandle: `source-${foreignKey.fromCol}`,
      target: foreignKey.toTable,
      targetHandle: `target-${foreignKey.toCol}`,
      type: "step",
      animated: false,
      label: `FK: ${foreignKey.fromCol}`,
      labelBgStyle: {
         fill: surfaceColor,
         fillOpacity: 0.95,
      },
      labelBgPadding: [6, 3],
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

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = "TB") => {
   const dagreGraph = new dagre.graphlib.Graph()
   dagreGraph.setDefaultEdgeLabel(() => ({}))

   // Node dimensions based roughly on our TableNode styling class w-64
   const nodeWidth = 260
   // A guess for nodeHeight based on rows, we can just use 300 to space them out
   const nodeHeight = 350

   dagreGraph.setGraph({ rankdir: direction, ranksep: 100, nodesep: 150 })

   nodes.forEach(node => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
   })

   edges.forEach(edge => {
      dagreGraph.setEdge(edge.source, edge.target)
   })

   dagre.layout(dagreGraph)

   nodes.forEach(node => {
      const nodeWithPosition = dagreGraph.node(node.id)
      node.targetPosition = direction === "LR" ? Position.Left : Position.Top
      node.sourcePosition = direction === "LR" ? Position.Right : Position.Bottom

      // Shift slightly to center
      node.position = {
         x: nodeWithPosition.x - nodeWidth / 2,
         y: nodeWithPosition.y - nodeHeight / 2,
      }
   })

   return { nodes, edges }
}

export function SchemaDiagram() {
   const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
   const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
   const [loading, setLoading] = useState(true)

   const envId = useEnvironmentStore(s => s.selectedEnvironmentId)
   const dbType = useEnvironmentStore(s => s.environments.find(e => e.id === envId)?.dbType)
   const tablesByEnv = useDatabaseStore(s => s.tables)
   const fetchTables = useDatabaseStore(s => s.fetchTables)
   const fetchColumns = useDatabaseStore(s => s.fetchColumns)
   const { currentTheme } = useThemeStore()
   const tables = envId ? (tablesByEnv[envId] ?? []) : []

   // Load schemas and calculate nodes
   useEffect(() => {
      if (!envId || !dbType) return

      const initializeDiagram = async () => {
         setLoading(true)

         if (tables.length === 0) {
            await fetchTables(envId, dbType)
         }

         // Use listTables from schema.ts — it has the correct db-type-aware query
         // with proper WHERE filters (e.g. table_schema='public' for postgres),
         // so system tables like pg_timezone_abbrevs are never included.
         let myTables: string[] = []
         try {
            myTables = await listTables(envId, dbType)
         } catch {
            setLoading(false)
            return
         }

         const newNodes: Node[] = []
         const newEdges: Edge[] = []
         const allTableNames: string[] = []
         const allTableColumns: Record<string, ColumnInfo[]> = {}

         for (const tName of myTables) {
            await fetchColumns(envId, tName, dbType)
            const cols: ColumnInfo[] = (useDatabaseStore.getState().tableColumns[envId]?.[tName]) || []

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
            // Use db-type-aware FK fetching (PRAGMA for sqlite, information_schema for pg/mysql)
            const explicitFks = await fetchForeignKeys(envId, tName, dbType)
            for (const fk of explicitFks) {
               newEdges.push(
                  buildForeignKeyEdge(tName, fk, currentTheme.colors.accent, currentTheme.colors.surface)
               )
            }

            const inferredFks = inferForeignKeys(tName, allTableColumns[tName], allTableNames, allTableColumns)
            for (const fk of inferredFks) {
               const isDuplicate = newEdges.some(
                  edge =>
                     edge.source === tName &&
                     edge.sourceHandle === `source-${fk.fromCol}` &&
                     edge.target === fk.toTable
               )
               if (!isDuplicate) {
                  newEdges.push(
                     buildForeignKeyEdge(tName, fk, currentTheme.colors.accent, currentTheme.colors.surface)
                  )
               }
            }
         }

         const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            newNodes,
            newEdges,
            "LR"
         )
         setNodes(layoutedNodes)
         setEdges(layoutedEdges)

         setLoading(false)
      }

      initializeDiagram()
   }, [envId, dbType])

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

   if (loading) {
      return (
         <div className="flex h-full items-center justify-center bg-bg-primary">
            <div className="h-6 w-6 rounded-full border-[3px] border-accent/30 border-t-accent animate-spin" />
            <span className="ml-3 text-text-muted">Analyzing Schema...</span>
         </div>
      )
   }

   return (
      <div className="h-full w-full react-diagram-wrapper bg-bg-primary">
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
         `}</style>
         <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            colorMode={currentTheme.monaco.base === "vs-dark" ? "dark" : "light"}
            style={{ backgroundColor: "transparent" }}
            fitView
            minZoom={0.1}
         >
            <Background color={currentTheme.colors.border} gap={24} />
            <Controls className="bg-bg-secondary border border-border" />
            <MiniMap
               nodeStrokeColor={currentTheme.colors.border}
               nodeColor={currentTheme.colors.surface2}
               maskColor="rgba(0,0,0,0.4)"
            />
         </ReactFlow>
      </div>
   )
}
