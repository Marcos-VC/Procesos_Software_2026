import { expect, test } from "@playwright/test";

const apiUrl = "http://localhost:3100";
const userId = "5d37a69d-97c8-4280-afb7-2dc90467d688";
const profileUrl = `${apiUrl}/api/users/${userId}/nutritional-profile`;

// HU 2.1 - Configurar perfil nutricional (Alergias/Intolerancias)
test.describe("HU 2.1 Configurar perfil nutricional", () => {
  let originalProfile;

  test.beforeAll(async ({ request }) => {
    originalProfile = await (await request.get(profileUrl)).json();
  });

  // Restaura el perfil para no afectar al resto de pruebas.
  test.afterAll(async ({ request }) => {
    await request.put(profileUrl, {
      data: {
        caloricGoal: originalProfile.caloricGoal,
        medicalRestrictions: { allergies: originalProfile.medicalRestrictions.allergies },
      },
    });
  });

  test("AC1: seleccionar alergias del desplegable y guardar actualiza el perfil", async ({
    page,
    request,
  }) => {
    // Dado que el usuario está en la pantalla de edición de su perfil
    await page.goto("/");
    await page.getByRole("button", { name: "Perfil" }).click();
    await expect(page.getByRole("heading", { name: "Perfil nutricional" })).toBeVisible();

    // Cuando selecciona una o varias alergias del listado desplegable y guarda
    await page.getByText(/Alergias e intolerancias/).click();
    await page.getByRole("checkbox", { name: /Huevo/ }).check();
    await page.getByRole("checkbox", { name: /Soja/ }).check();
    await page.getByRole("button", { name: "Guardar cambios" }).click();

    // Entonces la app actualiza las preferencias del usuario en el sistema
    await expect(page.getByRole("status")).toHaveText("Perfil guardado correctamente");
    await expect(page.getByLabel("Perfil nutricional").getByText(/huevo, soja/)).toBeVisible();

    const saved = await (await request.get(profileUrl)).json();
    expect(saved.medicalRestrictions.allergies).toEqual(
      expect.arrayContaining(["gluten", "cacahuetes", "huevo", "soja"]),
    );

    // Y la preferencia persiste tras recargar
    await page.reload();
    await page.getByRole("button", { name: "Perfil" }).click();
    await page.getByText(/Alergias e intolerancias/).click();
    await expect(page.getByRole("checkbox", { name: /Huevo/ })).toBeChecked();
    await expect(page.getByRole("checkbox", { name: /Soja/ })).toBeChecked();

    // Y el catálogo bloquea los alimentos con esos alérgenos
    await page.getByRole("button", { name: "Catálogo" }).click();
    const tofu = page.locator("article", { has: page.getByRole("heading", { name: "Tofu" }) });
    await expect(tofu).toContainText("Bloqueado por tu perfil: soja");
  });
});
