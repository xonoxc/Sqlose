import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./select"

describe("Select", () => {
   it("renders trigger with placeholder", () => {
      render(
         <Select>
            <SelectTrigger>
               <SelectValue placeholder="Choose an option" />
            </SelectTrigger>
            <SelectContent>
               <SelectItem value="1">Option 1</SelectItem>
               <SelectItem value="2">Option 2</SelectItem>
            </SelectContent>
         </Select>
      )

      expect(screen.getByText("Choose an option")).toBeInTheDocument()
   })

   it("renders trigger with correct role", () => {
      render(
         <Select>
            <SelectTrigger>
               <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
               <SelectItem value="1">Option 1</SelectItem>
               <SelectItem value="2">Option 2</SelectItem>
            </SelectContent>
         </Select>
      )

      expect(screen.getByRole("combobox")).toBeInTheDocument()
   })
})
