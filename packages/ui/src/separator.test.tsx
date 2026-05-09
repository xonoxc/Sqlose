import { describe, it, expect } from "vitest"
import { render } from "@testing-library/react"
import { Separator } from "./separator"

describe("Separator", () => {
   it("renders as horizontal by default", () => {
      const { container } = render(<Separator />)
      const el = container.firstChild as HTMLElement
      expect(el.className).toContain("h-px")
      expect(el.className).toContain("w-full")
   })

   it("renders as vertical when orientation is vertical", () => {
      const { container } = render(<Separator orientation="vertical" />)
      const el = container.firstChild as HTMLElement
      expect(el.className).toContain("h-full")
      expect(el.className).toContain("w-px")
   })

   it("has decorative attribute by default", () => {
      const { container } = render(<Separator />)
      expect(container.firstChild).toHaveAttribute("data-orientation", "horizontal")
   })
})
