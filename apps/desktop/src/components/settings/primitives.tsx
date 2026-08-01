import type { ReactNode } from "react"
import { cn } from "@sqlose/ui"
import {
   IconToggleLeft,
   IconToggleRight,
   IconMinus,
   IconPlus,
} from "@tabler/icons-react"

interface SectionHeaderProps {
   title: string
   description?: string
}

export function SectionHeader({ title, description }: SectionHeaderProps) {
   return (
      <>
         <h3 className="text-xs font-semibold tracking-wider uppercase text-text-muted/80 mb-4">
            {title}
         </h3>
         {description && (
            <p className="text-[13px] text-text-muted mb-3">{description}</p>
         )}
      </>
   )
}

interface SettingRowProps {
   title: string
   description: string
   children: ReactNode
}

export function SettingRow({ title, description, children }: SettingRowProps) {
   return (
      <div className="flex items-center justify-between">
         <div>
            <p className="text-sm text-text-primary">{title}</p>
            <p className="text-xs text-text-muted mt-0.5">{description}</p>
         </div>
         {children}
      </div>
   )
}

interface ToggleProps {
   checked: boolean
   onChange: () => void
   label: string
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
   return (
      <button
         onClick={onChange}
         className="transition-all duration-200"
         aria-label={label}
      >
         {checked ? (
            <IconToggleRight className="h-5 w-5 text-accent brightness-150" />
         ) : (
            <IconToggleLeft className="h-5 w-5 text-text-muted" />
         )}
      </button>
   )
}

interface StepperProps {
   value: string
   onDecrease: () => void
   onIncrease: () => void
   decreaseLabel: string
   increaseLabel: string
   valueClassName?: string
}

export function Stepper({
   value,
   onDecrease,
   onIncrease,
   decreaseLabel,
   increaseLabel,
   valueClassName,
}: StepperProps) {
   return (
      <div className="flex items-center gap-2 bg-bg-tertiary border border-border rounded-lg px-2 py-1">
         <button
            onClick={onDecrease}
            className="h-6 w-6 rounded flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-quaternary transition-colors"
            aria-label={decreaseLabel}
         >
            <IconMinus className="h-3.5 w-3.5" />
         </button>
         <span
            className={cn(
               "font-mono text-text-primary min-w-[36px] text-center tabular-nums",
               valueClassName
            )}
         >
            {value}
         </span>
         <button
            onClick={onIncrease}
            className="h-6 w-6 rounded flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-quaternary transition-colors"
            aria-label={increaseLabel}
         >
            <IconPlus className="h-3.5 w-3.5" />
         </button>
      </div>
   )
}
