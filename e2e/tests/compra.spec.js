import { expect, test } from "@playwright/test";

const apiUrl = "http://localhost:3100";
const userId = "5d37a69d-97c8-4280-afb7-2dc90467d688";

// HU 5.1 - Generar compra automáticamente
test.describe("HU 5.1 Generar compra automáticamente", () => {
  test("AC1: la lista de la compra muestra los alimentos del menú semanal agrupados por nombre", async ({
    page,
    request,
  }) => {
    // Dado un menú semanal con alimentos concretos
    await request.put(`${apiUrl}/api/menus/${userId}`, {
      data: {
        days: {
          lunes: {
            desayuno: ["9017b44e-1d3f-4414-95d9-bac5d28790fc"], // Arroz integral
            comida: ["05756545-04f4-4f3f-8254-6e5d678edc93"],   // Pechuga de pollo
            cena: [],
          },
          martes: {
            desayuno: ["9017b44e-1d3f-4414-95d9-bac5d28790fc"], // Arroz integral (2ª vez)
            comida: [],
            cena: [],
          },
        },
      },
    });

    // Cuando el usuario navega a la pestaña Compra
    await page.goto("/");
    await page.getByRole("button", { name: "Compra" }).click();
    await expect(page.getByRole("heading", { name: "Lista de la compra" })).toBeVisible();

    // Entonces se muestra la lista con los alimentos del menú
    const lista = page.getByRole("list", { name: "Lista de la compra" });
    await expect(lista).toBeVisible();

    // Arroz integral aparece 2 veces (lunes desayuno + martes desayuno)
    const arrozItem = lista.getByRole("listitem").filter({ hasText: "Arroz integral" });
    await expect(arrozItem).toBeVisible();
    await expect(arrozItem).toContainText("2 veces");

    // Pechuga de pollo aparece 1 vez
    const pechugarItem = lista.getByRole("listitem").filter({ hasText: "Pechuga de pollo" });
    await expect(pechugarItem).toBeVisible();
    await expect(pechugarItem).toContainText("1 vez");
  });

  test("AC2: con el menú vacío se muestra el mensaje de lista vacía", async ({
    page,
    request,
  }) => {
    // Dado un menú sin alimentos
    await request.put(`${apiUrl}/api/menus/${userId}`, { data: { days: {} } });

    // Cuando el usuario navega a la pestaña Compra
    await page.goto("/");
    await page.getByRole("button", { name: "Compra" }).click();
    await expect(page.getByRole("heading", { name: "Lista de la compra" })).toBeVisible();

    // Entonces se muestra el mensaje de despensa vacía y no hay items en la lista
    await expect(page.getByRole("list", { name: "Lista de la compra" })).toHaveCount(0);
    await expect(page.getByText("No hay alimentos en el menú semanal")).toBeVisible();
  });

  test("AC3: GET /api/menus/:userId/shopping-list devuelve la lista correcta con el conteo", async ({
    request,
  }) => {
    // Dado un menú con Manzana en 3 comidas distintas y Salmón en 1
    const manzanaId = "d9ac1aab-7651-4acf-9d8f-9287036e5f43";
    const salmonId = "1688136e-53eb-4edd-9753-4774dc6560db";

    await request.put(`${apiUrl}/api/menus/${userId}`, {
      data: {
        days: {
          lunes: { desayuno: [manzanaId], comida: [manzanaId], cena: [salmonId] },
          martes: { desayuno: [manzanaId], comida: [], cena: [] },
        },
      },
    });

    const response = await request.get(`${apiUrl}/api/menus/${userId}/shopping-list`);
    expect(response.ok()).toBe(true);

    const list = await response.json();
    // La lista está ordenada por nombre
    const manzana = list.find((item) => item.foodId === manzanaId);
    const salmon = list.find((item) => item.foodId === salmonId);

    expect(manzana).toBeDefined();
    expect(manzana.name).toBe("Manzana");
    expect(manzana.count).toBe(3);

    expect(salmon).toBeDefined();
    expect(salmon.name).toBe("Salmón");
    expect(salmon.count).toBe(1);
  });
});
