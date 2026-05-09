import { describe, it, expect, beforeEach, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AppSidebar } from "./Sidebar"
import { useEnvironmentStore } from "../stores/environmentStore"

describe("AppSidebar", () => {
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
         selectedEnvironmentId: null,
         isLoading: false,
         error: null,
      })
   })

   it("renders environments list", () => {
      render(<AppSidebar onSettingsOpen={() => {}} />)
      expect(screen.getByText("My Postgres")).toBeInTheDocument()
   })

   it("renders status badge", () => {
      render(<AppSidebar onSettingsOpen={() => {}} />)
      expect(screen.getByText("running")).toBeInTheDocument()
   })

   it("selects environment on click", async () => {
      const user = userEvent.setup()
      render(<AppSidebar onSettingsOpen={() => {}} />)

      await user.click(screen.getByText("My Postgres"))
      expect(useEnvironmentStore.getState().selectedEnvironmentId).toBe("env-1")
   })

   it("renders settings button and calls onSettingsOpen", async () => {
      const user = userEvent.setup()
      const onSettingsOpen = vi.fn()
      render(<AppSidebar onSettingsOpen={onSettingsOpen} />)

      await user.click(screen.getByLabelText("Settings"))
      expect(onSettingsOpen).toHaveBeenCalledOnce()
   })
})
