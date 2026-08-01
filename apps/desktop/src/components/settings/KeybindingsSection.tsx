import { Button } from "@sqlose/ui"
import { IconRotate } from "@tabler/icons-react"
import { formatShortcut, isMac, type Keybinding } from "~/lib/types"

const actionLabels: Record<string, string> = {
   "query.execute": "Execute Query",
   "palette.open": "Open Command Palette",
   "tab.new": "New Tab",
   "tab.close": "Close Tab",
   "tab.next": "Next Tab",
   "tab.prev": "Previous Tab",
   "shortcuts.show": "Show Keyboard Shortcuts",
}

interface KeybindingsSectionProps {
   keybindings: Keybinding[]
   onReset: () => void
}

export function KeybindingsSection({ keybindings, onReset }: KeybindingsSectionProps) {
   const platformKeybindings = keybindings.filter(kb => (isMac() ? kb.meta : kb.ctrl))
   const agnostic = keybindings.filter(kb => !kb.meta && !kb.ctrl)
   platformKeybindings.push(...agnostic)

   const seen = new Set<string>()
   const deduped = platformKeybindings.filter(kb => {
      if (seen.has(kb.action)) {
         return false
      }
      seen.add(kb.action)
      return true
   })

   return (
      <section>
         <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold tracking-wider uppercase text-text-muted/80">
               Keybindings
            </h3>
            <Button
               variant="ghost"
               size="sm"
               onClick={onReset}
               className="h-6 text-xs gap-1 flex"
            >
               <IconRotate className="h-3 w-3" />
               Reset
            </Button>
         </div>
         <div className="space-y-0.5">
            {deduped.map((kb, index) => (
               <div
                  key={index}
                  className="flex items-center justify-between py-1.5 px-2.5 rounded-lg hover:bg-bg-quaternary/50 transition-colors"
               >
                  <span className="text-[13px] text-text-primary">
                     {actionLabels[kb.action] || kb.action}
                  </span>
                  <kbd className="text-[11px] font-mono text-text-muted bg-bg-tertiary border border-border rounded-md px-1.5 py-0.5">
                     {formatShortcut(kb.meta || kb.ctrl, kb.shift, kb.alt, kb.key)}
                  </kbd>
               </div>
            ))}
         </div>
      </section>
   )
}
