import { forwardRef } from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { cn } from "./cn"
import { IconCheck, IconChevronDown } from "@tabler/icons-react"

export const Select = SelectPrimitive.Root
export const SelectGroup = SelectPrimitive.Group
export const SelectValue = SelectPrimitive.Value

export const SelectTrigger = forwardRef<
   React.ComponentRef<typeof SelectPrimitive.Trigger>,
   React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
   <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
         "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-border bg-bg-tertiary px-3 py-2 text-sm text-text-primary shadow-sm",
         "placeholder:text-text-muted",
         "focus:outline-none focus:ring-1 focus:ring-accent",
         "disabled:cursor-not-allowed disabled:opacity-50",
         "[&>span]:truncate",
         className
      )}
      {...props}
   >
      {children}
      <SelectPrimitive.Icon asChild>
         <IconChevronDown className="h-4 w-4 text-text-muted" />
      </SelectPrimitive.Icon>
   </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = "SelectTrigger"

export const SelectContent = forwardRef<
   React.ComponentRef<typeof SelectPrimitive.Content>,
   React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
   <SelectPrimitive.Portal>
      <SelectPrimitive.Content
         ref={ref}
         className={cn(
            "relative z-50 max-h-96 min-w-32 overflow-hidden rounded-md border border-border bg-bg-secondary shadow-md",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            position === "popper" &&
               "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
            className
         )}
         position={position}
         {...props}
      >
         <SelectPrimitive.Viewport
            className={cn(
               "p-1",
               position === "popper" &&
                  "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
            )}
         >
            {children}
         </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
   </SelectPrimitive.Portal>
))
SelectContent.displayName = "SelectContent"

export const SelectItem = forwardRef<
   React.ComponentRef<typeof SelectPrimitive.Item>,
   React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
   <SelectPrimitive.Item
      ref={ref}
      className={cn(
         "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm text-text-secondary",
         "outline-none focus:bg-bg-quaternary focus:text-text-primary",
         "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
         className
      )}
      {...props}
   >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
         <SelectPrimitive.ItemIndicator>
            <IconCheck className="h-4 w-4 text-accent" />
         </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
   </SelectPrimitive.Item>
))
SelectItem.displayName = "SelectItem"

export const SelectSeparator = forwardRef<
   React.ComponentRef<typeof SelectPrimitive.Separator>,
   React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
   <SelectPrimitive.Separator
      ref={ref}
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
   />
))
SelectSeparator.displayName = "SelectSeparator"
