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
         selectedEnvironmentId: "env-1",
         isLoading: false,
         error: null,
      })
   })

   it("renders selected database name in header", () => {
      render(<AppSidebar onSettingsOpen={() => {}} onClose={() => {}} />)
      expect(screen.getByText("My Postgres")).toBeInTheDocument()
   })

   it("renders tables section header", () => {
      render(<AppSidebar onSettingsOpen={() => {}} onClose={() => {}} />)
      expect(screen.getByText("Tables")).toBeInTheDocument()
   })

   it("renders settings button and calls onSettingsOpen", async () => {
      const user = userEvent.setup()
      const onSettingsOpen = vi.fn()
      render(<AppSidebar onSettingsOpen={onSettingsOpen} onClose={() => {}} />)

      await user.click(screen.getByLabelText("Settings"))
      expect(onSettingsOpen).toHaveBeenCalledOnce()
   })

   it("renders collapse button", () => {
      render(<AppSidebar onSettingsOpen={() => {}} onClose={() => {}} />)
      expect(screen.getByLabelText("Collapse sidebar")).toBeInTheDocument()
   })

   it("renders filter input", () => {
      render(<AppSidebar onSettingsOpen={() => {}} onClose={() => {}} />)
      expect(screen.getByPlaceholderText("Filter tables...")).toBeInTheDocument()
   })

   it("renders refresh button", () => {
      render(<AppSidebar onSettingsOpen={() => {}} onClose={() => {}} />)
      expect(screen.getByLabelText("Refresh tables")).toBeInTheDocument()
   })
})
