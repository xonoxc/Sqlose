import { describe, expect, it } from "vitest"
import { buildForeignKeyEdge } from "./index"

describe("buildForeignKeyEdge", () => {
   it("creates a labeled edge for a foreign key relation", () => {
      const edge = buildForeignKeyEdge(
         "orders",
         { fromCol: "customer_id", toTable: "customers", toCol: "id" },
         "#3b82f6",
         "#111827"
      )

      expect(edge).toMatchObject({
         id: "e-orders-customer_id->customers-id",
         source: "orders",
         sourceHandle: "source-customer_id",
         target: "customers",
         targetHandle: "target-id",
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
