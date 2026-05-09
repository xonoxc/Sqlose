import { Badge, type BadgeProps } from "./badge"
import { cn } from "./cn"

export type VimMode = "normal" | "insert" | "visual" | "visual-line" | "visual-block"

interface VimIndicatorProps {
   mode: VimMode
   className?: string
}

const modeConfig: Record<VimMode, { label: string; variant: BadgeProps["variant"] }> = {
   normal: { label: "-- NORMAL --", variant: "default" },
   insert: { label: "-- INSERT --", variant: "success" },
   visual: { label: "-- VISUAL --", variant: "warning" },
   "visual-line": { label: "-- VISUAL LINE --", variant: "warning" },
   "visual-block": { label: "-- VISUAL BLOCK --", variant: "warning" },
}

export function VimIndicator({ mode, className }: VimIndicatorProps) {
   const config = modeConfig[mode]
   return (
      <Badge variant={config.variant} className={cn("font-mono tracking-wider", className)}>
         {config.label}
      </Badge>
   )
}
