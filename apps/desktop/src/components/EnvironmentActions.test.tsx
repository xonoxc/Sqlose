import { describe, it, expect, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { EnvironmentActions } from "~/components/EnvironmentActions"
import { useEnvironmentStore } from "~/stores/environmentStore"

describe("EnvironmentActions", () => {
   const mockEnv = {
      id: "env-1",
      name: "My Postgres",
      dbType: "postgres" as const,
      status: "running" as const,
      port: 5432,
      uptime: 3600,
      connectionString: "postgres://localhost:5432",
      containerId: "abc123",
      createdAt: "2024-01-01T00:00:00Z",
   }

   beforeEach(() => {
      useEnvironmentStore.setState({
         environments: [mockEnv],
         selectedEnvironmentId: "env-1",
         isLoading: false,
         error: null,
      })
   })

   it("shows no environment selected when null", () => {
      render(<EnvironmentActions environment={null} />)
      expect(screen.getByText("No environment selected")).toBeInTheDocument()
   })

   it("renders environment name and status", () => {
      render(<EnvironmentActions environment={mockEnv} />)
      expect(screen.getByText("My Postgres")).toBeInTheDocument()
      expect(screen.getByText("running")).toBeInTheDocument()
   })

   it("renders action buttons", () => {
      render(<EnvironmentActions environment={mockEnv} />)
      expect(screen.getByText("Start")).toBeInTheDocument()
      expect(screen.getByText("Stop")).toBeInTheDocument()
      expect(screen.getByText("Restart")).toBeInTheDocument()
      expect(screen.getByText("Destroy")).toBeInTheDocument()
   })

   it("shows destroy confirmation modal", async () => {
      const user = userEvent.setup()
      render(<EnvironmentActions environment={mockEnv} />)

      await user.click(screen.getByText("Destroy"))

      expect(screen.getByText("Destroy Environment")).toBeInTheDocument()
   })

   it("shows uptime for running environments", () => {
      render(<EnvironmentActions environment={mockEnv} />)
      expect(screen.getByText(/Uptime:/)).toBeInTheDocument()
   })
})
