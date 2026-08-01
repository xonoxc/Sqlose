import { useEffect, useState } from "react"
import { Input, Select, SelectContent, SelectItem, SelectTrigger } from "@sqlose/ui"
import { useSystemFonts } from "~/hooks/useSystemFonts"
import { SectionHeader, SettingRow, Stepper, Toggle } from "~/components/settings/primitives"

function fontStack(family: string): string {
   return `'${family.replace(/'/g, "")}', ui-monospace, monospace`
}

interface EditorSectionProps {
   isOpen: boolean
   editorFontSize: number
   handleFontSizeChange: (delta: number) => void
   editorFontFamily: string
   handleFontFamilyChange: (family: string) => void
   vimModeEnabled: boolean
   handleToggleVim: () => void
}

export function EditorSection({
   isOpen,
   editorFontSize,
   handleFontSizeChange,
   editorFontFamily,
   handleFontFamilyChange,
   vimModeEnabled,
   handleToggleVim,
}: EditorSectionProps) {
   const { fonts, loading, available, refresh } = useSystemFonts()
   const [fontInput, setFontInput] = useState(editorFontFamily)

   useEffect(() => {
      if (isOpen) refresh()
   }, [isOpen, refresh])

   const fontOptions = Array.from(new Set(["Geist Mono", ...fonts, editorFontFamily]))

   const commitCustomFont = () => {
      const trimmed = fontInput.trim()
      if (trimmed && trimmed !== editorFontFamily) {
         handleFontFamilyChange(trimmed)
      } else {
         setFontInput(editorFontFamily)
      }
   }

   return (
      <section>
         <SectionHeader title="Editor" />
         <div className="space-y-4">
            <SettingRow
               title="Editor Font"
               description="Font family used in the SQL editor."
            >
               <Select value={editorFontFamily} onValueChange={handleFontFamilyChange}>
                  <SelectTrigger className="px-3 border-border/50 bg-bg-tertiary rounded-lg">
                     <div className="flex items-center gap-2">
                        <span
                           className="max-w-[140px] truncate text-[13px]"
                           style={{ fontFamily: fontStack(editorFontFamily) }}
                        >
                           {editorFontFamily}
                        </span>
                     </div>
                  </SelectTrigger>
                  <SelectContent className="bg-bg-primary border border-border/50 rounded-lg shadow-lg">
                     {loading ? (
                        <div className="px-2 py-1.5 text-sm text-text-muted">
                           Loading fonts...
                        </div>
                     ) : (
                        fontOptions.map(font => (
                           <SelectItem key={font} value={font}>
                              <span
                                 className="inline-block max-w-[200px] truncate"
                                 style={{ fontFamily: fontStack(font) }}
                              >
                                 {font}
                              </span>
                           </SelectItem>
                        ))
                     )}
                  </SelectContent>
               </Select>
            </SettingRow>
            {!available && (
               <p className="text-[11px] text-text-muted -mt-1">
                  Local font detection is unavailable — showing common monospace
                  fonts.
               </p>
            )}
            <SettingRow
               title="Custom Font"
               description="Type any installed font family name."
            >
               <Input
                  value={fontInput}
                  onChange={e => setFontInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && commitCustomFont()}
                  onBlur={commitCustomFont}
                  placeholder="e.g. JetBrains Mono"
                  className="w-[200px] h-8"
               />
            </SettingRow>
            <SettingRow
               title="Editor Font Size"
               description="Adjust the font size for query editors."
            >
               <Stepper
                  value={`${editorFontSize}px`}
                  valueClassName="text-[13px]"
                  onDecrease={() => handleFontSizeChange(-1)}
                  onIncrease={() => handleFontSizeChange(1)}
                  decreaseLabel="Decrease font size"
                  increaseLabel="Increase font size"
               />
            </SettingRow>
            <SettingRow
               title="Vim Mode"
               description="Enable Vim keybindings in the SQL editor"
            >
               <Toggle
                  checked={vimModeEnabled}
                  onChange={handleToggleVim}
                  label="Toggle Vim mode"
               />
            </SettingRow>
         </div>
      </section>
   )
}
