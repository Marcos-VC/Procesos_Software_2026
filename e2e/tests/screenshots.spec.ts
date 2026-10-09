import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

// Genera las capturas del README en docs/assets/. No forma parte de `npm test`:
// ejecútalo con `npm run screenshots`. Usa el mismo backend temporal (:3100) y
// frontend (:5174) que la batería E2E, así que no modifica los mocks del repositorio.
const assetsDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../docs/assets",
);
const capture = (name: string) => path.join(assetsDirectory, `${name}.png`);

test.use({ viewport: { width: 1280, height: 900 } });

test("capturas de las pestañas Catálogo, Perfil y Menú", async ({ page }) => {
  await page.goto("/");

  // Catálogo: búsqueda con varios resultados, con sus macros e iconos de alérgenos.
  await expect(page.getByRole("heading", { name: "Pan de trigo" })).toBeVisible();
  await page.getByRole("textbox", { name: "Buscar alimento" }).fill("a");
  await page.getByRole("button", { name: "Buscar" }).click();
  await expect(page.getByRole("heading", { name: "Pan de trigo" })).toBeVisible();
  await page.screenshot({ path: capture("catalogo"), fullPage: true });

  // Perfil: objetivo calórico y alergias rellenados y guardados.
  await page.getByRole("button", { name: "Perfil" }).click();
  await expect(page.getByRole("heading", { name: "Perfil nutricional" })).toBeVisible();
  await page.getByLabel("Objetivo calórico diario (kcal)").fill("2100");
  await page.getByText(/Alergias e intolerancias/).click();
  await page.getByRole("checkbox", { name: /Huevo/ }).check();
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByText("Perfil guardado correctamente")).toBeVisible();
  await page.screenshot({ path: capture("perfil"), fullPage: true });

  // Menú: alimentos permitidos por el perfil en Desayuno, Comida y Cena.
  await page.getByRole("button", { name: "Menú" }).click();
  await expect(page.getByRole("heading", { name: "Diseñador de menús" })).toBeVisible();
  await page.getByLabel("Día").selectOption("lunes");
  for (const [food, meal] of [
    ["Manzana", "Desayuno"],
    ["Pechuga de pollo", "Comida"],
    ["Salmón", "Cena"],
  ]) {
    await page.getByLabel("Alimento").selectOption({ label: food });
    await page.getByRole("button", { name: `Añadir a ${meal}` }).click();
    await expect(page.getByRole("region", { name: meal })).toContainText(food);
  }
  await page.getByRole("button", { name: "Guardar menú" }).click();
  await expect(page.getByRole("status")).toBeVisible();
  await page.screenshot({ path: capture("menu"), fullPage: true });
});
