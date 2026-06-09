import { cn } from "./cn"

export type VimMode = "normal" | "insert" | "visual" | "visual-line" | "visual-block"

interface VimIndicatorProps {
   mode: VimMode
   className?: string
}

const modeConfig: Record<VimMode, { label: string }> = {
   normal: { label: "NORMAL" },
   insert: { label: "INSERT" },
   visual: { label: "VISUAL" },
   "visual-line": { label: "V-LINE" },
   "visual-block": { label: "V-BLOCK" },
}

export function VimIndicator({ mode, className }: VimIndicatorProps) {
   const config = modeConfig[mode]
   return <span className={cn("font-mono font-semibold", className)}>{config.label}</span>
}
