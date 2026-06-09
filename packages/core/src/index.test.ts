import { describe, it, expect } from "vitest"
import {
   createEnvironment,
   healthCheck,
   cleanupOrphans,
   createEnvironmentRecord,
   getEnvironment,
   listEnvironments,
   updateEnvironment,
   destroyEnvironmentRecord,
   duplicateEnvironmentRecord,
   resetEnvironmentRecord,
   executeQuery,
   parseCSV,
   inferSchema,
   generateCreateTableSQL,
   generateInsertSQL,
   importCSV,
   previewCSV,
   parseSQLDump,
   extractTableNames,
   executeQueryForDB,
   listDatasets,
   getDatasetSQL,
   SAMPLE_DATASETS,
} from "./index"

describe("core package exports", () => {
   it("should export Docker orchestration functions", () => {
      expect(createEnvironment).toBeDefined()
      expect(healthCheck).toBeDefined()
      expect(cleanupOrphans).toBeDefined()
   })

   it("should export environment lifecycle functions", () => {
      expect(createEnvironmentRecord).toBeDefined()
      expect(getEnvironment).toBeDefined()
      expect(listEnvironments).toBeDefined()
      expect(updateEnvironment).toBeDefined()
      expect(destroyEnvironmentRecord).toBeDefined()
      expect(duplicateEnvironmentRecord).toBeDefined()
      expect(resetEnvironmentRecord).toBeDefined()
   })

   it("should export query execution functions", () => {
      expect(executeQuery).toBeDefined()
      expect(executeQueryForDB).toBeDefined()
   })

   it("should export import functions", () => {
      expect(parseCSV).toBeDefined()
      expect(inferSchema).toBeDefined()
      expect(generateCreateTableSQL).toBeDefined()
      expect(generateInsertSQL).toBeDefined()
      expect(importCSV).toBeDefined()
      expect(previewCSV).toBeDefined()
      expect(parseSQLDump).toBeDefined()
      expect(extractTableNames).toBeDefined()
   })

   it("should export dataset functions", () => {
      expect(listDatasets).toBeDefined()
      expect(getDatasetSQL).toBeDefined()
      expect(SAMPLE_DATASETS).toBeDefined()
      expect(Object.keys(SAMPLE_DATASETS)).toHaveLength(10)
   })
})
