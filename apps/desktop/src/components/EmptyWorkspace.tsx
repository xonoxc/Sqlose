import { isMac } from "~/lib/types"

interface EmptyWorkspaceProps {
   onNewQuery: () => void
   onOpenPalette: () => void
}

export function EmptyWorkspace({ onNewQuery, onOpenPalette }: EmptyWorkspaceProps) {
   return (
      <div className="flex flex-col items-center justify-center h-full bg-bg-primary overflow-hidden">
         <div className="flex flex-col items-center max-w-sm text-center">
            <div className="w-16 h-16 rounded-2xl bg-bg-secondary border border-border flex items-center justify-center mb-6 opacity-80">
               <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-text-muted"
               >
                  <path d="m18 16 4-4-4-4" />
                  <path d="m6 8-4 4 4 4" />
                  <path d="m14.5 4-5 16" />
               </svg>
            </div>
            <h2 className="text-[16px] font-semibold text-text-primary mb-2 tracking-wide">
               Ready to write queries
            </h2>
            <p className="text-[14px] text-text-muted mb-8 leading-relaxed">
               Start interacting with your database by creating a new query tab or using the command system.
            </p>

            <div className="flex flex-col gap-2 w-full max-w-[280px]">
               <button
                  onClick={onNewQuery}
                  className="flex items-center justify-between w-full px-4 py-2.5 rounded-lg bg-bg-tertiary hover:bg-bg-quaternary border border-border/80 transition-colors group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
               >
                  <span className="text-[13px] font-medium text-text-secondary group-hover:text-text-primary">
                     New Query Workspace
                  </span>
                  <div className="flex items-center gap-1 opacity-60">
                     {isMac() ? (
                        <>
                           <kbd className="font-mono text-[11px] bg-bg-primary px-1.5 py-0.5 rounded shadow-sm border border-border/40">⌘</kbd>
                           <kbd className="font-mono text-[11px] bg-bg-primary px-1.5 py-0.5 rounded shadow-sm border border-border/40">N</kbd>
                        </>
                     ) : (
                        <kbd className="font-mono text-[11px] bg-bg-primary px-1.5 py-0.5 rounded shadow-sm border border-border/40">Ctrl+N</kbd>
                     )}
                  </div>
               </button>
               <button
                  onClick={onOpenPalette}
                  className="flex items-center justify-between w-full px-4 py-2.5 rounded-lg bg-bg-tertiary hover:bg-bg-quaternary border border-border/80 transition-colors group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
               >
                  <span className="text-[13px] font-medium text-text-secondary group-hover:text-text-primary">
                     Global Search
                  </span>
                  <div className="flex items-center gap-1 opacity-60">
                     {isMac() ? (
                        <>
                           <kbd className="font-mono text-[11px] bg-bg-primary px-1.5 py-0.5 rounded shadow-sm border border-border/40">⌘</kbd>
                           <kbd className="font-mono text-[11px] bg-bg-primary px-1.5 py-0.5 rounded shadow-sm border border-border/40">K</kbd>
                        </>
                     ) : (
                        <kbd className="font-mono text-[11px] bg-bg-primary px-1.5 py-0.5 rounded shadow-sm border border-border/40">Ctrl+K</kbd>
                     )}
                  </div>
               </button>
            </div>
         </div>
      </div>
   )
}
