import { IconDatabase } from "@tabler/icons-react"

export function Branding() {
   return (
      <div className="flex flex-col items-center mb-16">
         <div className="h-16 w-16 rounded-[1.5rem] bg-bg-tertiary border border-border/80 shadow-[0_0_60px_rgba(var(--color-accent),0.2)] flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 bg-accent/5 rounded-[1.5rem]" />
            <IconDatabase className="h-8 w-8 text-text-primary relative z-10" />
         </div>
         <h1 className="text-2xl font-bold tracking-tight text-white uppercase tracking-[0.25em] mb-2 leading-none text-center">
            SQLOSE
         </h1>
         <p className="text-[13px] text-text-muted font-medium opacity-70 text-center">
            Select a database instance to begin
         </p>
      </div>
   )
}
