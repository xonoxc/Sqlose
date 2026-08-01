import { MarkerType, type Edge } from "@xyflow/react"
import type { ForeignKeyRelation } from "./fkQueries"

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
