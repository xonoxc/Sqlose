import { defineConfig } from "vitest/config"

export default defineConfig({
    test: {
       globals: true,
       exclude: ["**/node_modules/**", "**/dist/**"],
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
