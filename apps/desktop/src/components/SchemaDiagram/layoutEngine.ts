import type { Node, Edge } from "@xyflow/react"
import type { ElkNode } from "elkjs/lib/elk-api"
import { calculateSpacing, calculateNodeDimensions } from "./spacing"
import { toElkGraph, fromElkGraph, type LayoutResult } from "./graphUtils"

let elkInstance: { layout(graph: ElkNode): Promise<ElkNode> } | null = null

async function getElk(): Promise<{ layout(graph: ElkNode): Promise<ElkNode> }> {
   if (!elkInstance) {
      const ElkConstructor = (await import("elkjs/lib/elk.bundled.js")).default
      elkInstance = new ElkConstructor({
         algorithms: ["layered"],
      })
   }
   return elkInstance
}

export async function computeLayout(
   nodes: Node[],
   edges: Edge[]
): Promise<LayoutResult> {
   const nodeDimensions = calculateNodeDimensions(nodes)
   const spacing = calculateSpacing(nodes.length)
   const elkGraph = toElkGraph(nodes, edges, nodeDimensions, spacing)

   const elk = await getElk()
   const layoutResult = await elk.layout(elkGraph)

   return fromElkGraph(layoutResult, nodes, edges)
}
