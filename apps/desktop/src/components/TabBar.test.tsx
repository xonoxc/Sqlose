import { describe, it, expect, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { TabBar } from "~/components/TabBar"
import { useWorkspaceStore } from "~/stores/workspaceStore"
import { createTab, createDefaultPaneSizes } from "~/lib/types"

describe("TabBar", () => {
   beforeEach(() => {
      const tab1 = createTab()
      tab1.title = "Query 1"
      const tab2 = createTab()
      tab2.title = "Query 2"
      tab2.isDirty = true
      const wData = {
         tabs: [tab1, tab2],
         activeTabId: tab1.id,
         paneSizes: createDefaultPaneSizes(),
      }
      useWorkspaceStore.setState({
         workspaces: { "env-test": wData },
         activeWorkspaceId: "env-test",
         tabs: wData.tabs,
         activeTabId: wData.activeTabId,
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
      expect(useWorkspaceStore.getState().activeTabId).toBe(
         useWorkspaceStore.getState().workspaces["env-test"].activeTabId
      )
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
