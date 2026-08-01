import type { PaletteAction } from "./paletteActions"

export type GroupedItems = {
   actions: PaletteAction[]
   databases: PaletteAction[]
   tabs: PaletteAction[]
   saved: PaletteAction[]
   history: PaletteAction[]
}

function score(item: PaletteAction, q: string): number {
   const label = item.label.toLowerCase()
   const desc = item.description.toLowerCase()
   if (label === q) {
      return 100
   }
   if (label.startsWith(q)) {
      return 90
   }
   if (label.includes(q)) {
      return 70
   }
   if (desc.includes(q)) {
      return 40
   }

   const words = q.split(/\s+/)
   const allWordsMatch = words.every(w => label.includes(w) || desc.includes(w))
   if (allWordsMatch && words.length > 1) {
      return 50
   }
   if (words.some(w => label.includes(w))) {
      return 30
   }

   return 0
}

function byCategory(items: PaletteAction[], category: PaletteAction["category"]): PaletteAction[] {
   return items.filter(a => a.category === category)
}

export function groupPaletteItems(actions: PaletteAction[], query: string): GroupedItems {
   if (!query) {
      return {
         actions: byCategory(actions, "action"),
         databases: byCategory(actions, "database"),
         tabs: byCategory(actions, "tab"),
         saved: byCategory(actions, "saved"),
         history: byCategory(actions, "history"),
      }
   }

   const q = query.toLowerCase()
   const scored = actions
      .map(a => ({ ...a, score: score(a, q) }))
      .filter(a => a.score > 0)
   scored.sort((a, b) => b.score - a.score)

   return {
      actions: byCategory(scored, "action"),
      databases: byCategory(scored, "database"),
      tabs: byCategory(scored, "tab"),
      saved: byCategory(scored, "saved"),
      history: byCategory(scored, "history"),
   }
}

export function flattenGrouped(items: GroupedItems): PaletteAction[] {
   return [
      ...items.actions,
      ...items.databases,
      ...items.tabs,
      ...items.saved,
      ...items.history,
   ]
}
