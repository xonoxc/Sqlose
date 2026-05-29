import { describe, it, expect } from "vitest"
import { ImportError } from "@sqlose/shared"
import { listDatasets, getDatasetSQL, SAMPLE_DATASETS } from "./index"

describe("Sample Datasets", () => {
   describe("listDatasets", () => {
      it("should return all sample datasets", async () => {
         const result = await listDatasets()

         expect(result.isOk()).toBe(true)
         if (result.isOk()) {
            expect(result.value).toHaveLength(6)
            const categories = result.value.map(d => d.category)
            expect(categories).toContain("ecommerce")
            expect(categories).toContain("analytics")
            expect(categories).toContain("social")
            expect(categories).toContain("finance")
            expect(categories).toContain("retail")
            expect(categories).toContain("healthcare")
         }
      })

      it("should have all required fields for each dataset", async () => {
         const result = await listDatasets()
         if (result.isOk()) {
            for (const ds of result.value) {
               expect(ds.id).toBeTruthy()
               expect(ds.name).toBeTruthy()
               expect(ds.description).toBeTruthy()
               expect(ds.category).toBeTruthy()
               expect(ds.dbTypes).toContain("sqlite")
            }
         }
      })
   })

   describe("getDatasetSQL", () => {
      it("should return SQL for valid dataset ids", async () => {
         for (const id of Object.keys(SAMPLE_DATASETS)) {
            const result = await getDatasetSQL(id)
            expect(result.isOk()).toBe(true)
            if (result.isOk()) {
               expect(result.value).toContain("CREATE TABLE")
               expect(result.value).toContain("INSERT INTO")
            }
         }
      })

      it("should return ImportError for unknown dataset", async () => {
         const result = await getDatasetSQL("nonexistent")

         expect(result.isErr()).toBe(true)
         if (result.isErr()) {
            expect(result.error).toBeInstanceOf(ImportError)
            expect(result.error.code).toBe("import:parse_failed")
         }
      })

      it("should have six sample datasets defined", () => {
         expect(Object.keys(SAMPLE_DATASETS)).toHaveLength(6)
         expect(SAMPLE_DATASETS["ds-ecommerce"]).toBeTruthy()
         expect(SAMPLE_DATASETS["ds-analytics"]).toBeTruthy()
         expect(SAMPLE_DATASETS["ds-social"]).toBeTruthy()
         expect(SAMPLE_DATASETS["ds-finance"]).toBeTruthy()
         expect(SAMPLE_DATASETS["ds-retail"]).toBeTruthy()
         expect(SAMPLE_DATASETS["ds-healthcare"]).toBeTruthy()
      })
   })

   describe("dataset SQL content", () => {
      it("ecommerce should have all 6 tables", async () => {
         const result = await getDatasetSQL("ds-ecommerce")
         expect(result.isOk()).toBe(true)
         if (result.isOk()) {
            expect(result.value).toContain("CREATE TABLE customers")
            expect(result.value).toContain("CREATE TABLE products")
            expect(result.value).toContain("CREATE TABLE orders")
            expect(result.value).toContain("CREATE TABLE order_items")
            expect(result.value).toContain("CREATE TABLE payments")
            expect(result.value).toContain("CREATE TABLE reviews")
         }
      })

      it("retail should have all 5 tables", async () => {
         const result = await getDatasetSQL("ds-retail")
         expect(result.isOk()).toBe(true)
         if (result.isOk()) {
            expect(result.value).toContain("CREATE TABLE stores")
            expect(result.value).toContain("CREATE TABLE suppliers")
            expect(result.value).toContain("CREATE TABLE retail_products")
            expect(result.value).toContain("CREATE TABLE inventory")
            expect(result.value).toContain("CREATE TABLE sales")
         }
      })

      it("healthcare should have all 6 tables", async () => {
         const result = await getDatasetSQL("ds-healthcare")
         expect(result.isOk()).toBe(true)
         if (result.isOk()) {
            expect(result.value).toContain("CREATE TABLE patients")
            expect(result.value).toContain("CREATE TABLE departments")
            expect(result.value).toContain("CREATE TABLE doctors")
            expect(result.value).toContain("CREATE TABLE appointments")
            expect(result.value).toContain("CREATE TABLE diagnoses")
            expect(result.value).toContain("CREATE TABLE prescriptions")
         }
      })

      it("analytics should have all 5 tables", async () => {
         const result = await getDatasetSQL("ds-analytics")
         expect(result.isOk()).toBe(true)
         if (result.isOk()) {
            expect(result.value).toContain("CREATE TABLE users")
            expect(result.value).toContain("CREATE TABLE sessions")
            expect(result.value).toContain("CREATE TABLE page_views")
            expect(result.value).toContain("CREATE TABLE events")
            expect(result.value).toContain("CREATE TABLE conversions")
         }
      })
   })
})
