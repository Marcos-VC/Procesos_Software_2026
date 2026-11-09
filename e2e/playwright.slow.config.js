import { defineConfig } from "@playwright/test";
import base from "./playwright.config.js";

// npm run test:slow: pausa entre acciones para seguir los tests a simple vista.
// Va en un config aparte (y no con SLOWMO=700 en el script) porque esa sintaxis no funciona en Windows.
export default defineConfig({
  ...base,
  projects: base.projects.map((project) => ({
    ...project,
    use: { ...project.use, launchOptions: { slowMo: 700 } },
  })),
});
