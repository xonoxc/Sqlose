import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { ResultsPanel } from "~/components/ResultsPanel"

describe("ResultsPanel", () => {
   it("shows executing state", () => {
      render(
         <ResultsPanel
            result={null}
            error={null}
            isExecuting={true}
            executionTimeMs={null}
            rowCount={null}
            activeTab="results"
         />
      )
      expect(screen.getByText("Processing your query...")).toBeInTheDocument()
   })

   it("shows error state", () => {
      render(
         <ResultsPanel
            result={null}
            error="Syntax error near SELECT"
            isExecuting={false}
            executionTimeMs={null}
            rowCount={null}
            activeTab="results"
         />
      )
      expect(screen.getByText("Execution Error")).toBeInTheDocument()
      expect(screen.getByText("Syntax error near SELECT")).toBeInTheDocument()
   })

   it("shows empty state when no result or error", () => {
      render(
         <ResultsPanel
            result={null}
            error={null}
            isExecuting={false}
            executionTimeMs={null}
            rowCount={null}
            activeTab="results"
         />
      )
      expect(screen.getByText("Ready to Execute")).toBeInTheDocument()
   })

   it("renders result data when provided", () => {
      const result = {
         columns: ["id", "name"],
         rows: [
            { id: 1, name: "Alice" },
            { id: 2, name: "Bob" },
         ],
         rowCount: 2,
         executionTimeMs: 42,
      }
      render(
         <ResultsPanel
            result={result}
            error={null}
            isExecuting={false}
            executionTimeMs={42}
            rowCount={2}
            activeTab="results"
         />
      )
      expect(screen.getByText("id")).toBeInTheDocument()
      expect(screen.getByText("name")).toBeInTheDocument()
   })
})
