import { defineConfig, devices } from "@playwright/test";

const PORT = 4321;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : [["list"], ["html", { open: "never" }]],
  expect: {
    // Small tolerance for font anti-aliasing differences between runs.
    toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: "disabled", stylePath: "./e2e/screenshot.css" },
  },
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Diagrams render in their finished state, so screenshots are stable.
    reducedMotion: "reduce",
    trace: "on-first-retry",
  },
  projects: [
    // The Chrome projects use the locally installed Google Chrome (channel "chrome") instead of a downloaded browser.
    { name: "desktop-dark", use: { ...devices["Desktop Chrome"], channel: "chrome", viewport: { width: 1440, height: 900 }, colorScheme: "dark" } },
    { name: "desktop-light", use: { ...devices["Desktop Chrome"], channel: "chrome", viewport: { width: 1440, height: 900 }, colorScheme: "light" } },
    { name: "mobile-dark", use: { ...devices["Pixel 7"], channel: "chrome", viewport: { width: 390, height: 844 }, colorScheme: "dark" } },
    // Runbook V7: Safari and Firefox. Opt in with CROSS_BROWSER=1 (npm run test:e2e:cross); pixel baselines
    // are Chrome's, so these engines skip the visual snapshots and run everything else.
    ...(process.env.CROSS_BROWSER
      ? [
          { name: "webkit-desktop", grepInvert: /visual/, use: { ...devices["Desktop Safari"], viewport: { width: 1440, height: 900 }, colorScheme: "light" as const } },
          { name: "firefox-desktop", grepInvert: /visual/, use: { ...devices["Desktop Firefox"], viewport: { width: 1440, height: 900 }, colorScheme: "light" as const } },
          { name: "webkit-mobile", grepInvert: /visual/, use: { ...devices["iPhone 14"], colorScheme: "dark" as const } },
        ]
      : []),
  ],
  // Tests run against the real static export, exactly what gets deployed.
  webServer: {
    command: `npm run build && npx serve out -l ${PORT} --no-clipboard`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
