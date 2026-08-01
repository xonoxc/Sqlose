import { describe, it, expect, beforeAll, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ok } from "neverthrow"
import { SettingsPanel } from "~/components/SettingsPanel"
import * as apiMod from "~/lib/api"

beforeAll(() => {
   Element.prototype.hasPointerCapture = () => false
   Element.prototype.setPointerCapture = () => {}
   Element.prototype.releasePointerCapture = () => {}
   Element.prototype.scrollIntoView = () => {}
})

describe("re-render while open", () => {
   it("dropdown stays open when fonts finish loading", async () => {
      let resolveList: (v: unknown) => void = () => {}
      const gate = new Promise(res => {
         resolveList = res
      })
      vi.spyOn(apiMod.api.fonts, "list").mockReturnValue(
         gate.then(() => ok(["Font A", "Font B", "Font C"]))
      )

      const user = userEvent.setup()
      render(<SettingsPanel isOpen={true} onClose={() => {}} />)

      const trigger = screen.getByText("Geist Mono").closest("button")!
      await user.click(trigger)

      await waitFor(() => {
         expect(screen.getByText("Loading fonts...")).toBeInTheDocument()
      })

      resolveList(null)
      await waitFor(() => {
         expect(screen.getByText("Font A")).toBeInTheDocument()
      })

      expect(document.querySelector('[data-slot="select-content"]')).not.toBeNull()
   })
})
