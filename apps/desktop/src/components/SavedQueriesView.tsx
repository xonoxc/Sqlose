import { IconBookmark, IconStar, IconTrash, IconFileCode } from "@tabler/icons-react"
import { useSavedQueriesStore } from "~/stores/savedQueriesStore"
import { useEnvironmentStore } from "~/stores/environmentStore"
import { useWorkspaceStore } from "~/stores/workspaceStore"
import { toast } from "sonner"
import { useState } from "react"

export function SavedQueriesView() {
   const selectedEnvironmentId = useEnvironmentStore(s => s.selectedEnvironmentId)
   const allQueries = useSavedQueriesStore(s => s.queries)
   const deleteQuery = useSavedQueriesStore(s => s.deleteQuery)
   const queries = selectedEnvironmentId
      ? allQueries.filter(q => q.environmentId === selectedEnvironmentId)
      : allQueries
   const [deletingId, setDeletingId] = useState<string | null>(null)

   const handleOpen = (entry: { sql: string; id?: string; name?: string; result?: import("@sqlose/shared").QueryResult | null }) => {
      const result = useWorkspaceStore.getState().openTab()
      if (result.isOk()) {
         const tab = result.value
         useWorkspaceStore.getState().updateTab(tab.id, {
            query: entry.sql,
            ...(entry.name ? { title: entry.name } : {}),
            ...(entry.id ? { savedQueryId: entry.id } : {}),
            ...(entry.result ? { result: entry.result } : {}),
         })
         useWorkspaceStore.getState().setActiveTab(tab.id)
      }
   }

   const handleDelete = async (id: string) => {
      setDeletingId(id)
      const result = await deleteQuery(id)
      if (result.isOk()) {
         toast.success("Query deleted")
      } else {
         toast.error("Failed to delete query")
      }
      setDeletingId(null)
   }

   return (
      <div className="h-full flex flex-col bg-bg-primary overflow-hidden">
         <div className="flex items-center gap-3 px-6 py-4 border-b border-border/40 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
               <IconBookmark size={20} stroke={1.5} />
            </div>
            <div>
               <h1 className="text-[15px] font-semibold text-text-primary">Saved Queries</h1>
               <p className="text-[12px] text-text-muted">
                  {queries.length} {queries.length === 1 ? "query" : "queries"} saved
               </p>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto custom-scrollbar">
            {queries.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full text-center px-8">
                  <IconBookmark className="h-12 w-12 text-text-muted/20 mb-4" />
                  <p className="text-[14px] font-medium text-text-muted">No saved queries</p>
                  <p className="text-[12px] text-text-muted/60 mt-1 max-w-xs">
                     Save your current query with Ctrl+S or the save button in the editor toolbar.
                  </p>
               </div>
            ) : (
               <div className="p-4 space-y-1">
                  {queries.map(q => (
                      <div
                         key={q.id}
                         className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-bg-tertiary/50 transition-colors cursor-pointer"
                         onClick={() => handleOpen({ sql: q.sql, id: q.id, name: q.name, result: q.result })}
                      >
                         <IconStar className="h-4 w-4 text-warning shrink-0" />
                         <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-medium text-text-primary truncate">
                               {q.name}
                            </div>
                            <div className="text-[11px] font-mono text-text-muted/60 truncate mt-0.5">
                               {q.sql}
                            </div>
                         </div>
                         <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                               onClick={e => {
                                  e.stopPropagation()
                                  handleOpen({ sql: q.sql, id: q.id, name: q.name, result: q.result })
                               }}
                               className="h-7 w-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-quaternary transition-colors"
                               title="Open in new tab"
                            >
                               <IconFileCode size={15} stroke={1.5} />
                            </button>
                           <button
                              onClick={e => {
                                 e.stopPropagation()
                                 handleDelete(q.id)
                              }}
                              disabled={deletingId === q.id}
                              className="h-7 w-7 flex items-center justify-center rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors disabled:opacity-40"
                              title="Delete query"
                           >
                              {deletingId === q.id ? (
                                 <div className="h-3.5 w-3.5 rounded-full border-2 border-error border-t-transparent animate-spin" />
                              ) : (
                                 <IconTrash size={15} stroke={1.5} />
                              )}
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>
   )
}
