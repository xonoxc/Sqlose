import type { EdgeProps } from "@xyflow/react"
import { BaseEdge, EdgeLabelRenderer } from "@xyflow/react"
import type { ElkPoint } from "elkjs/lib/elk-api"
import { useThemeStore } from "~/stores/theme-store"

function getOrthogonalPoints(
   sourceX: number,
   sourceY: number,
   bendPoints: ElkPoint[],
   targetX: number,
   targetY: number
): ElkPoint[] {
   const points: ElkPoint[] = [{ x: sourceX, y: sourceY }]

   if (bendPoints.length === 0) {
      const midX = sourceX + (targetX - sourceX) / 2
      points.push({ x: midX, y: sourceY })
      points.push({ x: midX, y: targetY })
      points.push({ x: targetX, y: targetY })
      return points
   }

   let cx: number
   let cy = sourceY

   // 1. First segment leaves EAST, so move horizontally first.
   const bp0 = bendPoints[0]
   points.push({ x: bp0.x, y: cy })
   points.push({ x: bp0.x, y: bp0.y })
   cx = bp0.x
   cy = bp0.y

   // 2. Intermediate segments
   for (let i = 1; i < bendPoints.length; i++) {
      const bp = bendPoints[i]
      if (Math.abs(bp.x - cx) > Math.abs(bp.y - cy)) {
         points.push({ x: bp.x, y: cy })
         points.push({ x: bp.x, y: bp.y })
      } else {
         points.push({ x: cx, y: bp.y })
         points.push({ x: bp.x, y: bp.y })
      }
      cx = bp.x
      cy = bp.y
   }

   // 3. Last segment must enter WEST, so enter horizontally.
   if (Math.abs(cx - targetX) > 1 || Math.abs(cy - targetY) > 1) {
      points.push({ x: cx, y: targetY })
      points.push({ x: targetX, y: targetY })
   }

   // Deduplicate points
   const deduped: ElkPoint[] = [points[0]]
   for (let i = 1; i < points.length; i++) {
      const p = points[i]
      const last = deduped[deduped.length - 1]
      if (Math.abs(p.x - last.x) > 0.1 || Math.abs(p.y - last.y) > 0.1) {
         deduped.push(p)
      }
   }

   return deduped
}

function buildPathString(points: ElkPoint[]): string {
   if (points.length === 0) return ""
   const parts = [`M ${points[0].x} ${points[0].y}`]
   for (let i = 1; i < points.length; i++) {
      parts.push(`L ${points[i].x} ${points[i].y}`)
   }
   return parts.join(" ")
}

function getLabelPosition(points: ElkPoint[]): { x: number; y: number } | null {
   if (points.length < 2) return null

   let totalLen = 0
   for (let i = 1; i < points.length; i++) {
      totalLen += Math.abs(points[i].x - points[i - 1].x) + Math.abs(points[i].y - points[i - 1].y)
   }
   if (totalLen === 0) return null

   const targetLen = totalLen * 0.35 // 35% along the line
   let accumulated = 0

   for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      const segLen = Math.abs(curr.x - prev.x) + Math.abs(curr.y - prev.y)
      
      if (accumulated + segLen >= targetLen) {
         const frac = segLen > 0 ? (targetLen - accumulated) / segLen : 0
         return {
            x: prev.x + (curr.x - prev.x) * frac,
            y: prev.y + (curr.y - prev.y) * frac,
         }
      }
      accumulated += segLen
   }
   
   return { x: points[points.length - 1].x, y: points[points.length - 1].y }
}

const PARALLEL_OFFSET = 6

function applyMultiEdgeOffset(
   sourceX: number,
   sourceY: number,
   bendPoints: ElkPoint[],
   targetX: number,
   targetY: number,
   edgeIndex: number,
   edgeCount: number
): { sourceX: number; sourceY: number; bendPoints: ElkPoint[]; targetX: number; targetY: number } {
   if (edgeCount <= 1) return { sourceX, sourceY, bendPoints, targetX, targetY }

   const center = (edgeCount - 1) / 2
   const offset = (edgeIndex - center) * PARALLEL_OFFSET

   // Instead of slanting mathematically, apply horizontal/vertical translation
   // that preserves the start and end node attachments.
   return {
      sourceX, // Keep sourceX attached to node edge
      sourceY: sourceY + offset,
      bendPoints: bendPoints.map(bp => ({ x: bp.x + offset, y: bp.y + offset })),
      targetX, // Keep targetX attached to node edge
      targetY: targetY + offset,
   }
}

export function ForeignKeyEdge(props: EdgeProps) {
   const { currentTheme } = useThemeStore()

   const {
      sourceX,
      sourceY,
      targetX,
      targetY,
      markerEnd,
      style,
      label,
      labelStyle,
      labelBgStyle,
      labelBgPadding,
      labelBgBorderRadius,
   } = props

   const data = props.data as
      | {
           bendPoints?: ElkPoint[]
           edgeIndex?: number
           edgeCount?: number
        }
      | undefined

   const bendPoints = data?.bendPoints ?? []
   const edgeIndex = data?.edgeIndex ?? 0
   const edgeCount = data?.edgeCount ?? 1

   const offset = applyMultiEdgeOffset(
      sourceX,
      sourceY,
      bendPoints,
      targetX,
      targetY,
      edgeIndex,
      edgeCount
   )

   const points = getOrthogonalPoints(
      offset.sourceX,
      offset.sourceY,
      offset.bendPoints,
      offset.targetX,
      offset.targetY
   )
   
   const path = buildPathString(points)
   const labelPos = getLabelPosition(points)

   const accentColor = (labelStyle as React.CSSProperties)?.fill as string ?? currentTheme.colors.accent
   const bgColor = (labelBgStyle as React.CSSProperties)?.fill as string ?? currentTheme.colors.surface

   return (
      <>
         <BaseEdge
            path={path}
            markerEnd={markerEnd}
            style={{ ...style, fill: "none" }} // Ensure path doesn't fill
         />
         {label && labelPos && (
            <EdgeLabelRenderer>
               <div
                  className="pointer-events-none absolute z-20 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[11px] font-semibold leading-none"
                  style={{
                     color: accentColor,
                     backgroundColor: bgColor,
                     opacity: 0.95,
                     padding: labelBgPadding
                        ? `${(labelBgPadding as [number, number])[1]}px ${(labelBgPadding as [number, number])[0]}px`
                        : "3px 6px",
                     borderRadius: labelBgBorderRadius ?? 6,
                     transform: `translate(-50%, -50%) translate(${labelPos.x}px, ${labelPos.y}px)`,
                     border: `1px solid ${accentColor}20`,
                  }}
               >
                  {label}
               </div>
            </EdgeLabelRenderer>
         )}
      </>
   )
}
