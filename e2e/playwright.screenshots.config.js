import { defineConfig } from "@playwright/test";
import base from "./playwright.config.js";

// Solo ejecuta el script de capturas (se excluye de la batería normal).
export default defineConfig({
  ...base,
  testIgnore: [],
  testMatch: "screenshots.spec.ts",
});
