import { forwardRef, type HTMLAttributes, type TdHTMLAttributes, type ThHTMLAttributes } from "react"
import { cn } from "./cn"

export const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(
   ({ className, ...props }, ref) => (
      <div className="relative w-full overflow-auto">
         <table ref={ref} className={cn("w-full table-fixed caption-bottom text-sm", className)} {...props} />
      </div>
   )
)
Table.displayName = "Table"

export const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
   ({ className, ...props }, ref) => (
      <thead ref={ref} className={cn("sticky top-0 z-20", className)} {...props} />
   )
)
TableHeader.displayName = "TableHeader"

export const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
   ({ className, ...props }, ref) => (
      <tbody ref={ref} className={cn("", className)} {...props} />
   )
)
TableBody.displayName = "TableBody"

export const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
   ({ className, ...props }, ref) => (
      <tr
         ref={ref}
         className={cn(
            "border-b border-border/10 transition-colors hover:bg-white/[0.015]",
            className
         )}
         {...props}
      />
   )
)
TableRow.displayName = "TableRow"

export const TableHead = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(
   ({ className, ...props }, ref) => (
      <th
         ref={ref}
         className={cn(
            "h-8 px-2.5 text-[11px] font-medium tracking-wide text-text-secondary whitespace-nowrap bg-bg-secondary select-none border-b border-border/70",
            className
         )}
         {...props}
      />
   )
)
TableHead.displayName = "TableHead"

export const TableCell = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
   ({ className, ...props }, ref) => (
      <td
         ref={ref}
         className={cn(
            "px-2.5 py-0.5 text-[12px] text-text-primary whitespace-nowrap overflow-hidden text-ellipsis border-b border-border/5",
            className
         )}
         {...props}
      />
   )
)
TableCell.displayName = "TableCell"

export const TableCaption = forwardRef<HTMLTableCaptionElement, HTMLAttributes<HTMLTableCaptionElement>>(
   ({ className, ...props }, ref) => (
      <caption ref={ref} className={cn("mt-4 text-sm text-text-muted", className)} {...props} />
   )
)
TableCaption.displayName = "TableCaption"
