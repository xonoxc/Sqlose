import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, cn } from "@sqlose/ui"
import { IconSun, IconMoon, IconDeviceDesktop } from "@tabler/icons-react"
import { themes } from "~/themes"
import type { AppearanceMode } from "~/stores/settingsStore"
import { SectionHeader, SettingRow } from "~/components/settings/primitives"

const appearanceOptions: { value: AppearanceMode; icon: typeof IconSun; label: string }[] = [
   { value: "light", icon: IconSun, label: "Light" },
   { value: "dark", icon: IconMoon, label: "Dark" },
   { value: "system", icon: IconDeviceDesktop, label: "System" },
]

interface AppearanceSectionProps {
   appearanceMode: AppearanceMode
   setAppearanceMode: (mode: AppearanceMode) => void
   themeId: string
   setTheme: (id: string) => void
}

export function AppearanceSection({
   appearanceMode,
   setAppearanceMode,
   themeId,
   setTheme,
}: AppearanceSectionProps) {
   return (
      <section>
         <SectionHeader
            title="Appearance"
            description="Select how Sqlose looks on your device."
         />
         <div className="flex gap-1.5 mb-5">
            {appearanceOptions.map(opt => {
               const Icon = opt.icon
               const isActive = appearanceMode === opt.value
               return (
                  <Button
                     key={opt.value}
                     onClick={() => setAppearanceMode(opt.value)}
                     className={cn(
                        "flex flex-1 items-center justify-center gap-2 rounded-md px-2 py-3 text-[13px] font-medium transition-all border",
                        isActive
                           ? "bg-accent/15 text-accent border-accent/40 shadow-sm text-foreground"
                           : "bg-bg-tertiary text-text-secondary border-border/50 hover:bg-bg-quaternary hover:text-text-primary"
                     )}
                  >
                     <Icon
                        className={cn(
                           "h-4 w-4",
                           isActive && "text-accent text-foreground"
                        )}
                     />
                     {opt.label}
                  </Button>
               )
            })}
         </div>
         <SettingRow
            title="Theme"
            description="Color theme for the current appearance"
         >
            <Select value={themeId} onValueChange={setTheme}>
               <SelectTrigger className="w-1/4 px-3 border-border/50 bg-bg-tertiary rounded-lg">
                  <div className="flex items-center gap-2">
                     <div
                        className="h-3.5 w-3.5 rounded-full border border-border/60 shrink-0"
                        style={{
                           background:
                              themes.find(t => t.id === themeId)?.colors.accent ?? "#6b8bab",
                        }}
                     />
                     <SelectValue />
                  </div>
               </SelectTrigger>
               <SelectContent className="bg-bg-primary border border-border/50 rounded-lg shadow-lg">
                  {themes.map(t => (
                     <SelectItem key={t.id} value={t.id}>
                        <div className="flex items-center gap-2">
                           <span
                              className="h-3 w-3 rounded-full border border-border/60 block shrink-0"
                              style={{ background: t.colors.accent }}
                           />
                           <span>{t.name}</span>
                        </div>
                     </SelectItem>
                  ))}
               </SelectContent>
            </Select>
         </SettingRow>
      </section>
   )
}
