import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "./tooltip"

describe("Tooltip", () => {
   it("shows content on hover", async () => {
      const user = userEvent.setup()
      render(
         <TooltipProvider>
            <Tooltip>
               <TooltipTrigger>Hover me</TooltipTrigger>
               <TooltipContent>Tooltip text</TooltipContent>
            </Tooltip>
         </TooltipProvider>
      )

      const trigger = screen.getByText("Hover me")
      await user.hover(trigger)

      const tooltip = await screen.findByRole("tooltip")
      expect(tooltip).toBeInTheDocument()
   })
})
