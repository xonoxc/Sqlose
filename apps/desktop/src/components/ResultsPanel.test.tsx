import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { ResultsPanel } from "./ResultsPanel"

describe("ResultsPanel", () => {
   it("shows executing state", () => {
      render(<ResultsPanel result={null} error={null} isExecuting={true} />)
      expect(screen.getByText("Executing query...")).toBeInTheDocument()
   })

   it("shows error state", () => {
      render(<ResultsPanel result={null} error="Syntax error near SELECT" isExecuting={false} />)
      expect(screen.getByText("Query Execution Failed")).toBeInTheDocument()
      expect(screen.getByText("Syntax error near SELECT")).toBeInTheDocument()
   })

   it("shows empty state when no result or error", () => {
      render(<ResultsPanel result={null} error={null} isExecuting={false} />)
      expect(screen.getByText("Ready to run query")).toBeInTheDocument()
   })

   it("shows result data", () => {
      const result = {
         columns: ["id", "name"],
         rows: [
            { id: 1, name: "Alice" },
            { id: 2, name: "Bob" },
         ],
         rowCount: 2,
         executionTimeMs: 42,
      }
      render(<ResultsPanel result={result} error={null} isExecuting={false} />)
      expect(screen.getByText("2 rows returned")).toBeInTheDocument()
      expect(screen.getByText("in 42ms")).toBeInTheDocument()
   })

   it("shows singular row count", () => {
      const result = {
         columns: ["id"],
         rows: [{ id: 1 }],
         rowCount: 1,
         executionTimeMs: 10,
      }
      render(<ResultsPanel result={result} error={null} isExecuting={false} />)
      expect(screen.getByText("1 row returned")).toBeInTheDocument()
   })
})
