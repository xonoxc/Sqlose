import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SettingsPanel } from "./SettingsPanel"
import { useSettingsStore } from "../stores/settingsStore"

describe("SettingsPanel", () => {
   it("renders settings when open", () => {
      render(<SettingsPanel isOpen={true} onClose={() => {}} />)
      expect(screen.getByText("Settings")).toBeInTheDocument()
      expect(screen.getByText("Vim Mode")).toBeInTheDocument()
   })

   it("shows vim toggle", () => {
      render(<SettingsPanel isOpen={true} onClose={() => {}} />)
      expect(screen.getByLabelText("Toggle Vim mode")).toBeInTheDocument()
   })

   it("toggles vim mode", async () => {
      const user = userEvent.setup()
      useSettingsStore.setState({ vimModeEnabled: false })

      render(<SettingsPanel isOpen={true} onClose={() => {}} />)
      await user.click(screen.getByLabelText("Toggle Vim mode"))

      expect(useSettingsStore.getState().vimModeEnabled).toBe(true)
   })

   it("shows keybindings list", () => {
      render(<SettingsPanel isOpen={true} onClose={() => {}} />)
      expect(screen.getByText("Keybindings")).toBeInTheDocument()
      expect(screen.getAllByText("Execute Query")).toHaveLength(2)
      expect(screen.getAllByText("Open Command Palette")).toHaveLength(2)
   })

   it("resets keybindings", async () => {
      const user = userEvent.setup()
      useSettingsStore.setState({
         keybindings: [],
      })

      render(<SettingsPanel isOpen={true} onClose={() => {}} />)
      await user.click(screen.getByText("Reset"))

      expect(useSettingsStore.getState().keybindings.length).toBeGreaterThan(0)
   })

   it("calls onClose when done clicked", async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()

      render(<SettingsPanel isOpen={true} onClose={onClose} />)
      await user.click(screen.getByText("Done"))

      expect(onClose).toHaveBeenCalled()
   })
})
