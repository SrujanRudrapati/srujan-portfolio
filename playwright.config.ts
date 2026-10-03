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
    toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: "disabled" },
  },
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Uses the locally installed Google Chrome instead of a downloaded browser.
    channel: "chrome",
    // Diagrams render in their finished state, so screenshots are stable.
    reducedMotion: "reduce",
    trace: "on-first-retry",
  },
  projects: [
    { name: "desktop-dark", use: { ...devices["Desktop Chrome"], channel: "chrome", viewport: { width: 1440, height: 900 }, colorScheme: "dark" } },
    { name: "desktop-light", use: { ...devices["Desktop Chrome"], channel: "chrome", viewport: { width: 1440, height: 900 }, colorScheme: "light" } },
    { name: "mobile-dark", use: { ...devices["Pixel 7"], channel: "chrome", viewport: { width: 390, height: 844 }, colorScheme: "dark" } },
  ],
  // Tests run against the real static export, exactly what gets deployed.
  webServer: {
    command: `npm run build && npx serve out -l ${PORT} --no-clipboard`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
