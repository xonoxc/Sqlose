import { IconArrowLeftRight, IconCornerDownLeft, IconSettings } from "@tabler/icons-react"

export function PaletteFooter() {
   return (
      <div className="px-5 py-3 flex items-center gap-6 border-t border-border/40 bg-bg-secondary/20 font-medium whitespace-nowrap overflow-hidden">
         <div className="flex items-center gap-5 text-[10.5px] text-text-muted/60">
            <div className="flex items-center gap-2">
               <div className="flex items-center justify-center h-4.5 w-4.5 rounded-sm bg-bg-tertiary border border-border p-0.5 opacity-70">
                  <IconArrowLeftRight className="h-full w-full rotate-90" />
               </div>
               <span>Select</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="flex items-center justify-center h-4.5 w-4.5 rounded-sm bg-bg-tertiary border border-border p-0.5 opacity-70">
                  <IconCornerDownLeft className="h-full w-full" />
               </div>
               <span>Open</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="flex items-center justify-center h-4.5 w-4.5 rounded-sm bg-bg-tertiary border border-border p-0.5 text-[8.5px] font-mono leading-none opacity-70 uppercase">
                  ESC
               </div>
               <span>Close</span>
            </div>
         </div>
         <div className="ml-auto shrink-0">
            <button className="h-7.5 w-7.5 rounded-md hover:bg-bg-quaternary flex items-center justify-center text-text-muted/40 hover:text-text-primary transition-all">
               <IconSettings className="h-4 w-4" />
            </button>
         </div>
      </div>
   )
}
