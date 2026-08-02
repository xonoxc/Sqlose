import { defineConfig } from "vitest/config"

export default defineConfig({
    test: {
       globals: true,
       exclude: ["**/node_modules/**", "**/dist/**"],
       coverage: {
         provider: "v8",
         reporter: ["text", "lcov"],
         thresholds: {
            statements: 85,
            branches: 70,
            functions: 90,
            lines: 85,
         },
      },
   },
})
