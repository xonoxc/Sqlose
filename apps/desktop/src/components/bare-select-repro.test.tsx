import { describe, it, expect, beforeAll } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@sqlose/ui"

beforeAll(() => {
   Element.prototype.hasPointerCapture = () => false
   Element.prototype.setPointerCapture = () => {}
   Element.prototype.releasePointerCapture = () => {}
   Element.prototype.scrollIntoView = () => {}
})

describe("bare select repro", () => {
   it("opens on click", async () => {
      const user = userEvent.setup()
      render(
         <Select>
            <SelectTrigger>
               <SelectValue placeholder="Pick one" />
            </SelectTrigger>
            <SelectContent>
               <SelectItem value="a">Alpha</SelectItem>
               <SelectItem value="b">Beta</SelectItem>
            </SelectContent>
         </Select>
      )

      await user.click(screen.getByRole("combobox"))

      await waitFor(() => {
         expect(screen.getByText("Alpha")).toBeInTheDocument()
      })
   })
})
