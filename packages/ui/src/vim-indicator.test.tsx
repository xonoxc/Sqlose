import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { VimIndicator } from "./vim-indicator"

describe("VimIndicator", () => {
   it("renders -- NORMAL -- for normal mode", () => {
      render(<VimIndicator mode="normal" />)
      expect(screen.getByText("-- NORMAL --")).toBeInTheDocument()
   })

   it("renders -- INSERT -- for insert mode", () => {
      render(<VimIndicator mode="insert" />)
      expect(screen.getByText("-- INSERT --")).toBeInTheDocument()
   })

   it("renders -- VISUAL -- for visual mode", () => {
      render(<VimIndicator mode="visual" />)
      expect(screen.getByText("-- VISUAL --")).toBeInTheDocument()
   })

   it("renders -- VISUAL LINE -- for visual-line mode", () => {
      render(<VimIndicator mode="visual-line" />)
      expect(screen.getByText("-- VISUAL LINE --")).toBeInTheDocument()
   })

   it("renders -- VISUAL BLOCK -- for visual-block mode", () => {
      render(<VimIndicator mode="visual-block" />)
      expect(screen.getByText("-- VISUAL BLOCK --")).toBeInTheDocument()
   })

   it("applies custom className", () => {
      render(<VimIndicator mode="normal" className="custom-class" />)
      const badge = screen.getByText("-- NORMAL --")
      expect(badge.className).toContain("custom-class")
   })
})
