import { expect, test } from "@playwright/test";

const apiUrl = "http://localhost:3100";
const userId = "5d37a69d-97c8-4280-afb7-2dc90467d688";

// HU 3.1 - Crear menú básico
test.describe("HU 3.1 Crear menú básico", () => {
  test("AC1: asignar alimentos del catálogo a Desayuno, Comida y Cena los añade al día", async ({
    page,
    request,
  }) => {
    // Dado un menú vacío (los tests comparten backend; así no dependen de ejecuciones previas)
    await request.put(`${apiUrl}/api/menus/${userId}`, { data: { days: {} } });

    // Y que el usuario se encuentra en el diseñador de menús
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

  // Auditoría Sprint 1: menuService.parseDays rechaza con 400 un alimento que no existe en el
  // catálogo (no había ningún test que cubriera este camino de validación del guardado del menú).
  test("AC2: PUT /api/menus/:userId rechaza con 400 un alimento inexistente en el menú", async ({
    request,
  }) => {
    // Dado un id de alimento que no existe en el catálogo
    // Cuando se intenta guardar un menú que lo incluye
    const response = await request.put(`${apiUrl}/api/menus/${userId}`, {
      data: { days: { lunes: { desayuno: ["id-inexistente"], comida: [], cena: [] } } },
    });

    // Entonces se rechaza con 400 y un mensaje describiendo el error
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBe(true);
    expect(body.message).toContain("Alimento no encontrado");
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

  test("AC2: guardar un favorito con el nombre vacío se rechaza con 400", async ({ request }) => {
    // El botón "Guardar" del modal "Guardar menú como favorito" está disabled={!favoriteName.trim()}
    // mientras el nombre esté vacío, así que no hay forma de disparar este 400 desde la UI real:
    // probamos directamente el endpoint POST /api/menus/favorites { userId, name, days } que usa
    // ese modal (menuController.postFavoriteMenu / menuService.createFavorite).

    // Dado un nombre vacío
    const emptyName = await request.post(`${apiUrl}/api/menus/favorites`, {
      data: { userId, name: "", days: {} },
    });
    expect(emptyName.status()).toBe(400);
    const emptyBody = await emptyName.json();
    expect(emptyBody.error).toBe(true);
    expect(emptyBody.message).toBe("name es obligatorio");

    // Y un nombre que son solo espacios (menuService.createFavorite hace trim antes de validar)
    const blankName = await request.post(`${apiUrl}/api/menus/favorites`, {
      data: { userId, name: "   ", days: {} },
    });
    expect(blankName.status()).toBe(400);
    expect((await blankName.json()).message).toBe("name es obligatorio");
  });
});

// HU 3.2 - Sumar calorías del menú automáticamente
test.describe("HU 3.2 Sumar calorías del menú automáticamente", () => {
  test("AC1: sumar calorías de los alimentos asignados actualiza el total del día y de cada comida en tiempo real", async ({
    page,
    request,
  }) => {
    // Limpiar menú antes de probar
    await request.put(`${apiUrl}/api/menus/${userId}`, { data: { days: {} } });

    await page.goto("/");
    await page.getByRole("button", { name: "Menú" }).click();
    await expect(page.getByRole("heading", { name: "Diseñador de menús" })).toBeVisible();

    // Comprobar estado inicial (0 kcal)
    const desayuno = page.getByRole("region", { name: "Desayuno" });
    await expect(desayuno).toContainText("0 kcal");

    // Añadir Manzana (52 kcal) al Desayuno
    await desayuno.getByRole("button", { name: "Añadir alimento" }).click();
    await desayuno.getByRole("button", { name: "Manzana" }).click();

    // Verificar actualización automática en la comida y en el día
    await expect(desayuno).toContainText("52 kcal");
    await expect(page.getByRole("button", { name: "Lunes" })).toContainText("52 kcal");

    // Añadir Pechuga de pollo (165 kcal) a la Comida
    const comida = page.getByRole("region", { name: "Comida" });
    await comida.getByRole("button", { name: "Añadir alimento" }).click();
    await comida.getByRole("button", { name: "Pechuga de pollo" }).click();

    // Verificar total acumulado (52 + 165 = 217 kcal)
    await expect(comida).toContainText("165 kcal");
    await expect(page.getByRole("button", { name: "Lunes" })).toContainText("217 kcal");

    // Eliminar alimento y comprobar que las calorías restan inmediatamente
    await desayuno.getByRole("button", { name: "Quitar Manzana de Desayuno" }).click();
    await expect(desayuno).toContainText("0 kcal");
    await expect(page.getByRole("button", { name: "Lunes" })).toContainText("165 kcal");
  });

  test("AC2: el total acumulado de la semana suma las calorías de varios días y baja al quitar un alimento", async ({
    page,
    request,
  }) => {
    // Limpiar menú antes de probar
    await request.put(`${apiUrl}/api/menus/${userId}`, { data: { days: {} } });

    await page.goto("/");
    await page.getByRole("button", { name: "Menú" }).click();
    await expect(page.getByRole("heading", { name: "Diseñador de menús" })).toBeVisible();

    // Dado el total acumulado de la semana a 0 kcal
    const weeklyTotal = page.locator("p", { hasText: "Total acumulado semana" });
    await expect(weeklyTotal).toContainText("0 kcal");

    // Cuando añade Manzana (52 kcal) al Desayuno del Lunes (día seleccionado por defecto)
    const desayuno = page.getByRole("region", { name: "Desayuno" });
    await desayuno.getByRole("button", { name: "Añadir alimento" }).click();
    await desayuno.getByRole("button", { name: "Manzana" }).click();
    await expect(weeklyTotal).toContainText("52 kcal");

    // Y añade Pechuga de pollo (165 kcal) a la Comida del Martes (otro día de la semana)
    await page.getByRole("button", { name: "Martes" }).click();
    const comida = page.getByRole("region", { name: "Comida" });
    await comida.getByRole("button", { name: "Añadir alimento" }).click();
    await comida.getByRole("button", { name: "Pechuga de pollo" }).click();

    // Entonces el total semanal es la suma de ambos días (52 + 165 = 217 kcal)
    await expect(weeklyTotal).toContainText("217 kcal");

    // Y al quitar el alimento del Martes, el total semanal baja en consecuencia
    await comida.getByRole("button", { name: "Quitar Pechuga de pollo de Comida" }).click();
    await expect(weeklyTotal).toContainText("52 kcal");
  });
});
