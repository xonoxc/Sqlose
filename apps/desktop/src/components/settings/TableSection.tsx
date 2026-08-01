import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@sqlose/ui"
import type { RowSpacing } from "~/stores/settingsStore"
import { SectionHeader, SettingRow, Stepper, Toggle } from "~/components/settings/primitives"

interface TableSectionProps {
   rowSpacing: RowSpacing
   setRowSpacing: (spacing: RowSpacing) => void
   tableFontSize: number
   handleTableFontSizeChange: (delta: number) => void
   alternatingRowColors: boolean
   setAlternatingRowColors: (enabled: boolean) => void
   tableColumnPreview: boolean
   setTableColumnPreview: (enabled: boolean) => void
}

export function TableSection({
   rowSpacing,
   setRowSpacing,
   tableFontSize,
   handleTableFontSizeChange,
   alternatingRowColors,
   setAlternatingRowColors,
   tableColumnPreview,
   setTableColumnPreview,
}: TableSectionProps) {
   return (
      <section>
         <SectionHeader title="Table" />
         <div className="space-y-4">
            <SettingRow
               title="Row Spacing"
               description="Adjust the vertical spacing between rows in data tables."
            >
               <Select
                  value={rowSpacing}
                  onValueChange={v => setRowSpacing(v as RowSpacing)}
               >
                  <SelectTrigger className="w-[150px] px-3 border-border/50 bg-bg-tertiary rounded-lg">
                     <div className="flex items-center gap-2">
                        <SelectValue />
                     </div>
                  </SelectTrigger>
                  <SelectContent className="bg-bg-primary border border-border/50 rounded-lg shadow-lg">
                     <SelectItem value="comfortable">Comfortable</SelectItem>
                     <SelectItem value="compact">Compact</SelectItem>
                  </SelectContent>
               </Select>
            </SettingRow>
            <SettingRow title="Table Font Size" description="Font size for data grid cells.">
               <Stepper
                  value={`${tableFontSize}px`}
                  valueClassName="text-xs"
                  onDecrease={() => handleTableFontSizeChange(-1)}
                  onIncrease={() => handleTableFontSizeChange(1)}
                  decreaseLabel="Decrease table font size"
                  increaseLabel="Increase table font size"
               />
            </SettingRow>
            <SettingRow
               title="Alternating Row Colors"
               description="Apply alternating background colors to rows in data tables for easier reading."
            >
               <Toggle
                  checked={alternatingRowColors}
                  onChange={() => setAlternatingRowColors(!alternatingRowColors)}
                  label="Toggle alternating row colors"
               />
            </SettingRow>
            <SettingRow
               title="Table Column Preview"
               description="Show expandable column details in the sidebar table list."
            >
               <Toggle
                  checked={tableColumnPreview}
                  onChange={() => setTableColumnPreview(!tableColumnPreview)}
                  label="Toggle table column preview"
               />
            </SettingRow>
         </div>
      </section>
   )
}
