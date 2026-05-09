import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { Badge } from "./badge"

describe("Badge", () => {
   it("renders children", () => {
      render(<Badge>Active</Badge>)
      expect(screen.getByText("Active")).toBeInTheDocument()
   })

   it("applies default variant classes", () => {
      render(<Badge>Default</Badge>)
      const badge = screen.getByText("Default")
      expect(badge.className).toContain("bg-accent")
   })

   it("applies success variant classes", () => {
      render(<Badge variant="success">Done</Badge>)
      const badge = screen.getByText("Done")
      expect(badge.className).toContain("bg-success")
   })

   it("applies destructive variant classes", () => {
      render(<Badge variant="destructive">Error</Badge>)
      const badge = screen.getByText("Error")
      expect(badge.className).toContain("bg-error")
   })

   it("applies warning variant classes", () => {
      render(<Badge variant="warning">Pending</Badge>)
      const badge = screen.getByText("Pending")
      expect(badge.className).toContain("bg-warning")
   })

   it("applies outline variant classes", () => {
      render(<Badge variant="outline">Outline</Badge>)
      const badge = screen.getByText("Outline")
      expect(badge.className).toContain("border-border")
   })
})
