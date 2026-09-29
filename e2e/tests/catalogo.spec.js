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

// HU 1.2 - Ver iconos de alérgenos
test.describe("HU 1.2 Ver iconos de alérgenos", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Pan de trigo" })).toBeVisible();
  });

  test("AC1: un alimento con alérgenos muestra sus iconos de forma visible", async ({
    page,
  }) => {
    // Dado que el usuario está viendo la lista del catálogo
    const pan = page.locator("article", {
      has: page.getByRole("heading", { name: "Pan de trigo" }),
    });

    // Cuando el alimento contiene alérgenos comunes
    // Entonces se muestran sus iconos descriptivos
    const icon = pan.getByRole("button", { name: "Alérgeno: Gluten" });
    await expect(icon).toBeVisible();
    await expect(icon).toHaveText("🌾");

    // Y un alimento sin alérgenos no muestra iconos
    const arroz = page.locator("article", {
      has: page.getByRole("heading", { name: "Arroz integral" }),
    });
    await expect(arroz.getByRole("button", { name: /Alérgeno/ })).toHaveCount(0);
  });

  test("AC2: al pulsar el icono se despliega el texto con el nombre de la alergia", async ({
    page,
  }) => {
    const pan = page.locator("article", {
      has: page.getByRole("heading", { name: "Pan de trigo" }),
    });
    await expect(pan.getByRole("tooltip")).toHaveCount(0);

    // Dado que el usuario pulsa sobre el icono de un alérgeno
    await pan.getByRole("button", { name: "Alérgeno: Gluten" }).click();

    // Entonces la app despliega un texto explicativo con el nombre de la alergia
    const tooltip = pan.getByRole("tooltip");
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText("Gluten");
    await expect(tooltip).toContainText("intolerancia");

    // Y al volver a pulsar se oculta
    await pan.getByRole("button", { name: "Alérgeno: Gluten" }).click();
    await expect(tooltip).toHaveCount(0);
  });
});
