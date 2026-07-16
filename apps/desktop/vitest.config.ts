import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "node:path"

export default defineConfig({
   plugins: [react()],
   test: {
      globals: true,
      environment: "jsdom",
      include: ["electron/**/*.test.ts", "src/**/*.test.{ts,tsx}"],
      exclude: ["e2e/**"],
      setupFiles: ["./src/test/setup.ts"],
      css: true,
      coverage: {
         provider: "v8",
         reporter: ["text", "json", "html"],
         thresholds: {
            branches: 85,
            functions: 85,
            lines: 85,
            statements: 85,
         },
      },
   },
   resolve: {
      alias: {
         "~": path.resolve(__dirname, "src"),
         "@sqlose/shared": path.resolve(__dirname, "../../packages/shared/src"),
         "@sqlose/ui": path.resolve(__dirname, "../../packages/ui/src"),
         "@sqlose/core": path.resolve(__dirname, "../../packages/core/src"),
      },
   },
})
