import { IconSearch } from "@tabler/icons-react"
import type { PaletteAction } from "./paletteActions"
import type { GroupedItems } from "./paletteFilter"
import { PaletteResultItem } from "./PaletteResultItem"

interface CommandResultsProps {
   groupedItems: GroupedItems
   flatFiltered: PaletteAction[]
   selectedIndex: number
   query: string
   onSelectIndex: (index: number) => void
   onClose: () => void
}

export function CommandResults({
   groupedItems,
   flatFiltered,
   selectedIndex,
   query,
   onSelectIndex,
   onClose,
}: CommandResultsProps) {
   const limitedItems = flatFiltered.slice(0, 7)

   return (
      <div className="flex flex-col">
         {limitedItems.length === 0 && (
            <div className="py-16 text-center flex flex-col items-center">
               <IconSearch className="h-10 w-10 text-text-muted/10 mb-3" />
               <p className="text-text-muted text-[14.5px] px-8 font-medium">
                  No results for &ldquo;{query}&rdquo;
               </p>
            </div>
         )}

         {Object.entries(groupedItems).map(([category, items]) => {
            if (items.length === 0) {
               return null
            }
            const visibleInGroup = items.filter(item => limitedItems.some(li => li.id === item.id))
            if (visibleInGroup.length === 0) {
               return null
            }

            return (
               <div key={category} className="flex flex-col">
                  <div className="px-5 py-2 text-[10.5px] font-bold uppercase tracking-widest text-text-muted/70">
                     {category}
                  </div>
                  {visibleInGroup.map(item => {
                     const indexInFlat = flatFiltered.findIndex(fi => fi.id === item.id)
                     const isActive = indexInFlat === selectedIndex
                     return (
                        <PaletteResultItem
                           key={item.id}
                           item={item}
                           isActive={isActive}
                           onSelect={() => {
                              item.onSelect()
                              if (item.id !== "switch-theme" && item.id !== "switch-db") {
                                 onClose()
                              }
                           }}
                           onHover={() => onSelectIndex(indexInFlat)}
                        />
                     )
                  })}
               </div>
            )
         })}
      </div>
   )
}
