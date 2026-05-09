import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ResizablePane } from "./resizable-pane"

describe("ResizablePane interactions", () => {
   it("renders left and right panels", () => {
      render(<ResizablePane left={<div>Left</div>} right={<div>Right</div>} />)
      expect(screen.getByText("Left")).toBeInTheDocument()
      expect(screen.getByText("Right")).toBeInTheDocument()
   })

   it("renders resize handle", () => {
      render(<ResizablePane left={<div>Left</div>} right={<div>Right</div>} />)
      const handle = document.querySelector(".cursor-col-resize")
      expect(handle).toBeInTheDocument()
   })

   it("applies custom className", () => {
      const { container } = render(
         <ResizablePane left={<div>L</div>} right={<div>R</div>} className="custom-class" />
      )
      expect(container.firstChild).toHaveClass("custom-class")
   })

   it("calls onResize when handle is dragged", async () => {
      const onResize = vi.fn()

      const { container } = render(
         <ResizablePane left={<div>L</div>} right={<div>R</div>} onResize={onResize} />
      )

      const handle = container.querySelector(".cursor-col-resize")!
      expect(handle).toBeInTheDocument()

      await userEvent.pointer({ keys: "[MouseLeft>]", target: handle })
      await userEvent.pointer({ keys: "[/MouseLeft]", target: handle })
   })

   it("applies dragging styles on mouse down", async () => {
      const { container } = render(<ResizablePane left={<div>L</div>} right={<div>R</div>} />)
      const handle = container.querySelector(".cursor-col-resize")!
      await userEvent.pointer({ keys: "[MouseLeft>]", target: handle })
      expect(handle).toHaveClass("bg-accent/50")
   })
})
