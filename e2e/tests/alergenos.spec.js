import { expect, test } from "@playwright/test";

const apiUrl = "http://localhost:3100";
const userId = "5d37a69d-97c8-4280-afb7-2dc90467d688";
const allergiesUrl = `${apiUrl}/api/users/${userId}/allergies`;
const menuUrl = `${apiUrl}/api/menus/${userId}`;

// HU 3.4 - Motor de reglas para bloquear alimentos peligrosos
test.describe("HU 3.4 Motor de reglas para bloquear alimentos peligrosos", () => {
  let originalAllergies;

  test.beforeAll(async ({ request }) => {
    const profile = await (
      await request.get(`${apiUrl}/api/users/${userId}/nutritional-profile`)
    ).json();
    originalAllergies = profile.medicalRestrictions.allergies;
  });

  // Restaura las alergias originales para no afectar al resto de pruebas (el usuario demo
  // se comparte entre specs).
  test.afterAll(async ({ request }) => {
    await request.put(allergiesUrl, { data: originalAllergies });
  });

  test("AC1: GET /api/foods?userId= marca blocked/blockedBy con los alérgenos del perfil", async ({
    request,
  }) => {
    // Dado el usuario demo, con alergias a gluten y cacahuetes
    // Cuando se busca un alimento que contiene uno de esos alérgenos pasando su userId
    const withUser = await (
      await request.get(`${apiUrl}/api/foods?search=pan&userId=${userId}`)
    ).json();

    // Entonces el alimento se marca como bloqueado junto al alérgeno responsable
    expect(withUser).toHaveLength(1);
    expect(withUser[0].name).toBe("Pan de trigo");
    expect(withUser[0].blocked).toBe(true);
    expect(withUser[0].blockedBy).toEqual(["gluten"]);

    // Y sin userId no se incluyen esos campos (no rompe el contrato de quien no lo manda)
    const withoutUser = await (await request.get(`${apiUrl}/api/foods?search=pan`)).json();
    expect(withoutUser[0]).not.toHaveProperty("blocked");
    expect(withoutUser[0]).not.toHaveProperty("blockedBy");
  });

  test("AC2: PUT /api/menus/:userId rechaza con 422 un alimento con alérgenos del perfil", async ({
    request,
  }) => {
    // Dado el id de "Pan de trigo" (contiene gluten, alergia del usuario demo)
    const [panDeTrigo] = await (await request.get(`${apiUrl}/api/foods?search=pan`)).json();

    // Cuando se intenta guardar un menú que lo incluye
    const response = await request.put(menuUrl, {
      data: { days: { lunes: { desayuno: [panDeTrigo.id], comida: [], cena: [] } } },
    });

    // Entonces se rechaza con 422 y un mensaje describiendo el alérgeno
    expect(response.status()).toBe(422);
    const body = await response.json();
    expect(body.error).toBe(true);
    expect(body.message).toContain("Pan de trigo");
    expect(body.message).toContain("gluten");
  });

  test("AC3: un menú sin alérgenos del perfil se sigue guardando correctamente (camino feliz)", async ({
    request,
  }) => {
    // Dado el id de "Manzana" (sin alérgenos)
    const [manzana] = await (await request.get(`${apiUrl}/api/foods?search=manzana`)).json();

    // Cuando se guarda un menú que solo lo incluye a él
    const response = await request.put(menuUrl, {
      data: { days: { lunes: { desayuno: [manzana.id], comida: [], cena: [] } } },
    });

    // Entonces se guarda sin problemas
    expect(response.status()).toBe(200);
    const saved = await response.json();
    expect(saved.days.lunes.desayuno).toEqual([manzana.id]);
  });

  test("AC4: guardar desde el diseñador de menús un alimento que pasa a tener un alérgeno del perfil falla con 422 y el error se ve en la interfaz", async ({
    page,
    request,
  }) => {
    // Dado un menú vacío y que el usuario todavía no es alérgico a la lactosa
    await request.put(menuUrl, { data: { days: {} } });
    await request.put(allergiesUrl, { data: ["gluten", "cacahuetes"] });

    // Y el usuario añade "Yogur natural" (alérgeno: lactosa) al Desayuno desde el picker real,
    // que en ese momento no lo ve bloqueado porque el perfil cargado aún no tiene esa alergia
    await page.goto("/");
    await page.getByRole("button", { name: "Menú" }).click();
    await expect(page.getByRole("heading", { name: "Diseñador de menús" })).toBeVisible();
    const desayuno = page.getByRole("region", { name: "Desayuno" });
    await desayuno.getByRole("button", { name: "Añadir alimento" }).click();
    const yogurButton = desayuno.getByRole("button", { name: "Yogur natural" });
    await expect(yogurButton).toBeEnabled();
    await yogurButton.click();
    await expect(desayuno).toContainText("Yogur natural");

    // Cuando el perfil del usuario pasa a tener alergia a la lactosa (p. ej. actualizado desde Perfil)
    await request.put(allergiesUrl, { data: ["gluten", "cacahuetes", "lactosa"] });

    // Y pulsa "Guardar menú"
    await page.getByRole("button", { name: "Guardar menú" }).click();

    // Entonces el motor de reglas del backend rechaza el alimento con 422 y la interfaz muestra el error
    const alert = page.getByRole("alert");
    await expect(alert).toBeVisible();
    await expect(alert).toContainText("Yogur natural");
    await expect(alert).toContainText("lactosa");
  });
});
