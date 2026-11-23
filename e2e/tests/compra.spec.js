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

// HU 5.3 - Compartir lista de la compra (WhatsApp/Email)
// Cada botón copia la lista al portapapeles y abre WhatsApp o el correo para pegarla. Los tests leen el
// portapapeles y nunca abren de verdad WhatsApp (wa.me se sirve en local) ni el cliente de correo.
test.describe("HU 5.3 Compartir lista de la compra", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  const arrozId = "9017b44e-1d3f-4414-95d9-bac5d28790fc"; // Arroz integral
  const pechugaId = "05756545-04f4-4f3f-8254-6e5d678edc93"; // Pechuga de pollo
  const manzanaId = "d9ac1aab-7651-4acf-9d8f-9287036e5f43"; // Manzana

  const shoppingListUrl = `${apiUrl}/api/menus/${userId}/shopping-list`;
  const itemsUrl = `${shoppingListUrl}/items`;
  const itemUrl = (itemId) => `${itemsUrl}/${itemId}`;

  // Menú con Arroz integral (2 veces), Pechuga de pollo y Manzana (1 vez), sin alérgenos.
  const weeklyMenu = {
    lunes: { desayuno: [arrozId], comida: [pechugaId], cena: [manzanaId] },
    martes: { desayuno: [arrozId], comida: [], cena: [] },
  };

  // Los tests comparten backend: borra los productos añadidos a mano que hayan quedado.
  async function deleteManualItems(request) {
    const list = await (await request.get(shoppingListUrl)).json();
    for (const item of list.filter((entry) => entry.source === "manual")) {
      const deleted = await request.delete(itemUrl(item.id));
      expect(deleted.status()).toBe(204);
    }
  }

  // Guarda el menú semanal, sin productos añadidos a mano y sin nada marcado como comprado.
  async function givenWeeklyMenu(request) {
    const menu = await request.put(`${apiUrl}/api/menus/${userId}`, { data: { days: weeklyMenu } });
    expect(menu.ok()).toBe(true);
    await deleteManualItems(request);
    const list = await (await request.get(shoppingListUrl)).json();
    for (const item of list.filter((entry) => entry.checked)) {
      const reset = await request.put(itemUrl(item.id), { data: { checked: false } });
      expect(reset.ok()).toBe(true);
    }
  }

  async function markAsBought(request, itemIds) {
    for (const itemId of itemIds) {
      const marked = await request.put(itemUrl(itemId), { data: { checked: true } });
      expect(marked.ok()).toBe(true);
    }
  }

  // WhatsApp se sirve en local: ninguna petición sale del equipo.
  test.beforeEach(async ({ context }) => {
    await context.route("https://wa.me/**", (route) =>
      route.fulfill({ status: 200, contentType: "text/html", body: "<p>WhatsApp</p>" }),
    );
  });

  // Cada test deja la lista sin los productos manuales que haya creado.
  test.afterEach(async ({ request }) => {
    await deleteManualItems(request);
  });

  async function openShoppingTab(page) {
    await page.getByRole("button", { name: "Compra" }).click();
    await expect(page.getByRole("heading", { name: "Lista de la compra" })).toBeVisible();
    return page.getByRole("list", { name: "Lista de la compra" });
  }

  const whatsappLink = (page) => page.getByRole("link", { name: "Copiar y abrir WhatsApp", exact: true });
  const emailLink = (page) => page.getByRole("link", { name: "Copiar y abrir correo", exact: true });
  const progress = (page) => page.getByRole("status").filter({ hasText: "comprados" });
  const copiedFeedback = (page) => page.getByRole("status").filter({ hasText: "Lista copiada" });

  // Texto que se espera copiar: el título, una línea en blanco y un producto pendiente por línea.
  const sharedText = (...lines) => ["Lista de la compra (Healthy Life)", "", ...lines].join("\n");

  const readClipboard = (page) =>
    page.evaluate(async () => (await navigator.clipboard.readText()).replace(/\r\n/g, "\n"));

  // Vacía el portapapeles para que lo que se lea después venga del clic.
  const clearClipboard = (page) => page.evaluate(() => navigator.clipboard.writeText(""));

  // Evita que el navegador intente abrir el cliente de correo: cancela la navegación de los enlaces
  // mailto: en la fase de captura (el onClick de React se sigue ejecutando y copia la lista).
  const blockMailto = (page) =>
    page.evaluate(() => {
      document.addEventListener(
        "click",
        (event) => {
          if (event.target instanceof Element && event.target.closest('a[href^="mailto:"]')) {
            event.preventDefault();
          }
        },
        true,
      );
    });

  // Pulsa "Copiar y abrir WhatsApp" y devuelve la pestaña de WhatsApp que se abre.
  async function copyAndOpenWhatsapp(page, context) {
    const opened = context.waitForEvent("page");
    await whatsappLink(page).click();
    const whatsapp = await opened;
    await whatsapp.waitForLoadState();
    return whatsapp;
  }

  test("AC1: \"Copiar y abrir WhatsApp\" copia el título y los productos pendientes y abre WhatsApp en una pestaña nueva", async ({
    page,
    context,
    request,
  }) => {
    // Dado un menú semanal con Arroz integral (2 veces), Manzana y Pechuga de pollo, sin nada comprado
    await givenWeeklyMenu(request);
    await page.goto("/");
    const lista = await openShoppingTab(page);
    await expect(lista.getByRole("listitem")).toHaveCount(3);
    await expect(page.getByText("Se copian los 3 productos pendientes")).toBeVisible();
    await clearClipboard(page);

    // Cuando el usuario pulsa "Copiar y abrir WhatsApp"
    const whatsapp = await copyAndOpenWhatsapp(page, context);

    // Entonces se abre WhatsApp (wa.me, sin texto) en una pestaña nueva
    expect(whatsapp.url()).toBe("https://wa.me/");
    await whatsapp.close();
    await expect(whatsappLink(page)).toHaveAttribute("href", "https://wa.me/");
    await expect(whatsappLink(page)).toHaveAttribute("target", "_blank");
    await expect(whatsappLink(page)).toHaveAttribute("rel", /noopener/);
    // y el portapapeles tiene el título y todos los productos pendientes en el orden de la lista,
    // con "(x2)" en el alimento repetido
    await expect(copiedFeedback(page)).toHaveText("Lista copiada. Pégala en el chat de WhatsApp.");
    await expect
      .poll(() => readClipboard(page))
      .toBe(sharedText("- Arroz integral (x2)", "- Manzana", "- Pechuga de pollo"));
    // y el aviso desaparece a los pocos segundos
    await expect(copiedFeedback(page)).toHaveCount(0, { timeout: 6000 });
  });

  test("AC2: \"Copiar y abrir correo\" copia los mismos productos pendientes y abre un correo con el asunto \"Lista de la compra\"", async ({
    page,
    context,
    request,
  }) => {
    // Dado un menú semanal en el que la Manzana ya está marcada como comprada
    await givenWeeklyMenu(request);
    await markAsBought(request, [manzanaId]);
    await page.goto("/");
    await openShoppingTab(page);
    await expect(progress(page)).toHaveText("1 de 3 comprados");
    await expect(page.getByText("Se copian los 2 productos pendientes")).toBeVisible();
    await clearClipboard(page);
    await blockMailto(page);

    // Cuando el usuario pulsa "Copiar y abrir correo"
    await emailLink(page).click();

    // Entonces el enlace abre un correo nuevo (mailto: sin destinatario) solo con el asunto
    const href = await emailLink(page).getAttribute("href");
    expect(href).toBe("mailto:?subject=Lista%20de%20la%20compra");
    const mailto = new URL(href);
    expect(mailto.protocol).toBe("mailto:");
    expect(mailto.searchParams.get("subject")).toBe("Lista de la compra");
    expect(mailto.searchParams.has("body")).toBe(false);
    await expect(emailLink(page)).not.toHaveAttribute("target", /.+/);
    // y el portapapeles tiene solo los productos pendientes, para pegarlos en el correo
    await expect(copiedFeedback(page)).toHaveText("Lista copiada. Pégala en el correo.");
    const expected = sharedText("- Arroz integral (x2)", "- Pechuga de pollo");
    await expect.poll(() => readClipboard(page)).toBe(expected);

    // y "Copiar y abrir WhatsApp" copia exactamente el mismo texto
    await clearClipboard(page);
    await (await copyAndOpenWhatsapp(page, context)).close();
    await expect.poll(() => readClipboard(page)).toBe(expected);
  });

  test("AC3: al marcar un producto y añadir otro a mano, lo que se copia cambia al momento: sin el comprado y con el manual", async ({
    page,
    request,
  }) => {
    // Dado un menú semanal sin nada comprado, con la pestaña Compra abierta y la lista ya copiada una vez
    await givenWeeklyMenu(request);
    await page.goto("/");
    const lista = await openShoppingTab(page);
    await blockMailto(page);
    await clearClipboard(page);
    await emailLink(page).click();
    await expect
      .poll(() => readClipboard(page))
      .toBe(sharedText("- Arroz integral (x2)", "- Manzana", "- Pechuga de pollo"));
    // (a partir de aquí no se vuelve a pedir la lista al backend)
    const listReloads = [];
    page.on("request", (req) => {
      if (req.method() === "GET" && req.url().endsWith("/shopping-list")) listReloads.push(req.url());
    });

    // Cuando el usuario marca "Pechuga de pollo" como comprada
    const saved = page.waitForResponse(
      (response) => response.request().method() === "PUT" && response.url().endsWith(`/items/${pechugaId}`),
    );
    await lista.getByRole("checkbox", { name: "Pechuga de pollo" }).check();
    expect((await saved).ok()).toBe(true);
    // y añade a mano "Papel de cocina"
    await page.getByRole("textbox", { name: "Añadir producto a la lista" }).fill("Papel de cocina");
    await page.getByRole("button", { name: "Añadir", exact: true }).click();
    await expect(lista.getByRole("listitem").filter({ hasText: "Papel de cocina" })).toBeVisible();
    // y vuelve a copiar la lista
    await clearClipboard(page);
    await emailLink(page).click();

    // Entonces lo copiado deja fuera "Pechuga de pollo" e incluye "Papel de cocina", sin "(xN)"
    await expect
      .poll(() => readClipboard(page))
      .toBe(sharedText("- Arroz integral (x2)", "- Manzana", "- Papel de cocina"));
    await expect(page.getByText("Se copian los 3 productos pendientes")).toBeVisible();
    await expect(progress(page)).toHaveText("1 de 4 comprados");
    // sin recargar la lista
    expect(listReloads).toEqual([]);
  });

  test("AC4: sin productos pendientes no se puede compartir, y al desmarcar uno se vuelve a poder", async ({
    page,
    request,
  }) => {
    // Dado un menú semanal con todos los productos marcados como comprados
    await givenWeeklyMenu(request);
    await markAsBought(request, [arrozId, pechugaId, manzanaId]);

    // Cuando el usuario abre la pestaña Compra
    await page.goto("/");
    const lista = await openShoppingTab(page);
    await expect(progress(page)).toHaveText("3 de 3 comprados");

    // Entonces los dos controles para compartir están desactivados y no hay enlaces
    await expect(page.getByRole("button", { name: "Copiar y abrir WhatsApp", exact: true })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Copiar y abrir correo", exact: true })).toBeDisabled();
    await expect(page.getByRole("link", { name: /^Copiar y abrir/ })).toHaveCount(0);
    // y se avisa de que no hay nada que compartir
    await expect(page.getByText("No hay productos pendientes que compartir")).toBeVisible();

    // Cuando el usuario desmarca "Manzana"
    const saved = page.waitForResponse(
      (response) => response.request().method() === "PUT" && response.url().endsWith(`/items/${manzanaId}`),
    );
    await lista.getByRole("checkbox", { name: "Manzana" }).uncheck();
    expect((await saved).ok()).toBe(true);

    // Entonces se vuelve a poder compartir
    await expect(whatsappLink(page)).toBeVisible();
    await expect(emailLink(page)).toBeVisible();
    await expect(page.getByRole("button", { name: /^Copiar y abrir/ })).toHaveCount(0);
    await expect(page.getByText("Se copia 1 producto pendiente")).toBeVisible();
    await expect(page.getByText("No hay productos pendientes que compartir")).toHaveCount(0);
    // y se copia solo la Manzana
    await blockMailto(page);
    await clearClipboard(page);
    await emailLink(page).click();
    await expect.poll(() => readClipboard(page)).toBe(sharedText("- Manzana"));
  });
});

