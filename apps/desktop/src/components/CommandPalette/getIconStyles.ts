export function getIconStyles(id: string): string {
   if (id === "new-query") {
      return "bg-indigo-500/10 text-indigo-400"
   }
   if (id === "run-query") {
      return "bg-emerald-500/10 text-emerald-400"
   }
   if (id === "save-query") {
      return "bg-blue-500/10 text-blue-400"
   }
   if (id === "clear-results") {
      return "bg-red-500/10 text-red-400"
   }
   if (id === "open-saved") {
      return "bg-purple-500/10 text-purple-400"
   }
   if (id === "open-history") {
      return "bg-purple-500/10 text-purple-400"
   }
   if (id === "view-diagram") {
      return "bg-blue-500/10 text-blue-400"
   }
   if (id === "switch-db") {
      return "bg-teal-500/10 text-teal-400"
   }
   if (id === "toggle-vim") {
      return "bg-violet-500/10 text-violet-400"
   }
   if (id === "switch-theme") {
      return "bg-pink-500/10 text-pink-400"
   }
   if (id === "nuke-env") {
      return "bg-orange-500/10 text-orange-400"
   }
   if (id === "rename-query") {
      return "bg-amber-500/10 text-amber-400"
   }
   if (id.startsWith("env-")) {
      return "bg-zinc-500/10 text-zinc-400"
   }
   if (id.startsWith("tab-")) {
      return "bg-indigo-500/10 text-indigo-400"
   }
   if (id.startsWith("sq-")) {
      return "bg-amber-500/10 text-amber-400"
   }
   if (id.startsWith("hist-")) {
      return "bg-zinc-500/10 text-zinc-400"
   }
   return "bg-bg-secondary text-text-muted"
}
