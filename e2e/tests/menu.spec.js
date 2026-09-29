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
    await page.getByLabel("Día").selectOption("martes");

    // Cuando selecciona alimentos del catálogo y los asigna a las secciones
    await page.getByLabel("Alimento").selectOption({ label: "Manzana" });
    await page.getByRole("button", { name: "Añadir a Desayuno" }).click();
    await page.getByLabel("Alimento").selectOption({ label: "Pechuga de pollo" });
    await page.getByRole("button", { name: "Añadir a Comida" }).click();
    await page.getByLabel("Alimento").selectOption({ label: "Salmón" });
    await page.getByRole("button", { name: "Añadir a Cena" }).click();

    // Entonces la app añade los alimentos a la estructura de ese día
    await expect(page.getByRole("region", { name: "Desayuno" })).toContainText("Manzana");
    await expect(page.getByRole("region", { name: "Comida" })).toContainText("Pechuga de pollo");
    await expect(page.getByRole("region", { name: "Cena" })).toContainText("Salmón");
    await expect(page.getByText("Total del día:")).toContainText("425 kcal");

    // Y otro día sigue vacío
    await page.getByLabel("Día").selectOption("miercoles");
    await expect(page.getByRole("region", { name: "Desayuno" }).getByRole("listitem")).toHaveCount(0);
    await page.getByLabel("Día").selectOption("martes");

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
    await page.getByLabel("Día").selectOption("martes");
    await expect(page.getByRole("region", { name: "Cena" })).toContainText("Salmón");
  });

  test("los alimentos bloqueados por el perfil no se pueden añadir al menú", async ({
    page,
    request,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Menú" }).click();

    // En el selector aparecen deshabilitados
    await expect(
      page.getByLabel("Alimento").getByRole("option", { name: /Pan de trigo.*bloqueado/ }),
    ).toHaveAttribute("disabled", "");

    // Y el backend rechaza guardarlos aunque se salte la interfaz
    const breadId = (await (await request.get(`${apiUrl}/api/foods?search=pan`)).json())[0].id;
    const response = await request.put(`${apiUrl}/api/menus/${userId}`, {
      data: { days: { lunes: { desayuno: [breadId] } } },
    });
    expect(response.status()).toBe(422);
    expect(await response.json()).toMatchObject({ error: true, code: 422 });
  });
});
