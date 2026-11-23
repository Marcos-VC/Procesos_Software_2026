import { expect, test } from "@playwright/test";

const apiUrl = "http://localhost:3100";
const userId = "5d37a69d-97c8-4280-afb7-2dc90467d688";
const pantryUrl = `${apiUrl}/api/pantry/${userId}`;

// HU 4.1 - Inventario básico (Despensa virtual)
test.describe("HU 4.1 Añadir y quitar productos de la despensa virtual", () => {
  test("AC1: introducir el nombre y unidad de un ingrediente y pulsar Añadir lo suma al listado de existencias", async ({
    page,
    request,
  }) => {
    // Dado que el usuario está en su despensa virtual
    await page.goto("/");
    await page.getByRole("button", { name: "Despensa" }).click();
    await expect(page.getByRole("heading", { name: "Despensa virtual" })).toBeVisible();

    // Cuando introduce el nombre, cantidad y unidad de un ingrediente y pulsa "Añadir"
    await page.getByLabel("Nombre del ingrediente").fill("Leche de avena");
    await page.getByLabel("Cantidad", { exact: true }).fill("2");
    await page.getByLabel("Unidad").selectOption("l");
    await page.getByRole("button", { name: "Añadir" }).click();

    // Entonces el producto se añade al listado de existencias
    await expect(page.getByRole("status")).toContainText('Producto "Leche de avena" añadido a la despensa');
    const inventoryList = page.getByRole("list", { name: "Listado de existencias" });
    await expect(inventoryList).toContainText("Leche de avena");
    await expect(inventoryList).toContainText("2 l");

    // Y si vuelve a añadir el mismo ingrediente con la misma unidad, la cantidad se suma
    await page.getByLabel("Nombre del ingrediente").fill("Leche de avena");
    await page.getByLabel("Cantidad", { exact: true }).fill("1");
    await page.getByLabel("Unidad").selectOption("l");
    await page.getByRole("button", { name: "Añadir" }).click();

    await expect(inventoryList).toContainText("3 l");

    // Y persiste en el backend
    const items = await (await request.get(pantryUrl)).json();
    const added = items.find((item) => item.name === "Leche de avena");
    expect(added).toBeDefined();
    expect(added.quantity).toBe(3);
    expect(added.unit).toBe("l");
  });

  test("AC2: reducir la cantidad o eliminar un producto y confirmar refleja el cambio al instante en el inventario", async ({
    page,
    request,
  }) => {
    // Dado que el usuario está en su despensa virtual con productos en el inventario
    await page.goto("/");
    await page.getByRole("button", { name: "Despensa" }).click();
    await expect(page.getByRole("heading", { name: "Despensa virtual" })).toBeVisible();

    const inventoryList = page.getByRole("list", { name: "Listado de existencias" });
    await expect(inventoryList).toContainText("Arroz integral");
    await expect(inventoryList).toContainText("500 g");

    // Cuando reduce la cantidad de un producto y confirma la modificación
    await page.getByLabel("Cantidad de Arroz integral").fill("250");
    await page.getByRole("button", { name: "Confirmar modificación de Arroz integral" }).click();

    // Entonces el inventario refleja la nueva cantidad al instante
    await expect(page.getByRole("status")).toContainText(
      'Existencias de "Arroz integral" actualizadas (250 g)',
    );
    await expect(inventoryList).toContainText("250 g");

    const afterUpdate = await (await request.get(pantryUrl)).json();
    expect(afterUpdate.find((item) => item.name === "Arroz integral").quantity).toBe(250);

    // Y cuando elimina un producto de su lista de despensa
    await page.getByRole("button", { name: "Eliminar Huevos" }).click();

    // Entonces desaparece del inventario al instante y se refleja en el backend
    await expect(page.getByRole("status")).toContainText(
      'Producto "Huevos" eliminado de la despensa',
    );
    await expect(inventoryList).not.toContainText("Huevos");

    const afterDelete = await (await request.get(pantryUrl)).json();
    expect(afterDelete.find((item) => item.name === "Huevos")).toBeUndefined();
  });

  test("AC3: validaciones de la API de despensa rechazan datos inválidos con 400 y no encontrados con 404", async ({
    request,
  }) => {
    // Nombre vacío o cantidad negativa se rechaza con 400
    const badPost = await request.post(pantryUrl, {
      data: { name: "", quantity: -2, unit: "g" },
    });
    expect(badPost.status()).toBe(400);
    expect((await badPost.json()).error).toBe(true);

    // Actualizar o eliminar un producto inexistente devuelve 404
    const fakeItemId = crypto.randomUUID();
    const notFoundPut = await request.put(`${pantryUrl}/${fakeItemId}`, {
      data: { quantity: 100 },
    });
    expect(notFoundPut.status()).toBe(404);

    const notFoundDelete = await request.delete(`${pantryUrl}/${fakeItemId}`);
    expect(notFoundDelete.status()).toBe(404);
  });
});

