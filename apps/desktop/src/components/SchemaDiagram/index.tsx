import { useEffect, useState } from "react"
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
import dagre from "dagre"
import { TableNode } from "./TableNode"
import { useDatabaseStore } from "../../stores/databaseStore"
import { useEnvironmentStore } from "../../stores/environmentStore"
import { useThemeStore } from "../../stores/theme-store"
import { api } from "../../lib/api"
import type { ColumnInfo } from "../../lib/schema"

const nodeTypes = {
   tableNode: TableNode,
}

// Extract foreign keys since SQLite doesn't natively return them in pragma_table_info.
// We query sqlite_master for table definitions and parse them.
// We are doing a very simplistic fetch mechanism here for any FKs inside SQLite
// Note: If postgres/mysql, we'd need appropriate queries, but since this is primarily sqlite, we just do a fallback logic.
async function fetchForeignKeys(envId: string, tableName: string): Promise<Array<{fromCol: string, toTable: string, toCol: string}>> {
   try {
       // Assuming sqlite for now, we can use pragma foreign_key_list
       const sql = `PRAGMA foreign_key_list('${tableName}')`
       const res = await api.query.execute(envId, sql)
       if (res.isOk()) {
           return res.value.rows.map((r: any) => ({
               fromCol: String(r.from),
               toTable: String(r.table),
               toCol: String(r.to)
           }))
       }
   } catch {
       // Ignore errors, fallback
   }
   return []
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
      node.targetPosition = direction === "LR" ? "left" : "top" as any
      node.sourcePosition = direction === "LR" ? "right" : "bottom" as any

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
   const { tables, fetchTables, fetchColumns } = useDatabaseStore()
   const { currentTheme } = useThemeStore()

   // Load schemas and calculate nodes
   useEffect(() => {
      if (!envId || !dbType) return

      const initializeDiagram = async () => {
         setLoading(true)
         
         // Fetch all tables if needed
         if (tables.length === 0) {
            await fetchTables(envId, dbType)
         }
         
         const dbTablesRes = await api.query.execute(envId, dbType === 'sqlite' ? "SELECT name FROM sqlite_master WHERE type='table'" : "SELECT table_name FROM information_schema.tables")
         const myTables = dbTablesRes.isOk() ? dbTablesRes.value?.rows?.map((r:any) => r.name || r.table_name) || [] : []

         const newNodes: Node[] = []
         const newEdges: Edge[] = []

         for (const t of myTables) {
             const tName = String(t)
             if (tName.startsWith("sqlite_")) continue // Skip internal SQLite tables
             
             // Ensure columns are fetched
             await fetchColumns(envId, tName, dbType)
             const cols: ColumnInfo[] = useDatabaseStore.getState().tableColumns[tName] || []
             
             // Construct Node
             newNodes.push({
                 id: tName,
                 type: "tableNode",
                 position: { x: 0, y: 0 },
                 data: { label: tName, columns: cols }
             })
             
             // Fetch and Process FKs for Edges
             const fks = await fetchForeignKeys(envId, tName)
             for (const fk of fks) {
                 newEdges.push({
                     id: `e-${tName}-${fk.fromCol}->${fk.toTable}-${fk.toCol}`,
                     source: tName,
                     sourceHandle: `source-${fk.fromCol}`,
                     target: fk.toTable,
                     targetHandle: `target-${fk.toCol}`,
                     type: 'smoothstep',
                     animated: true,
                     style: { stroke: currentTheme.colors.textMuted, strokeWidth: 1.5, opacity: 0.4 },
                     markerEnd: { type: MarkerType.ArrowClosed, color: currentTheme.colors.textMuted },
                 })
             }
         }

         const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(newNodes, newEdges, "LR")
         setNodes(layoutedNodes)
         setEdges(layoutedEdges)
         
         setLoading(false)
      }

      initializeDiagram()
   }, [envId, dbType])

   if (loading) {
      return (
         <div className="flex h-full items-center justify-center bg-bg-primary">
            <div className="h-6 w-6 rounded-full border-[3px] border-accent/30 border-t-accent animate-spin" />
            <span className="ml-3 text-text-muted">Analyzing Schema...</span>
         </div>
      )
   }

   return (
      <div className="h-full w-full react-diagram-wrapper bg-black/20">
         <style>{`
            .react-diagram-wrapper {
               --xy-controls-button-background-color: ${currentTheme.colors.surface};
               --xy-controls-button-background-color-hover: ${currentTheme.colors.surface2};
               --xy-controls-button-color: ${currentTheme.colors.text};
               --xy-controls-button-color-hover: ${currentTheme.colors.text};
               --xy-controls-button-border-color: ${currentTheme.colors.border};
               --xy-minimap-background-color: ${currentTheme.colors.surface};
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
            <MiniMap nodeStrokeColor={currentTheme.colors.border} nodeColor={currentTheme.colors.surface} maskColor="rgba(0,0,0,0.4)" />
         </ReactFlow>
      </div>
   )
}
