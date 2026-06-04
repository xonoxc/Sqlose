import {
   useQuery,
   useMutation,
   useQueryClient,
   type UseQueryOptions,
   type UseMutationOptions,
} from "@tanstack/react-query"
import { api } from "~/lib/api"
import { queryKeys } from "~/lib/query/keys"
import { unwrapAsyncResult } from "~/lib/query/adapters"
import type {
   DBType,
   Environment,
   QueryResult,
   Dataset,
   ImportPayload,
   ImportResult,
} from "@sqlose/shared"

export function useEnvironments(
   options?: Omit<
      UseQueryOptions<
         Environment[],
         Error,
         Environment[],
         ReturnType<typeof queryKeys.environments.list>
      >,
      "queryKey" | "queryFn"
   >
) {
   return useQuery({
      queryKey: queryKeys.environments.list(),
      queryFn: () => unwrapAsyncResult(api.env.list()),
      ...options,
   })
}

export function useEnvironmentDetail(
   environmentId: string | null | undefined,
   options?: Omit<
      UseQueryOptions<
         Environment,
         Error,
         Environment,
         ReturnType<typeof queryKeys.environments.detail>
      >,
      "queryKey" | "queryFn"
   >
) {
   return useQuery({
      queryKey: queryKeys.environments.detail(environmentId ?? ""),
      queryFn: () => unwrapAsyncResult(api.env.get(environmentId!)),
      enabled: !!environmentId,
      ...options,
   })
}

export function useEnvironmentHealth(
   environmentId: string | null | undefined,
   options?: Omit<
      UseQueryOptions<
         { healthy: boolean; uptime: number },
         Error,
         { healthy: boolean; uptime: number },
         ReturnType<typeof queryKeys.environments.health>
      >,
      "queryKey" | "queryFn"
   > & { refetchInterval?: number }
) {
   return useQuery({
      queryKey: queryKeys.environments.health(environmentId ?? ""),
      queryFn: () => unwrapAsyncResult(api.docker.health(environmentId!)),
      enabled: !!environmentId,
      refetchInterval: options?.refetchInterval ?? 5000,
      ...options,
   })
}

export function useDatasets(
   options?: Omit<
      UseQueryOptions<Dataset[], Error, Dataset[], ReturnType<typeof queryKeys.datasets.list>>,
      "queryKey" | "queryFn"
   >
) {
   return useQuery({
      queryKey: queryKeys.datasets.list(),
      queryFn: () => unwrapAsyncResult(api.dataset.list()),
      ...options,
   })
}

export function useCreateEnvironment(
   options?: UseMutationOptions<Environment, Error, { dbType: DBType; name?: string }>
) {
   const queryClient = useQueryClient()

   return useMutation({
      mutationFn: ({ dbType, name }: { dbType: DBType; name?: string }) =>
         unwrapAsyncResult(api.env.create(dbType, name)),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: queryKeys.environments.all })
      },
      ...options,
   })
}

export function useDestroyEnvironment(options?: UseMutationOptions<string, Error, string>) {
   const queryClient = useQueryClient()

   return useMutation({
      mutationFn: (environmentId: string) =>
         unwrapAsyncResult(api.env.destroy(environmentId)).then(() => environmentId),
      onSuccess: (_, environmentId) => {
         queryClient.invalidateQueries({ queryKey: queryKeys.environments.all })
         queryClient.removeQueries({ queryKey: queryKeys.environments.detail(environmentId) })
         queryClient.removeQueries({ queryKey: queryKeys.environments.health(environmentId) })
      },
      ...options,
   })
}

export function useStartEnvironment(
   options?: UseMutationOptions<{ port: number; connectionString: string }, Error, string>
) {
   const queryClient = useQueryClient()

   return useMutation({
      mutationFn: (environmentId: string) => unwrapAsyncResult(api.docker.startEnv(environmentId)),
      onSuccess: (_, environmentId) => {
         queryClient.invalidateQueries({ queryKey: queryKeys.environments.all })
         queryClient.invalidateQueries({ queryKey: queryKeys.environments.detail(environmentId) })
      },
      ...options,
   })
}

export function useStopEnvironment(options?: UseMutationOptions<string, Error, string>) {
   const queryClient = useQueryClient()

   return useMutation({
      mutationFn: (environmentId: string) =>
         unwrapAsyncResult(api.docker.stopEnv(environmentId)).then(() => environmentId),
      onSuccess: (_, environmentId) => {
         queryClient.invalidateQueries({ queryKey: queryKeys.environments.all })
         queryClient.invalidateQueries({ queryKey: queryKeys.environments.detail(environmentId) })
      },
      ...options,
   })
}

export function useRestartEnvironment(options?: UseMutationOptions<string, Error, string>) {
   const queryClient = useQueryClient()

   return useMutation({
      mutationFn: (environmentId: string) =>
         unwrapAsyncResult(api.docker.restartEnv(environmentId)).then(() => environmentId),
      onSuccess: (_, environmentId) => {
         queryClient.invalidateQueries({ queryKey: queryKeys.environments.all })
         queryClient.invalidateQueries({ queryKey: queryKeys.environments.detail(environmentId) })
      },
      ...options,
   })
}

export function useExecuteQuery(
   options?: UseMutationOptions<QueryResult, Error, { environmentId: string; sql: string }>
) {
   const queryClient = useQueryClient()

   return useMutation({
      mutationFn: ({ environmentId, sql }: { environmentId: string; sql: string }) =>
         unwrapAsyncResult(api.query.execute(environmentId, sql)),
      onSuccess: (data, variables) => {
         const simpleHash = simpleHashFn(variables.sql)
         queryClient.setQueryData(queryKeys.query.result(variables.environmentId, simpleHash), data)
      },
      ...options,
   })
}

export function useImportCSV(
   options?: UseMutationOptions<ImportResult, Error, Omit<ImportPayload, "format">>
) {
   const queryClient = useQueryClient()

   return useMutation({
      mutationFn: (payload: Omit<ImportPayload, "format">) =>
         unwrapAsyncResult(api.import.csv(payload)),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: queryKeys.environments.all })
      },
      ...options,
   })
}

export function useImportSQL(
   options?: UseMutationOptions<{ tablesCreated: string[] }, Error, Omit<ImportPayload, "format">>
) {
   const queryClient = useQueryClient()

   return useMutation({
      mutationFn: (payload: Omit<ImportPayload, "format">) =>
         unwrapAsyncResult(api.import.sql(payload)),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: queryKeys.environments.all })
      },
      ...options,
   })
}

export function useImportDataset(
   options?: UseMutationOptions<
      { tablesCreated: string[] },
      Error,
      { datasetId: string; environmentId: string }
   >
) {
   const queryClient = useQueryClient()

   return useMutation({
      mutationFn: ({ datasetId, environmentId }: { datasetId: string; environmentId: string }) =>
         unwrapAsyncResult(api.dataset.import(datasetId, environmentId)),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: queryKeys.environments.all })
      },
      ...options,
   })
}

export function usePreviewCSV(
   options?: UseMutationOptions<
      { columns: string[]; preview: Record<string, string>[] },
      Error,
      string
   >
) {
   return useMutation({
      mutationFn: (content: string) => unwrapAsyncResult(api.import.previewCSV(content)),
      ...options,
   })
}

function simpleHashFn(str: string): string {
   let hash = 0
   for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
   }
   return Math.abs(hash).toString(36)
}
