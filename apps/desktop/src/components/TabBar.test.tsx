import { describe, it, expect, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { TabBar } from "./TabBar"
import { useWorkspaceStore } from "../stores/workspaceStore"

describe("TabBar", () => {
   beforeEach(() => {
      useWorkspaceStore.setState({
         tabs: [
            {
               id: "tab-1",
               type: "query",
               title: "Query 1",
               environmentId: null,
               isDirty: false,
               isExecuting: false,
               query: "",
               result: null,
               error: null,
               createdAt: "2024-01-01T00:00:00Z",
            },
            {
               id: "tab-2",
               type: "query",
               title: "Query 2",
               environmentId: null,
               isDirty: true,
               isExecuting: false,
               query: "",
               result: null,
               error: null,
               createdAt: "2024-01-01T00:00:00Z",
            },
         ],
         activeTabId: "tab-1",
      })
   })

   it("renders all tabs", () => {
      render(<TabBar />)
      expect(screen.getByText("Query 1")).toBeInTheDocument()
      expect(screen.getByText("Query 2")).toBeInTheDocument()
   })

   it("shows dirty indicator on dirty tabs", () => {
      render(<TabBar />)
      const tab2 = screen.getByText("Query 2").closest("[class*='group']")
      expect(tab2?.querySelector("[class*='rounded-full']")).toBeInTheDocument()
   })

   it("switches active tab on click", async () => {
      const user = userEvent.setup()
      render(<TabBar />)
      await user.click(screen.getByText("Query 2"))
      expect(useWorkspaceStore.getState().activeTabId).toBe("tab-2")
   })

   it("closes tab when close button clicked", async () => {
      const user = userEvent.setup()
      render(<TabBar />)

      const closeButtons = screen.getAllByLabelText("Close tab")
      await user.click(closeButtons[0])

      expect(useWorkspaceStore.getState().tabs.length).toBe(1)
   })

   it("opens new tab when plus button clicked", async () => {
      const user = userEvent.setup()
      render(<TabBar />)

      await user.click(screen.getByLabelText("New tab"))
      expect(useWorkspaceStore.getState().tabs.length).toBe(3)
   })
})
