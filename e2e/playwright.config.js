import { defineConfig, devices } from "@playwright/test";

const apiPort = 3100;
const webPort = 5174;

export default defineConfig({
  testDir: "./tests",
  // Las capturas del README se generan aparte: npm run screenshots.
  testIgnore: "**/screenshots.spec.ts",
  // Los tests comparten el estado del backend (mocks JSON): se ejecutan en serie.
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${webPort}`,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // npm run test:slow: pausa (ms) entre acciones para ver el test
        launchOptions: { slowMo: Number(process.env.SLOWMO ?? 0) },
      },
    },
  ],
  webServer: [
    {
      command: "node start-backend.mjs",
      url: `http://localhost:${apiPort}/api/health`,
      env: { E2E_API_PORT: String(apiPort) },
      reuseExistingServer: false,
    },
    {
      command: `npm run dev -- --port ${webPort} --strictPort`,
      cwd: "../frontend",
      url: `http://localhost:${webPort}`,
      env: { VITE_API_URL: `http://localhost:${apiPort}` },
      reuseExistingServer: false,
    },
  ],
});
