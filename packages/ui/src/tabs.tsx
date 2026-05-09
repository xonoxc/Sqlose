import { forwardRef } from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "./cn"

export const Tabs = TabsPrimitive.Root

export const TabsList = forwardRef<
   React.ComponentRef<typeof TabsPrimitive.List>,
   React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
   <TabsPrimitive.List
      ref={ref}
      className={cn(
         "inline-flex h-9 items-center justify-center rounded-lg bg-bg-quaternary p-1 text-text-muted",
         className
      )}
      {...props}
   />
))
TabsList.displayName = "TabsList"

export const TabsTrigger = forwardRef<
   React.ComponentRef<typeof TabsPrimitive.Trigger>,
   React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
   <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
         "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium",
         "transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent",
         "disabled:pointer-events-none disabled:opacity-50",
         "data-[state=active]:bg-bg-secondary data-[state=active]:text-text-primary data-[state=active]:shadow-sm",
         className
      )}
      {...props}
   />
))
TabsTrigger.displayName = "TabsTrigger"

export const TabsContent = forwardRef<
   React.ComponentRef<typeof TabsPrimitive.Content>,
   React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
   <TabsPrimitive.Content
      ref={ref}
      className={cn(
         "mt-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent",
         className
      )}
      {...props}
   />
))
TabsContent.displayName = "TabsContent"
