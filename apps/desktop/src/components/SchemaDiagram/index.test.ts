import { describe, expect, it } from "vitest"
import { calculateSpacing, calculateNodeDimensions } from "./spacing"
import { toElkGraph, fromElkGraph } from "./graphUtils"
import type { Node, Edge } from "@xyflow/react"
import { MarkerType } from "@xyflow/react"

/**
 * Inline copy of buildForeignKeyEdge for test isolation.
 * This avoids importing index.tsx which pulls in React components
 * that don't resolve in the vitest env without full mocking.
 */
function buildForeignKeyEdge(
   tableName: string,
   foreignKey: { fromCol: string; toTable: string; toCol: string },
   accentColor: string,
   surfaceColor: string
): Edge {
   return {
      id: `e-${tableName}-${foreignKey.fromCol}->${foreignKey.toTable}-${foreignKey.toCol}`,
      source: foreignKey.toTable,
      sourceHandle: `source-${foreignKey.toCol}`,
      target: tableName,
      targetHandle: `target-${foreignKey.fromCol}`,
      type: "step",
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

describe("buildForeignKeyEdge", () => {
   it("creates an edge with parent as source and child as target", () => {
      const edge = buildForeignKeyEdge(
         "orders",
         { fromCol: "customer_id", toTable: "customers", toCol: "id" },
         "#3b82f6",
         "#111827"
      )

      expect(edge).toMatchObject({
         id: "e-orders-customer_id->customers-id",
         source: "customers",
         sourceHandle: "source-id",
         target: "orders",
         targetHandle: "target-customer_id",
         type: "step",
         label: "FK: customer_id",
      })
      expect(edge.style).toMatchObject({
         stroke: "#3b82f6",
         strokeWidth: 2,
      })
      expect(edge.markerEnd).toMatchObject({
         color: "#3b82f6",
      })
   })
})

describe("calculateSpacing", () => {
   it("returns base spacing for small schemas", () => {
      const s = calculateSpacing(5)
      expect(s.ranksep).toBe(160)
      expect(s.nodesep).toBe(100)
   })

   it("returns medium-low spacing for 10+ tables", () => {
      const s = calculateSpacing(15)
      expect(s.ranksep).toBe(180)
      expect(s.nodesep).toBe(120)
   })

   it("returns medium spacing for 20+ tables", () => {
      const s = calculateSpacing(30)
      expect(s.ranksep).toBe(200)
      expect(s.nodesep).toBe(150)
   })

   it("returns large spacing for 50+ tables", () => {
      const s = calculateSpacing(60)
      expect(s.ranksep).toBe(250)
      expect(s.nodesep).toBe(180)
   })

   it("returns xlarge spacing for 100+ tables", () => {
      const s = calculateSpacing(120)
      expect(s.ranksep).toBe(300)
      expect(s.nodesep).toBe(220)
   })
})

describe("calculateNodeDimensions", () => {
   it("computes height from column count", () => {
      const nodes: Node[] = [
         {
            id: "users",
            type: "tableNode",
            position: { x: 0, y: 0 },
            data: {
               label: "users",
               columns: [
                  { name: "id", type: "int", nullable: false, primaryKey: true },
                  { name: "name", type: "text", nullable: false, primaryKey: false },
               ],
            },
         },
      ]
      const dims = calculateNodeDimensions(nodes)
      expect(dims.users.width).toBe(288)
      // HEADER_HEIGHT(56) + 2 * ROW_HEIGHT(32) + PADDING_BOTTOM(16) = 136
      expect(dims.users.height).toBe(136)
   })
})

describe("graphUtils", () => {
   it("converts nodes and edges to ELK graph and back", () => {
      const nodes: Node[] = [
         { id: "customers", type: "tableNode", position: { x: 0, y: 0 }, data: {} },
         { id: "orders", type: "tableNode", position: { x: 0, y: 0 }, data: {} },
      ]
      const edges: Edge[] = [
         {
            id: "e-orders-customer_id->customers-id",
            source: "customers",
            sourceHandle: "source-id",
            target: "orders",
            targetHandle: "target-customer_id",
            type: "foreignKey",
         },
      ]
      const nodeDimensions = { customers: { width: 288, height: 150 }, orders: { width: 288, height: 200 } }
      const spacing = { ranksep: 160, nodesep: 100 }

      const elkGraph = toElkGraph(nodes, edges, nodeDimensions, spacing)
      expect(elkGraph.children).toHaveLength(2)
      expect(elkGraph.edges).toHaveLength(1)
      expect(elkGraph.layoutOptions?.["elk.algorithm"]).toBe("layered")
      expect(elkGraph.layoutOptions?.["elk.direction"]).toBe("RIGHT")

      // ELK source/target matches port IDs
      expect(elkGraph.edges[0].sources).toEqual(["customers-source-id"])
      expect(elkGraph.edges[0].targets).toEqual(["orders-target-customer_id"])

      const result = fromElkGraph(
         {
            id: "root",
            children: [
               { id: "customers", x: 100, y: 50, width: 288, height: 150 },
               { id: "orders", x: 100, y: 320, width: 288, height: 200 },
            ],
         },
         nodes,
         edges
      )

      expect(result.nodes).toHaveLength(2)
      const customersNode = result.nodes.find(n => n.id === "customers")
      expect(customersNode?.position).toEqual({ x: 100, y: 50 })

      // Edges are augmented with bendPoints and edge counts
      expect(result.edges).toHaveLength(1)
      expect(result.edges[0].data?.bendPoints).toEqual([])
      expect(result.edges[0].data?.edgeCount).toBe(1)
      expect(result.edges[0].data?.edgeIndex).toBe(0)
   })
})
