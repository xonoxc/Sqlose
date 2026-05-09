import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Input } from "./input"

describe("Input", () => {
   it("renders with placeholder", () => {
      render(<Input placeholder="Enter text" />)
      expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument()
   })

   it("applies error styling when hasError is true", () => {
      render(<Input hasError />)
      const input = screen.getByRole("textbox")
      expect(input.className).toContain("border-error")
   })

   it("forwards ref", () => {
      const ref = { current: null }
      render(<Input ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
   })

   it("handles value changes", async () => {
      const user = userEvent.setup()
      render(<Input />)
      const input = screen.getByRole("textbox")
      await user.type(input, "hello")
      expect(input).toHaveValue("hello")
   })

   it("is disabled when disabled prop is set", () => {
      render(<Input disabled />)
      expect(screen.getByRole("textbox")).toBeDisabled()
   })
})
