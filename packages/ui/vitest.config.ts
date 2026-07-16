import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"

export default defineConfig({
   plugins: [react()],
   test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
       exclude: ["**/node_modules/**", "**/dist/**"],
      css: true,
      coverage: {
         provider: "v8",
         reporter: ["text", "lcov"],
         thresholds: {
            statements: 90,
            branches: 85,
            functions: 90,
            lines: 90,
         },
      },
   },
})
