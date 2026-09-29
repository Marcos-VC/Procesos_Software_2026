import { expect, test } from "@playwright/test";

// HU 1.1 - Buscar alimentos y ver macros (Catálogo)
test.describe("HU 1.1 Buscar alimentos y ver macros", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Pan de trigo" })).toBeVisible();
  });

  test("AC1: al buscar un término se muestra la lista filtrada de coincidencias", async ({
    page,
  }) => {
    // Dado que el usuario escribe un término en el buscador
    await page.getByRole("textbox", { name: "Buscar alimento" }).fill("arroz");
    // Cuando pulsa "Buscar"
    await page.getByRole("button", { name: "Buscar" }).click();

    // Entonces el sistema muestra una lista filtrada de coincidencias (con sus macros)
    const arroz = page.locator("article", {
      has: page.getByRole("heading", { name: "Arroz integral" }),
    });
    await expect(arroz).toBeVisible();
    await expect(arroz).toContainText("111 kcal");
    await expect(arroz).toContainText("Proteína");
    await expect(arroz).toContainText("Carbohidratos");
    await expect(arroz).toContainText("Grasas");
    await expect(page.getByRole("heading", { name: "Pan de trigo" })).toHaveCount(0);
    await expect(page.locator("article")).toHaveCount(1);
  });

  test('AC2: sin coincidencias se muestra "No se encontraron alimentos"', async ({
    page,
  }) => {
    // Dado que no existen coincidencias
    await page.getByRole("textbox", { name: "Buscar alimento" }).fill("zzzxxx");
    // Cuando se realiza la búsqueda
    await page.getByRole("button", { name: "Buscar" }).click();

    // Entonces se muestra el mensaje
    await expect(page.getByText("No se encontraron alimentos")).toBeVisible();
    await expect(page.locator("article")).toHaveCount(0);
  });
});
