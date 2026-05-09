import { QueryClient } from "@tanstack/react-query"

function isQueryEnabled(): boolean {
   return typeof window !== "undefined" && typeof window.sqlose !== "undefined"
}

export const queryClient = new QueryClient({
   defaultOptions: {
      queries: {
         staleTime: 1000 * 60 * 5,
         retry: failureCount => {
            return failureCount < 2
         },
         enabled: isQueryEnabled(),
      },
      mutations: {
         retry: false,
      },
   },
})

export { isQueryEnabled }
