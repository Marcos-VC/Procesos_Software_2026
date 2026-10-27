import { expect, test } from "@playwright/test";

const apiUrl = "http://localhost:3100";
const userId = "5d37a69d-97c8-4280-afb7-2dc90467d688";
const profileUrl = `${apiUrl}/api/users/${userId}/nutritional-profile`;

// HU 2.1 - Fijar objetivo calórico diario
test.describe("HU 2.1 Fijar objetivo calórico diario", () => {
  let originalGoal;

  test.beforeAll(async ({ request }) => {
    originalGoal = (await (await request.get(profileUrl)).json()).caloricGoal;
  });

  // Restaura el perfil para no afectar al resto de pruebas.
  test.afterAll(async ({ request }) => {
    await request.put(profileUrl, { data: { caloricGoal: originalGoal } });
  });

  test("AC1: indicar el objetivo calórico y guardar actualiza el perfil", async ({
    page,
    request,
  }) => {
    // Dado que el usuario está en la pantalla de edición de su perfil
    await page.goto("/");
    await page.getByRole("button", { name: "Perfil" }).click();
    await expect(page.getByRole("heading", { name: "Perfil nutricional" })).toBeVisible();

    // Cuando indica su objetivo calórico diario y guarda
    await page.getByLabel("Objetivo calórico diario (kcal)").fill("2000");
    await page.getByRole("button", { name: "Guardar cambios" }).click();

    // Entonces la app actualiza el objetivo del usuario en el sistema
    await expect(page.getByRole("status")).toHaveText("Perfil guardado correctamente");
    await expect(page.getByLabel("Perfil nutricional").getByText("2000 kcal")).toBeVisible();

    const saved = await (await request.get(profileUrl)).json();
    expect(saved.caloricGoal).toBe(2000);

    // Y el objetivo persiste tras recargar
    await page.reload();
    await page.getByRole("button", { name: "Perfil" }).click();
    await expect(page.getByLabel("Objetivo calórico diario (kcal)")).toHaveValue("2000");
  });
});

const allergiesUrl = `${apiUrl}/api/users/${userId}/allergies`;

// HU 2.2 - Configurar alergias
test.describe("HU 2.2 Configurar alergias", () => {
  let originalAllergies;

  test.beforeAll(async ({ request }) => {
    originalAllergies = (await (await request.get(profileUrl)).json()).medicalRestrictions.allergies;
  });

  test.afterAll(async ({ request }) => {
    await request.put(allergiesUrl, { data: originalAllergies });
  });

  test("AC1: marcar alergias y guardar actualiza el perfil", async ({ page, request }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Perfil" }).click();
    const lactosa = page.getByRole("checkbox", { name: /Lactosa/ });
    const gluten = page.getByRole("checkbox", { name: /Gluten/ });
    await expect(gluten).toBeChecked();

    await lactosa.check();
    await gluten.uncheck();
    await page.getByRole("button", { name: "Guardar cambios" }).click();

    await expect(page.getByRole("status")).toHaveText("Perfil guardado correctamente");
    const saved = await (await request.get(profileUrl)).json();
    expect(saved.medicalRestrictions.allergies.sort()).toEqual(["cacahuetes", "lactosa"]);
    await expect(page.getByText("✓ Añadida")).toHaveCount(2);
  });

  test("AC2: un alérgeno desconocido se rechaza con 400", async ({ request }) => {
    const response = await request.put(allergiesUrl, { data: ["polvo_de_hadas"] });
    expect(response.status()).toBe(400);
    expect((await response.json()).error).toBe(true);
  });

  test("AC3: un usuario inexistente devuelve 404", async ({ request }) => {
    const response = await request.put(`${apiUrl}/api/users/${crypto.randomUUID()}/allergies`, {
      data: ["gluten"],
    });
    expect(response.status()).toBe(404);
  });
});

const dietUrl = `${apiUrl}/api/users/${userId}/diet-type`;

// HU 2.3 - Introducir preferencias dietéticas
test.describe("HU 2.3 Introducir preferencias dietéticas", () => {
  let originalDiet;

  test.beforeAll(async ({ request }) => {
    const profile = await (await request.get(profileUrl)).json();
    originalDiet = profile.medicalRestrictions?.dietType || "omnivore";
  });

  // Restaura la preferencia dietética para no afectar al resto de pruebas.
  test.afterAll(async ({ request }) => {
    await request.put(dietUrl, { data: { dietType: originalDiet } });
  });

  test("AC1: seleccionar una preferencia dietética y guardar actualiza el perfil y persiste tras recargar", async ({
    page,
    request,
  }) => {
    // Dado que el usuario está en la pantalla de edición de su perfil
    await page.goto("/");
    await page.getByRole("button", { name: "Perfil" }).click();
    await expect(page.getByRole("heading", { name: "Perfil nutricional" })).toBeVisible();

    // Cuando selecciona una preferencia dietética (por ejemplo, Vegana) y pulsa Guardar cambios
    await page.getByLabel(/Vegana/i).click();
    await page.getByRole("button", { name: "Guardar cambios" }).click();

    // Entonces la app actualiza el perfil del usuario en el sistema
    await expect(page.getByRole("status")).toHaveText("Perfil guardado correctamente");
    await expect(page.getByLabel("Perfil nutricional").getByText(/Vegana/i)).toBeVisible();

    const saved = await (await request.get(profileUrl)).json();
    expect(saved.medicalRestrictions.dietType).toBe("vegan");

    // Y la preferencia persiste tras recargar
    await page.reload();
    await page.getByRole("button", { name: "Perfil" }).click();
    const veganRadio = page.getByRole("radio", { name: /Vegana/i });
    await expect(veganRadio).toBeChecked();

    // Y el catálogo oculta los alimentos incompatibles y muestra un aviso.
    await page.getByRole("button", { name: "Catálogo" }).click();
    await expect(
      page.getByText("Pueden no aparecer algunos alimentos por tu tipo de dieta."),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Salmón" })).not.toBeVisible();
  });

  test("AC2: una preferencia dietética no válida se rechaza con 400", async ({ request }) => {
    const response = await request.put(dietUrl, {
      data: { dietType: "sin_restricciones" },
    });

    expect(response.status()).toBe(400);
    expect((await response.json()).error).toBe(true);
  });

  test("AC3: un usuario inexistente devuelve 404", async ({ request }) => {
    const response = await request.put(`${apiUrl}/api/users/${crypto.randomUUID()}/diet-type`, {
      data: { dietType: "vegan" },
    });

    expect(response.status()).toBe(404);
  });

});
