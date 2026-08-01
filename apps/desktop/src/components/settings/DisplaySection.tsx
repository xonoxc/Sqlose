import { Button, cn } from "@sqlose/ui"
import { SectionHeader, SettingRow } from "~/components/settings/primitives"

const uiScaleOptions = [0.9, 1, 1.1, 1.2]

interface DisplaySectionProps {
   uiScale: number
   handleUiScaleChange: (scale: number) => void
}

export function DisplaySection({ uiScale, handleUiScaleChange }: DisplaySectionProps) {
   return (
      <section>
         <SectionHeader title="Display" />
         <SettingRow title="UI Scale" description="Adjust the overall interface size.">
            <div className="flex items-center gap-2 bg-bg-tertiary border border-border rounded-lg px-2 py-1">
               {uiScaleOptions.map(s => (
                  <Button
                     key={s}
                     onClick={() => handleUiScaleChange(s)}
                     className={cn(
                        "px-2 py-0.5 rounded text-xs font-medium transition-all bg-transparent px-3",
                        uiScale === s
                           ? "bg-accent text-foreground"
                           : "text-text-muted hover:text-text-primary"
                     )}
                  >
                     {Math.round(s * 100)}%
                  </Button>
               ))}
            </div>
         </SettingRow>
      </section>
   )
}