// HU 5.4 - Añadir productos manuales a la lista de la compra
test.describe("HU 5.4 Añadir productos manuales a la lista de la compra", () => {
  const arrozId = "9017b44e-1d3f-4414-95d9-bac5d28790fc"; // Arroz integral
  const pechugaId = "05756545-04f4-4f3f-8254-6e5d678edc93"; // Pechuga de pollo

  const shoppingListUrl = `${apiUrl}/api/menus/${userId}/shopping-list`;
  const itemsUrl = `${shoppingListUrl}/items`;
  const itemUrl = (itemId) => `${itemsUrl}/${itemId}`;
  const uuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

  // Menú con Arroz integral (2 veces) y Pechuga de pollo (1 vez), sin alérgenos.
  const weeklyMenu = {
    lunes: { desayuno: [arrozId], comida: [pechugaId], cena: [] },
    martes: { desayuno: [arrozId], comida: [], cena: [] },
  };

  // Los tests comparten backend: borra los productos añadidos a mano que hayan quedado.
  async function deleteManualItems(request) {
    const list = await (await request.get(shoppingListUrl)).json();
    for (const item of list.filter((entry) => entry.source === "manual")) {
      const deleted = await request.delete(itemUrl(item.id));
      expect(deleted.status()).toBe(204);
    }
  }

  // Guarda el menú semanal dado, sin productos añadidos a mano y sin nada marcado como comprado.
  async function givenWeeklyMenu(request, days) {
    const menu = await request.put(`${apiUrl}/api/menus/${userId}`, { data: { days } });
    expect(menu.ok()).toBe(true);
    await deleteManualItems(request);
    const list = await (await request.get(shoppingListUrl)).json();
    for (const item of list.filter((entry) => entry.checked)) {
      const reset = await request.put(itemUrl(item.id), { data: { checked: false } });
      expect(reset.ok()).toBe(true);
    }
  }

  // Cada test deja la lista sin los productos manuales que haya creado.
  test.afterEach(async ({ request }) => {
    await deleteManualItems(request);
  });

  async function openShoppingTab(page) {
    await page.getByRole("button", { name: "Compra" }).click();
    await expect(page.getByRole("heading", { name: "Lista de la compra" })).toBeVisible();
    return page.getByRole("list", { name: "Lista de la compra" });
  }

  const addInput = (page) => page.getByRole("textbox", { name: "Añadir producto a la lista" });
  const addButton = (page) => page.getByRole("button", { name: "Añadir", exact: true });
  const progress = (page) => page.getByRole("status").filter({ hasText: "comprados" });
  const itemName = (list, name) => list.getByRole("listitem").filter({ hasText: name }).getByText(name, { exact: true });

  // Espera a que el backend confirme el cambio (la interfaz lo muestra antes, de forma optimista).
  const waitForItemRequest = (page, method, itemId) =>
    page.waitForResponse(
      (response) => response.request().method() === method && response.url().endsWith(`/items/${itemId}`),
    );

  test("AC1: un producto añadido a mano aparece en la lista junto a los alimentos del menú y se conserva al recargar", async ({
    page,
    request,
  }) => {
    // Dado un menú semanal con Arroz integral y Pechuga de pollo
    await givenWeeklyMenu(request, weeklyMenu);
    await page.goto("/");
    let lista = await openShoppingTab(page);
    await expect(lista.getByRole("listitem")).toHaveCount(2);
    await expect(addButton(page)).toBeDisabled();

    // Cuando el usuario escribe "Papel de cocina" y pulsa "Añadir"
    await addInput(page).fill("Papel de cocina");
    await addButton(page).click();

    // Entonces aparece en la lista, ordenado por nombre junto a los alimentos del menú,
    // con la etiqueta "Añadido a mano" en lugar del número de veces
    await expect(lista.getByRole("listitem")).toHaveText([
      /Arroz integral.*2 veces/,
      /Papel de cocina.*Añadido a mano/,
      /Pechuga de pollo.*1 vez/,
    ]);
    await expect(progress(page)).toHaveText("0 de 3 comprados");
    // y el campo se vacía para añadir otro producto
    await expect(addInput(page)).toHaveValue("");
    await expect(addInput(page)).toBeFocused();
    // y solo el producto añadido a mano se puede eliminar desde la lista
    await expect(lista.getByRole("button", { name: "Eliminar Papel de cocina" })).toBeVisible();
    await expect(lista.getByRole("button", { name: /^Eliminar/ })).toHaveCount(1);

    // y se conserva al recargar la página
    await page.reload();
    lista = await openShoppingTab(page);
    await expect(lista.getByRole("listitem").filter({ hasText: "Papel de cocina" })).toContainText("Añadido a mano");

    // y el backend lo devuelve como producto manual
    const list = await (await request.get(shoppingListUrl)).json();
    const papel = list.find((item) => item.name === "Papel de cocina");
    expect(papel).toMatchObject({ foodId: null, count: 1, checked: false, source: "manual" });
    expect(papel.id).toMatch(uuidV4);
    expect(list.find((item) => item.id === arrozId)).toMatchObject({ source: "menu", count: 2 });
  });

  test("AC2: un producto añadido a mano se puede marcar como comprado y eliminar, y no vuelve a aparecer al recargar", async ({
    page,
    request,
  }) => {
    // Dado un menú semanal y un producto añadido a mano, "Bolsas de basura"
    await givenWeeklyMenu(request, weeklyMenu);
    const created = await request.post(itemsUrl, { data: { name: "Bolsas de basura" } });
    expect(created.status()).toBe(201);
    const bolsas = await created.json();
    await page.goto("/");
    let lista = await openShoppingTab(page);
    await expect(progress(page)).toHaveText("0 de 3 comprados");

    // Cuando el usuario lo marca como comprado
    const saved = waitForItemRequest(page, "PUT", bolsas.id);
    await lista.getByRole("checkbox", { name: "Bolsas de basura" }).check();
    expect((await saved).ok()).toBe(true);

    // Entonces aparece tachado y cuenta como comprado
    await expect(lista.getByRole("checkbox", { name: "Bolsas de basura" })).toBeChecked();
    await expect(itemName(lista, "Bolsas de basura")).toHaveCSS("text-decoration-line", "line-through");
    await expect(progress(page)).toHaveText("1 de 3 comprados");

    // Cuando lo elimina con el botón "Eliminar Bolsas de basura"
    const deleted = waitForItemRequest(page, "DELETE", bolsas.id);
    await lista.getByRole("button", { name: "Eliminar Bolsas de basura" }).click();
    expect((await deleted).status()).toBe(204);

    // Entonces desaparece de la lista y el contador solo cuenta los alimentos del menú
    await expect(lista.getByRole("listitem").filter({ hasText: "Bolsas de basura" })).toHaveCount(0);
    await expect(progress(page)).toHaveText("0 de 2 comprados");

    // y sigue sin aparecer al recargar la página
    await page.reload();
    lista = await openShoppingTab(page);
    await expect(lista.getByRole("listitem")).toHaveText([/Arroz integral/, /Pechuga de pollo/]);
    await expect(progress(page)).toHaveText("0 de 2 comprados");

    // y el backend ya no lo devuelve
    const list = await (await request.get(shoppingListUrl)).json();
    expect(list.map((item) => item.name)).toEqual(["Arroz integral", "Pechuga de pollo"]);
  });

  test("AC3: con el menú semanal vacío se puede añadir un producto a mano y la lista muestra solo ese producto", async ({
    page,
    request,
  }) => {
    // Dado un menú semanal vacío y ningún producto añadido a mano
    await givenWeeklyMenu(request, {});
    await page.goto("/");
    const lista = await openShoppingTab(page);
    await expect(page.getByText("No hay alimentos en el menú semanal")).toBeVisible();
    await expect(lista).toHaveCount(0);

    // Cuando el usuario escribe "Detergente" y lo envía con Enter
    await addInput(page).fill("Detergente");
    await addInput(page).press("Enter");

    // Entonces la lista aparece solo con ese producto
    await expect(lista.getByRole("listitem")).toHaveText([/Detergente.*Añadido a mano/]);
    await expect(progress(page)).toHaveText("0 de 1 comprados");
    await expect(page.getByText("El menú semanal está vacío; 1 producto añadido a mano.")).toBeVisible();
    // y deja de mostrarse el mensaje de lista vacía
    await expect(page.getByText("No hay alimentos en el menú semanal")).toHaveCount(0);

    // y el backend devuelve solo ese producto
    const list = await (await request.get(shoppingListUrl)).json();
    expect(list).toEqual([
      expect.objectContaining({ name: "Detergente", foodId: null, source: "manual" }),
    ]);
  });

  test("AC4: la API rechaza con 400 un nombre vacío, con 409 un producto que ya está en la lista (también desde el formulario), con 400 eliminar un alimento del menú y con 404 uno que no está en la lista", async ({
    page,
    request,
  }) => {
    // Dado un menú semanal con Arroz integral y Pechuga de pollo, y "Café molido" añadido a mano
    await givenWeeklyMenu(request, weeklyMenu);
    const cafe = await request.post(itemsUrl, { data: { name: "Café molido" } });
    expect(cafe.status()).toBe(201);

    // Cuando se añade un producto con el nombre vacío, en blanco o de más de 60 caracteres
    for (const name of ["", "   ", "a".repeat(61)]) {
      const invalid = await request.post(itemsUrl, { data: { name } });
      // Entonces se rechaza con 400
      expect(invalid.status()).toBe(400);
      expect(await invalid.json()).toMatchObject({ error: true, code: 400 });
    }

    // Cuando se añade un producto que ya está en la lista con otras mayúsculas o tildes
    // (un alimento del menú o un producto añadido a mano)
    for (const name of ["arroz INTEGRAL", "cafe MOLIDO"]) {
      const duplicated = await request.post(itemsUrl, { data: { name } });
      // Entonces se rechaza con 409
      expect(duplicated.status()).toBe(409);
      expect(await duplicated.json()).toMatchObject({
        error: true,
        code: 409,
        message: "Ese producto ya está en la lista de la compra",
      });
    }

    // Cuando el usuario no existe
    const unknownUser = await request.post(`${apiUrl}/api/menus/${crypto.randomUUID()}/shopping-list/items`, {
      data: { name: "Servilletas" },
    });
    // Entonces se responde 404
    expect(unknownUser.status()).toBe(404);

    // Cuando se intenta eliminar un alimento que viene del menú
    const menuItem = await request.delete(itemUrl(arrozId));
    // Entonces se rechaza con 400
    expect(menuItem.status()).toBe(400);
    expect(await menuItem.json()).toMatchObject({
      error: true,
      code: 400,
      message: "Los productos del menú se quitan desde el menú semanal",
    });

    // Cuando se intenta eliminar un producto que no está en la lista
    const missing = await request.delete(itemUrl(crypto.randomUUID()));
    // Entonces se responde 404
    expect(missing.status()).toBe(404);
    expect(await missing.json()).toMatchObject({
      error: true,
      code: 404,
      message: "El producto no está en la lista de la compra",
    });

    // Cuando el usuario intenta añadir desde el formulario un alimento que ya está en la lista
    await page.goto("/");
    const lista = await openShoppingTab(page);
    await addInput(page).fill("arroz INTEGRAL");
    await addButton(page).click();

    // Entonces se muestra el mensaje de error del backend y el texto se conserva para corregirlo
    await expect(page.getByRole("alert")).toHaveText("Ese producto ya está en la lista de la compra");
    await expect(addInput(page)).toHaveValue("arroz INTEGRAL");

    // y la lista no cambia, ni en la interfaz ni en el backend
    await expect(lista.getByRole("listitem")).toHaveText([/Arroz integral/, /Café molido/, /Pechuga de pollo/]);
    const list = await (await request.get(shoppingListUrl)).json();
    expect(list.map((item) => item.name)).toEqual(["Arroz integral", "Café molido", "Pechuga de pollo"]);
  });
});
