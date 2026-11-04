// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

/**
 * Arab Aura - Production Playwright Multi-Matrix Configuration
 * Matrices:
 * - Viewports: Desktop (1920x1080), Tablet (768x1024, 820x1180), Mobile (375x667, 390x844, 412x915)
 * - Locales: ar-EG (RTL) vs en-US (LTR)
 * - Color Schemes: Light vs Dark mode
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["list"],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    // ==========================================
    // 🖥️ Desktop Matrix
    // ==========================================
    {
      name: "Desktop-Chrome-RTL-Dark",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1920, height: 1080 },
        locale: "ar-EG",
        colorScheme: "dark",
      },
    },
    {
      name: "Desktop-Chrome-LTR-Light",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
        locale: "en-US",
        colorScheme: "light",
      },
    },

    // ==========================================
    // 📱 Tablet Matrix
    // ==========================================
    {
      name: "Tablet-iPad-RTL-Light",
      use: {
        ...devices["iPad Mini"],
        viewport: { width: 768, height: 1024 },
        locale: "ar-EG",
        colorScheme: "light",
      },
    },
    {
      name: "Tablet-Air-LTR-Dark",
      use: {
        ...devices["iPad Pro 11"],
        viewport: { width: 820, height: 1180 },
        locale: "en-US",
        colorScheme: "dark",
      },
    },

    // ==========================================
    // 📲 Mobile Matrix
    // ==========================================
    {
      name: "Mobile-iPhone14-RTL-Dark",
      use: {
        ...devices["iPhone 14"],
        viewport: { width: 390, height: 844 },
        locale: "ar-EG",
        colorScheme: "dark",
      },
    },
    {
      name: "Mobile-Pixel7-RTL-Light",
      use: {
        ...devices["Pixel 7"],
        viewport: { width: 412, height: 915 },
        locale: "ar-EG",
        colorScheme: "light",
      },
    },
    {
      name: "Mobile-Compact-LTR-Light",
      use: {
        ...devices["iPhone SE"],
        viewport: { width: 375, height: 667 },
        locale: "en-US",
        colorScheme: "light",
      },
    },
  ],

  webServer: {
    command: "cd arab-aura-frontend && npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 120000,
  },
});
