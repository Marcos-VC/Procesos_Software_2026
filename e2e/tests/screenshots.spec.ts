import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

// Genera las capturas de los documentos de sprint en docs/assets/sprint1 y sprint2. No forma parte de `npm test`:
// ejecútalo con `npm run screenshots`. Usa el mismo backend temporal (:3100) y
// frontend (:5174) que la batería E2E, así que no modifica los mocks del repositorio.
const assetsDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../docs/assets",
);
const capture = (name: string) => path.join(assetsDirectory, "sprint1", `${name}.png`);
const captureSprint2 = (name: string) => path.join(assetsDirectory, "sprint2", `${name}.png`);

test.use({ viewport: { width: 1280, height: 900 } });

test("capturas de las pestañas Catálogo, Perfil y Menú", async ({ page }) => {
  await page.goto("/");

  // Catálogo: búsqueda con varios resultados, con sus macros e iconos de alérgenos.
  await expect(page.getByRole("heading", { name: "Pan de trigo" })).toBeVisible();
  await page.getByRole("textbox", { name: "Buscar alimento" }).fill("a");
  await page.getByRole("button", { name: "Buscar" }).click();
  await expect(page.getByRole("heading", { name: "Pan de trigo" })).toBeVisible();
  await page.screenshot({ path: capture("catalogo"), fullPage: true });

  // Perfil: objetivo calórico rellenado y guardado.
  await page.getByRole("button", { name: "Perfil" }).click();
  await expect(page.getByRole("heading", { name: "Perfil nutricional" })).toBeVisible();
  await page.getByLabel("Objetivo calórico diario (kcal)").fill("2100");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByText("Perfil guardado correctamente")).toBeVisible();
  await page.screenshot({ path: capture("perfil"), fullPage: true });

  // Menú: varios alimentos en cada comida del lunes y otro día con contenido para que
  // la semana se vea de un vistazo; el selector de alimentos queda abierto en la cena.
  await page.getByRole("button", { name: "Menú" }).click();
  await expect(page.getByRole("heading", { name: "Diseñador de menús" })).toBeVisible();
  const addFood = async (meal: string, food: string) => {
    const region = page.getByRole("region", { name: meal });
    await region.getByRole("button", { name: "Añadir alimento" }).click();
    await region.getByRole("button", { name: food }).click();
    await expect(region).toContainText(food);
  };
  for (const [meal, food] of [
    ["Desayuno", "Copos de avena"],
    ["Desayuno", "Plátano"],
    ["Comida", "Pechuga de pollo"],
    ["Comida", "Arroz integral"],
    ["Cena", "Salmón"],
  ]) {
    await addFood(meal, food);
  }
  await page.getByRole("button", { name: "Miércoles" }).click();
  await addFood("Comida", "Lentejas cocidas");
  await page.getByRole("button", { name: "Lunes" }).click();
  await page.getByRole("button", { name: "Guardar menú" }).click();
  await expect(page.getByRole("status")).toBeVisible();
  await page
    .getByRole("region", { name: "Cena" })
    .getByRole("button", { name: "Añadir alimento" })
    .click();
  await page.screenshot({ path: capture("menu"), fullPage: true });
});

test("capturas del Sprint 2: alergias en el perfil y menús favoritos", async ({ page }) => {
  await page.goto("/");

  // HU 2.2: alergias marcadas en el perfil y guardadas.
  await page.getByRole("button", { name: "Perfil" }).click();
  await expect(page.getByRole("heading", { name: "Perfil nutricional" })).toBeVisible();
  await page.getByRole("checkbox", { name: /Frutos secos/ }).check();
  await page.getByRole("checkbox", { name: /Lactosa/ }).check();
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByText("Perfil guardado correctamente")).toBeVisible();
  await page.screenshot({ path: captureSprint2("perfil-alergias"), fullPage: true });

  // HU 3.3: menú guardado como favorito y disponible en el selector.
  await page.getByRole("button", { name: "Menú" }).click();
  await expect(page.getByRole("heading", { name: "Diseñador de menús" })).toBeVisible();
  for (const [meal, food] of [
    ["Desayuno", "Copos de avena"],
    ["Comida", "Pechuga de pollo"],
    ["Cena", "Salmón"],
  ]) {
    const region = page.getByRole("region", { name: meal });
    await region.getByRole("button", { name: "Añadir alimento" }).click();
    await region.getByRole("button", { name: food }).click();
    await expect(region).toContainText(food);
  }
  await page.getByRole("button", { name: "Guardar como favorito" }).click();
  const dialog = page.getByRole("dialog", { name: "Guardar menú como favorito" });
  await dialog.getByRole("textbox", { name: "Nombre del menú favorito" }).fill("Semana ligera");
  await dialog.getByRole("button", { name: "Guardar" }).click();
  await expect(page.getByRole("status")).toBeVisible();
  await page.screenshot({ path: captureSprint2("menu-favoritos"), fullPage: true });
});
