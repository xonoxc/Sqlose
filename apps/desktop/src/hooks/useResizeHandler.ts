import { useCallback } from "react"

interface ResizeHandlerOptions {
   axis: "x" | "y"
   min: number
   max: number
   onResize: (value: number) => void
}

export function useResizeHandler({ axis, min, max, onResize }: ResizeHandlerOptions) {
   const handleMouseDown = useCallback(
      (e: React.MouseEvent, currentValue: number) => {
         e.preventDefault()
         const startPos = axis === "x" ? e.clientX : e.clientY
         const startValue = currentValue

         const handleMouseMove = (moveE: MouseEvent) => {
            const current = axis === "x" ? moveE.clientX : moveE.clientY
            const delta = current - startPos
            const newValue = Math.max(
               min,
               Math.min(max, startValue + (axis === "x" ? delta : -delta))
            )
            onResize(Math.round(newValue))
         }

         const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove)
            document.removeEventListener("mouseup", handleMouseUp)
            document.body.style.cursor = ""
            document.body.style.userSelect = ""
         }

         document.addEventListener("mousemove", handleMouseMove)
         document.addEventListener("mouseup", handleMouseUp)
         document.body.style.cursor = axis === "x" ? "col-resize" : "row-resize"
         document.body.style.userSelect = "none"
      },
      [axis, min, max, onResize]
   )

   return { handleMouseDown }
}
