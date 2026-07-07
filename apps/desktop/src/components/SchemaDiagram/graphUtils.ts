import type { Node, Edge } from "@xyflow/react"
import type { ElkNode, ElkPort, ElkExtendedEdge, ElkPoint } from "elkjs/lib/elk-api"
import { HEADER_HEIGHT, ROW_HEIGHT, NODE_WIDTH, type SpacingConfig } from "./spacing"

export interface LayoutResult {
   nodes: Node[]
   edges: Edge[]
}

type ElkNodeInput = ElkNode & { children: ElkNode[]; edges: ElkExtendedEdge[] }

export function toElkGraph(
   nodes: Node[],
   edges: Edge[],
   nodeDimensions: Record<string, { width: number; height: number }>,
   spacing: SpacingConfig
): ElkNodeInput {
   return {
      id: "root",
      layoutOptions: {
         "elk.algorithm": "layered",
         "elk.direction": "RIGHT",
         "elk.layered.spacing.nodeNodeBetweenLayers": String(spacing.ranksep),
         "elk.spacing.nodeNode": String(spacing.nodesep),
         "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
         // Use NETWORK_SIMPLEX instead of BRANDES_KOEPF as it is much better at strictly avoiding node overlaps
         "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
         "elk.layered.edgeRouting": "ORTHOGONAL",
         "elk.layered.nodeLayering.strategy": "NETWORK_SIMPLEX",
         "elk.layered.mergeEdges": "true",
         "elk.layered.compaction.postCompaction.strategy": "EDGE_LENGTH",
         "elk.edgeRouting": "ORTHOGONAL",
         "elk.padding": "[top=40,left=40,bottom=40,right=40]",
         "elk.portConstraints": "FIXED_POS",
         "elk.spacing.edgeNode": "40",
         "elk.spacing.edgeEdge": "15",
         "elk.spacing.portPort": "10",
      },
      children: nodes.map(n => {
         const cols = (n.data as { columns?: { name: string }[] }).columns ?? []
          const ports: (ElkPort & { properties: Record<string, string> })[] = []

          cols.forEach((col, idx) => {
            const yOffset = HEADER_HEIGHT + idx * ROW_HEIGHT + ROW_HEIGHT / 2

            // Target (incoming from parent, on the Left / WEST)
            ports.push({
               id: `${n.id}-target-${col.name}`,
               x: 0,
               y: yOffset,
               properties: { "elk.port.side": "WEST" },
            })

            // Source (outgoing to child, on the Right / EAST)
            ports.push({
               id: `${n.id}-source-${col.name}`,
               x: NODE_WIDTH,
               y: yOffset,
               properties: { "elk.port.side": "EAST" },
            })
         })

         return {
            id: n.id,
            width: nodeDimensions[n.id]?.width ?? NODE_WIDTH,
            height: nodeDimensions[n.id]?.height ?? 200,
            ports,
            layoutOptions: {
               "elk.portConstraints": "FIXED_POS",
            },
         }
      }),
      edges: edges.map(e => ({
         id: e.id,
         sources: [`${e.source}-${e.sourceHandle}`],
         targets: [`${e.target}-${e.targetHandle}`],
      })),
   }
}

export function fromElkGraph(
   elkGraph: ElkNode,
   originalNodes: Node[],
   originalEdges: Edge[]
): LayoutResult {
   const nodeMap = new Map<string, Node>()
   for (const node of originalNodes) {
      nodeMap.set(node.id, { ...node })
   }

   if (elkGraph.children) {
      for (const elkNode of elkGraph.children) {
         const rfNode = nodeMap.get(elkNode.id)
         if (rfNode && elkNode.x !== undefined && elkNode.y !== undefined) {
            rfNode.position = {
               x: elkNode.x,
               y: elkNode.y,
            }
         }
      }
   }

   const bendPointsMap = new Map<string, ElkPoint[]>()
   if (elkGraph.edges) {
      for (const elkEdge of elkGraph.edges) {
         const points: ElkPoint[] = []
         if (elkEdge.sections) {
            for (const section of elkEdge.sections) {
               if (section.bendPoints) {
                  points.push(...section.bendPoints)
               }
            }
         }
         bendPointsMap.set(elkEdge.id, points)
      }
   }

   const updatedEdges = originalEdges.map(e => {
      const bendPoints = bendPointsMap.get(e.id) ?? []

      const edgeCounts = new Map<string, number>()
      for (const edge of originalEdges) {
         const key = `${edge.source}->${edge.target}`
         edgeCounts.set(key, (edgeCounts.get(key) ?? 0) + 1)
      }
      const pairKey = `${e.source}->${e.target}`
      const totalForPair = edgeCounts.get(pairKey) ?? 1
      const indexInPair = originalEdges
         .filter(oe => `${oe.source}->${oe.target}` === pairKey)
         .indexOf(e)

      return {
         ...e,
         data: {
            ...e.data,
            bendPoints,
            edgeIndex: indexInPair,
            edgeCount: totalForPair,
            sourceNodeId: e.source,
            targetNodeId: e.target,
         },
      }
   })

   return {
      nodes: Array.from(nodeMap.values()),
      edges: updatedEdges,
   }
}
