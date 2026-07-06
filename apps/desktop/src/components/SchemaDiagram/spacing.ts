import type { Node } from "@xyflow/react"
import type { ColumnInfo } from "~/lib/schema"

export interface SpacingConfig {
   ranksep: number
   nodesep: number
}

export function calculateSpacing(nodeCount: number): SpacingConfig {
   if (nodeCount >= 100) return { ranksep: 300, nodesep: 220 }
   if (nodeCount >= 50) return { ranksep: 250, nodesep: 180 }
   if (nodeCount >= 20) return { ranksep: 200, nodesep: 150 }
   if (nodeCount >= 10) return { ranksep: 180, nodesep: 120 }
   return { ranksep: 160, nodesep: 100 }
}

const NODE_WIDTH = 288
const HEADER_HEIGHT = 56
const ROW_HEIGHT = 32
const PADDING_BOTTOM = 16

export function calculateNodeDimensions(
   nodes: Node[]
): Record<string, { width: number; height: number }> {
   const dimensions: Record<string, { width: number; height: number }> = {}
   for (const node of nodes) {
      const columns = (node.data as { columns?: ColumnInfo[] })?.columns ?? []
      const height = HEADER_HEIGHT + columns.length * ROW_HEIGHT + PADDING_BOTTOM
      dimensions[node.id] = { width: NODE_WIDTH, height: Math.max(height, 120) }
   }
   return dimensions
}

export { NODE_WIDTH, ROW_HEIGHT, HEADER_HEIGHT, PADDING_BOTTOM }
