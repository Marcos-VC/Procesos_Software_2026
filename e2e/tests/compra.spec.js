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

// HU 5.2 - Marcar/tachar ingredientes de la lista
test.describe("HU 5.2 Marcar ingredientes de la lista", () => {
  const arrozId = "9017b44e-1d3f-4414-95d9-bac5d28790fc"; // Arroz integral
  const pechugaId = "05756545-04f4-4f3f-8254-6e5d678edc93"; // Pechuga de pollo
  const manzanaId = "d9ac1aab-7651-4acf-9d8f-9287036e5f43"; // Manzana
  const salmonId = "1688136e-53eb-4edd-9753-4774dc6560db"; // Salmón (no está en el menú)

  const shoppingListUrl = `${apiUrl}/api/menus/${userId}/shopping-list`;
  const itemUrl = (itemId) => `${shoppingListUrl}/items/${itemId}`;

  // Menú semanal con tres alimentos distintos (sin alérgenos) y ninguno marcado como comprado.
  async function givenWeeklyMenu(request) {
    const menu = await request.put(`${apiUrl}/api/menus/${userId}`, {
      data: {
        days: {
          lunes: { desayuno: [arrozId], comida: [pechugaId], cena: [manzanaId] },
          martes: { desayuno: [arrozId], comida: [], cena: [] },
        },
      },
    });
    expect(menu.ok()).toBe(true);
    for (const itemId of [arrozId, pechugaId, manzanaId]) {
      const reset = await request.put(itemUrl(itemId), { data: { checked: false } });
      expect(reset.ok()).toBe(true);
    }
  }

  async function openShoppingTab(page) {
    await page.getByRole("button", { name: "Compra" }).click();
    await expect(page.getByRole("heading", { name: "Lista de la compra" })).toBeVisible();
    return page.getByRole("list", { name: "Lista de la compra" });
  }

  // Espera a que el backend confirme el cambio (la interfaz lo muestra antes, de forma optimista).
  const waitForSave = (page, itemId) =>
    page.waitForResponse(
      (response) => response.request().method() === "PUT" && response.url().endsWith(`/items/${itemId}`),
    );

  const progress = (page) => page.getByRole("status").filter({ hasText: "comprados" });
  const itemName = (list, name) => list.getByRole("listitem").filter({ hasText: name }).getByText(name, { exact: true });

  test("AC1: al marcar un ingrediente aparece tachado y se actualiza el contador de comprados", async ({
    page,
    request,
  }) => {
    // Dado un menú semanal con varios alimentos y ninguno comprado
    await givenWeeklyMenu(request);
    await page.goto("/");
    const lista = await openShoppingTab(page);
    await expect(progress(page)).toHaveText("0 de 3 comprados");

    // Cuando el usuario marca "Arroz integral"
    const arroz = lista.getByRole("checkbox", { name: "Arroz integral" });
    await arroz.check();

    // Entonces aparece marcado y tachado, y el contador pasa a 1 de 3
    await expect(arroz).toBeChecked();
    await expect(itemName(lista, "Arroz integral")).toHaveCSS("text-decoration-line", "line-through");
    await expect(progress(page)).toHaveText("1 de 3 comprados");

    // y el resto de la lista sigue sin marcar y en el mismo orden
    await expect(lista.getByRole("checkbox", { name: "Pechuga de pollo" })).not.toBeChecked();
    await expect(itemName(lista, "Pechuga de pollo")).not.toHaveCSS("text-decoration-line", "line-through");
    await expect(lista.getByRole("listitem")).toContainText(["Arroz integral", "Manzana", "Pechuga de pollo"]);
  });

  test("AC2: un ingrediente marcado sigue marcado al recargar la página", async ({ page, request }) => {
    // Dado un ingrediente marcado como comprado desde la lista
    await givenWeeklyMenu(request);
    await page.goto("/");
    let lista = await openShoppingTab(page);
    const saved = waitForSave(page, pechugaId);
    await lista.getByRole("checkbox", { name: "Pechuga de pollo" }).check();
    expect((await saved).ok()).toBe(true);

    // Cuando el usuario recarga la página y vuelve a la pestaña Compra
    await page.reload();
    lista = await openShoppingTab(page);

    // Entonces el ingrediente sigue marcado y tachado
    await expect(lista.getByRole("checkbox", { name: "Pechuga de pollo" })).toBeChecked();
    await expect(itemName(lista, "Pechuga de pollo")).toHaveCSS("text-decoration-line", "line-through");
    await expect(progress(page)).toHaveText("1 de 3 comprados");

    // y el backend lo devuelve marcado en la lista de la compra
    const list = await (await request.get(shoppingListUrl)).json();
    expect(list.find((item) => item.foodId === pechugaId)).toMatchObject({ id: pechugaId, checked: true });
  });

  test("AC3: al desmarcar un ingrediente vuelve a mostrarse normal y se conserva tras recargar", async ({
    page,
    request,
  }) => {
    // Dado un ingrediente ya marcado como comprado
    await givenWeeklyMenu(request);
    await request.put(itemUrl(manzanaId), { data: { checked: true } });
    await page.goto("/");
    let lista = await openShoppingTab(page);
    const manzana = lista.getByRole("checkbox", { name: "Manzana" });
    await expect(manzana).toBeChecked();
    await expect(progress(page)).toHaveText("1 de 3 comprados");

    // Cuando el usuario lo desmarca
    const saved = waitForSave(page, manzanaId);
    await manzana.uncheck();
    expect((await saved).ok()).toBe(true);

    // Entonces deja de estar tachado y el contador vuelve a 0 de 3
    await expect(manzana).not.toBeChecked();
    await expect(itemName(lista, "Manzana")).toHaveCSS("text-decoration-line", "none");
    await expect(progress(page)).toHaveText("0 de 3 comprados");

    // y sigue desmarcado tras recargar la página
    await page.reload();
    lista = await openShoppingTab(page);
    await expect(lista.getByRole("checkbox", { name: "Manzana" })).not.toBeChecked();
    await expect(progress(page)).toHaveText("0 de 3 comprados");
  });

  test("AC4: PUT /api/menus/:userId/shopping-list/items/:itemId rechaza con 400 un checked no booleano y con 404 un producto fuera de la lista o un usuario inexistente", async ({
    request,
  }) => {
    // Dado un menú semanal sin Salmón y ningún ingrediente marcado
    await givenWeeklyMenu(request);

    // Cuando se envía checked como texto en lugar de booleano
    const invalid = await request.put(itemUrl(arrozId), { data: { checked: "true" } });
    // Entonces se rechaza con 400
    expect(invalid.status()).toBe(400);
    expect(await invalid.json()).toMatchObject({ error: true, code: 400 });

    // Cuando se marca un alimento que no está en la lista de la compra
    const missing = await request.put(itemUrl(salmonId), { data: { checked: true } });
    // Entonces se responde 404
    expect(missing.status()).toBe(404);
    expect(await missing.json()).toMatchObject({
      error: true,
      code: 404,
      message: "El producto no está en la lista de la compra",
    });

    // Cuando el usuario no existe
    const unknownUser = await request.put(
      `${apiUrl}/api/menus/${crypto.randomUUID()}/shopping-list/items/${arrozId}`,
      { data: { checked: true } },
    );
    // Entonces se responde 404
    expect(unknownUser.status()).toBe(404);

    // y ningún ingrediente ha quedado marcado
    const list = await (await request.get(shoppingListUrl)).json();
    expect(list.map((item) => item.checked)).toEqual([false, false, false]);
  });
});
