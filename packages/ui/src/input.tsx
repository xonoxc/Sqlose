import { forwardRef, type InputHTMLAttributes } from "react"
import { cn } from "./cn"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
   hasError?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
   ({ className, hasError, type, ...props }, ref) => {
      return (
         <input
            type={type}
            className={cn(
               "flex h-9 w-full rounded-md border bg-bg-tertiary px-3 py-1 text-sm text-text-primary shadow-sm transition-colors",
               "placeholder:text-text-muted",
               "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent",
               "disabled:cursor-not-allowed disabled:opacity-50",
               hasError ? "border-error ring-1 ring-error/30" : "border-border",
               className
            )}
            ref={ref}
            {...props}
         />
      )
   }
)
Input.displayName = "Input"
