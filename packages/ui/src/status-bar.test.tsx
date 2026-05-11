import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { StatusBar } from "./status-bar"

describe("StatusBar", () => {
   it("renders vim indicator when vimMode is provided", () => {
      render(<StatusBar vimMode="normal" />)
      expect(screen.getByText("-- NORMAL --")).toBeInTheDocument()
   })

   it("renders db type label when provided", () => {
      render(<StatusBar dbType="postgres" />)
      expect(screen.getByText("PG")).toBeInTheDocument()
   })

   it("renders MySQL label", () => {
      render(<StatusBar dbType="mysql" />)
      expect(screen.getByText("MySQL")).toBeInTheDocument()
   })

   it("renders SQLite label", () => {
      render(<StatusBar dbType="sqlite" />)
      expect(screen.getByText("SQLite")).toBeInTheDocument()
   })

   it("renders left items when provided", () => {
      render(<StatusBar leftItems={<span>Custom Left</span>} />)
      expect(screen.getByText("Custom Left")).toBeInTheDocument()
   })
})
