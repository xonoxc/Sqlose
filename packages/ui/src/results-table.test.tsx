import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { ResultsTable } from "./results-table"

describe("ResultsTable", () => {
   it("renders empty message when no data", () => {
      render(<ResultsTable data={[]} />)
      expect(screen.getByText("No results")).toBeInTheDocument()
   })

   it("renders custom empty message", () => {
      render(<ResultsTable data={[]} emptyMessage="Nothing to show" />)
      expect(screen.getByText("Nothing to show")).toBeInTheDocument()
   })

   it("renders column headers from data keys", () => {
      const data = [{ name: "Alice", age: 30 }]
      render(<ResultsTable data={data} />)
      expect(screen.getByText("name")).toBeInTheDocument()
      expect(screen.getByText("age")).toBeInTheDocument()
   })

   it("shows row count in thead", () => {
      const data = [
         { name: "Alice", age: 30 },
         { name: "Bob", age: 25 },
      ]
      render(<ResultsTable data={data} />)
      expect(screen.getByText("name")).toBeInTheDocument()
      expect(screen.getByText("age")).toBeInTheDocument()
   })
})
