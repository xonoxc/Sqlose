import { defineConfig } from "@playwright/test"

export default defineConfig({
   testDir: "./apps/desktop/e2e",
   fullyParallel: true,
   forbidOnly: !!process.env.CI,
   retries: process.env.CI ? 2 : 0,
   workers: process.env.CI ? 1 : undefined,
   reporter: [["html", { outputFolder: "playwright-report" }]],
   use: {
      baseURL: "http://localhost:5173",
      trace: "on-first-retry",
   },
   projects: [
      {
         name: "electron",
         use: {
            browserName: "chromium",
            launchOptions: {
               executablePath: undefined,
            },
         },
      },
   ],
})
