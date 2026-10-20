import { expect, test } from "@playwright/test";

const apiUrl = "http://localhost:3100";
const userId = "5d37a69d-97c8-4280-afb7-2dc90467d688";

// HU 3.1 - Crear menú básico
test.describe("HU 3.1 Crear menú básico", () => {
  test("AC1: asignar alimentos del catálogo a Desayuno, Comida y Cena los añade al día", async ({
    page,
    request,
  }) => {
    // Dado que el usuario se encuentra en el diseñador de menús
    await page.goto("/");
    await page.getByRole("button", { name: "Menú" }).click();
    await expect(page.getByRole("heading", { name: "Diseñador de menús" })).toBeVisible();
    await page.getByRole("button", { name: "Martes" }).click();

    // Cuando añade alimentos del catálogo a Desayuno, Comida y Cena
    for (const [meal, food] of [
      ["Desayuno", "Manzana"],
      ["Comida", "Pechuga de pollo"],
      ["Cena", "Salmón"],
    ]) {
      const region = page.getByRole("region", { name: meal });
      await region.getByRole("button", { name: "Añadir alimento" }).click();
      await region.getByRole("button", { name: food }).click();
    }

    // Entonces la app añade los alimentos a la estructura de ese día
    await expect(page.getByRole("region", { name: "Desayuno" })).toContainText("Manzana");
    await expect(page.getByRole("region", { name: "Comida" })).toContainText("Pechuga de pollo");
    await expect(page.getByRole("region", { name: "Cena" })).toContainText("Salmón");

    // Y el día muestra sus calorías (52 + 165 + 208)
    await expect(page.getByRole("button", { name: "Martes" })).toContainText("425 kcal");

    // Y otro día sigue vacío
    await page.getByRole("button", { name: "Miércoles" }).click();
    await expect(page.getByRole("region", { name: "Desayuno" }).getByRole("listitem")).toHaveCount(0);
    await page.getByRole("button", { name: "Martes" }).click();

    // Y la estructura se guarda en el sistema
    await page.getByRole("button", { name: "Guardar menú" }).click();
    await expect(page.getByRole("status")).toHaveText("Menú guardado correctamente");

    const menu = await (await request.get(`${apiUrl}/api/menus/${userId}`)).json();
    expect(menu.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(menu.days.martes.desayuno).toHaveLength(1);
    expect(menu.days.martes.comida).toHaveLength(1);
    expect(menu.days.martes.cena).toHaveLength(1);

    // Y persiste tras recargar
    await page.reload();
    await page.getByRole("button", { name: "Menú" }).click();
    await page.getByRole("button", { name: "Martes" }).click();
    await expect(page.getByRole("region", { name: "Cena" })).toContainText("Salmón");
  });
});

// HU 3.3 - Guardar menú favorito
test.describe("HU 3.3 Guardar menú favorito", () => {
  test("AC1: guardar un menú con nombre y cargarlo después recupera ese menú", async ({
    page,
    request,
  }) => {
    // Dado que el usuario tiene alimentos añadidos al Desayuno del Lunes
    await page.goto("/");
    await page.getByRole("button", { name: "Menú" }).click();
    await expect(page.getByRole("heading", { name: "Diseñador de menús" })).toBeVisible();
    const desayuno = page.getByRole("region", { name: "Desayuno" });
    await desayuno.getByRole("button", { name: "Añadir alimento" }).click();
    await desayuno.getByRole("button", { name: "Manzana" }).click();

    // Cuando pulsa "Guardar como favorito", escribe un nombre y confirma en el modal
    await page.getByRole("button", { name: "Guardar como favorito" }).click();
    const dialog = page.getByRole("dialog", { name: "Guardar menú como favorito" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("textbox", { name: "Nombre del menú favorito" }).fill("Semana ligera");
    await dialog.getByRole("button", { name: "Guardar" }).click();

    // Entonces se guarda bajo ese nombre en el backend
    await expect(page.getByRole("status")).toHaveText('Menú guardado como favorito "Semana ligera"');
    const favorites = await (await request.get(`${apiUrl}/api/menus/favorites?userId=${userId}`)).json();
    expect(favorites).toHaveLength(1);
    expect(favorites[0].name).toBe("Semana ligera");
    expect(favorites[0].days.lunes.desayuno).toHaveLength(1);

    // Y cuando vacía el Desayuno y carga el favorito desde el selector, recupera el alimento guardado
    await desayuno.getByRole("button", { name: "Quitar Manzana de Desayuno" }).click();
    await expect(desayuno.getByRole("listitem")).toHaveCount(0);
    await page.getByRole("combobox", { name: "Cargar menú favorito" }).selectOption({ label: "Semana ligera" });
    await expect(desayuno).toContainText("Manzana");
  });
});
