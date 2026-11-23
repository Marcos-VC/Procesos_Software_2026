import { randomUUID } from "node:crypto";
import { HttpError } from "../errors.js";
import { readJson, updateJson } from "../store/jsonStore.js";
import { normalizeText } from "../utils/text.js";
import { getMenu } from "./menuService.js";

// Estado de la lista de la compra de cada usuario: una entrada por usuario,
// { userId, checked: [itemId], manualItems: [{ id, name }] }.
// - checked (HU 5.2): ids marcados como comprados; los que ya no están en la lista se ignoran al leer.
// - manualItems (HU 5.4): productos añadidos a mano, que no salen del menú semanal.
const SHOPPING_LISTS_FILE = "mock_shopping_lists.json";

// Longitud máxima del nombre de un producto añadido a mano (HU 5.4).
const MAX_MANUAL_NAME_LENGTH = 60;

/**
 * Agrupa los alimentos del menú semanal del usuario por id y cuenta cuántas veces aparecen.
 * En los alimentos del menú, `id` coincide con `foodId`.
 *
 * @param {string} userId
 * @returns {Promise<Array<{ id: string, foodId: string, name: string, count: number }>>}
 */
async function getMenuItems(userId) {
  const menu = await getMenu(userId);
  const foods = await readJson("mock_alimentos.json");
  const foodsById = new Map(foods.map((food) => [food.id, food]));

  /** @type {Map<string, { id: string, foodId: string, name: string, count: number }>} */
  const counts = new Map();

  for (const day of Object.values(menu.days)) {
    for (const mealFoods of Object.values(day)) {
      for (const foodId of mealFoods) {
        if (counts.has(foodId)) {
          counts.get(foodId).count += 1;
        } else {
          const food = foodsById.get(foodId);
          const name = food ? food.name : foodId;
          counts.set(foodId, { id: foodId, foodId, name, count: 1 });
        }
      }
    }
  }

  return [...counts.values()];
}

// Entrada del usuario en mock_shopping_lists.json, o una vacía si aún no ha marcado ni añadido nada.
// Las entradas anteriores a la HU 5.4 no tienen manualItems.
async function readUserEntry(userId) {
  const lists = await readJson(SHOPPING_LISTS_FILE);
  const entry = lists.find((item) => item.userId === userId);
  return {
    userId,
    checked: entry?.checked ?? [],
    manualItems: entry?.manualItems ?? [],
  };
}

// Dentro de updateJson: busca la entrada del usuario y la crea si no existe.
function findOrCreateUserEntry(lists, userId) {
  let entry = lists.find((item) => item.userId === userId);
  if (!entry) {
    entry = { userId, checked: [], manualItems: [] };
    lists.push(entry);
  }
  entry.checked ??= [];
  entry.manualItems ??= [];
  return entry;
}

// Producto añadido a mano (HU 5.4) con la misma forma que los alimentos del menú.
function toManualListItem({ id, name }, checked) {
  return { id, foodId: null, name, count: 1, checked, source: "manual" };
}

/**
 * Genera la lista de la compra a partir del menú semanal del usuario (HU 5.1) junto con
 * los productos añadidos a mano (HU 5.4), todo ordenado por nombre, con el estado
 * marcado/tachado de cada producto (HU 5.2). `source` indica de dónde viene cada producto.
 *
 * @param {string} userId
 * @returns {Promise<Array<{ id: string, foodId: string | null, name: string, count: number, checked: boolean, source: "menu" | "manual" }>>}
 */
export async function getShoppingList(userId) {
  const menuItems = await getMenuItems(userId);
  const entry = await readUserEntry(userId);
  const checked = new Set(entry.checked);

  const items = [
    ...menuItems.map((item) => ({ ...item, checked: checked.has(item.id), source: "menu" })),
    ...entry.manualItems.map((item) => toManualListItem(item, checked.has(item.id))),
  ];

  return items.sort((a, b) => a.name.localeCompare(b.name, "es"));
}

/**
 * Marca o desmarca un producto de la lista de la compra como comprado (HU 5.2).
 * Sirve tanto para los alimentos del menú como para los productos añadidos a mano.
 * Devuelve el producto actualizado.
 *
 * @param {string} userId
 * @param {string} itemId
 * @param {unknown} checked
 */
export async function setShoppingItemChecked(userId, itemId, checked) {
  if (typeof checked !== "boolean") {
    throw new HttpError(400, "checked debe ser un booleano (true o false)");
  }

  const item = (await getShoppingList(userId)).find((entry) => entry.id === itemId);
  if (!item) {
    throw new HttpError(404, "El producto no está en la lista de la compra");
  }

  await updateJson(SHOPPING_LISTS_FILE, (lists) => {
    const entry = findOrCreateUserEntry(lists, userId);
    const others = entry.checked.filter((id) => id !== itemId);
    entry.checked = checked ? [...others, itemId] : others;
  });

  return { ...item, checked };
}

/**
 * Añade a la lista de la compra un producto que no sale del menú semanal (HU 5.4),
 * p. ej. "Papel de cocina". Rechaza nombres vacíos, demasiado largos o que ya estén
 * en la lista (sin distinguir mayúsculas ni tildes). Devuelve el producto creado.
 *
 * @param {string} userId
 * @param {unknown} name
 */
export async function addManualShoppingItem(userId, name) {
  // También comprueba que el usuario existe (404).
  const menuItems = await getMenuItems(userId);

  const trimmedName = typeof name === "string" ? name.trim() : "";
  if (!trimmedName) {
    throw new HttpError(400, "El nombre del producto es obligatorio");
  }
  if (trimmedName.length > MAX_MANUAL_NAME_LENGTH) {
    throw new HttpError(
      400,
      `El nombre del producto no puede superar los ${MAX_MANUAL_NAME_LENGTH} caracteres`,
    );
  }

  const normalizedName = normalizeText(trimmedName);
  const menuNames = new Set(menuItems.map((item) => normalizeText(item.name)));

  return updateJson(SHOPPING_LISTS_FILE, (lists) => {
    const entry = findOrCreateUserEntry(lists, userId);
    const duplicated =
      menuNames.has(normalizedName) ||
      entry.manualItems.some((item) => normalizeText(item.name) === normalizedName);
    if (duplicated) {
      throw new HttpError(409, "Ese producto ya está en la lista de la compra");
    }

    const manualItem = { id: randomUUID(), name: trimmedName };
    entry.manualItems.push(manualItem);
    return toManualListItem(manualItem, false);
  });
}

/**
 * Quita de la lista de la compra un producto añadido a mano (HU 5.4), junto con su marca
 * de comprado. Los alimentos del menú no se pueden quitar aquí: salen del menú semanal.
 *
 * @param {string} userId
 * @param {string} itemId
 */
export async function deleteManualShoppingItem(userId, itemId) {
  const item = (await getShoppingList(userId)).find((entry) => entry.id === itemId);
  if (!item) {
    throw new HttpError(404, "El producto no está en la lista de la compra");
  }
  if (item.source === "menu") {
    throw new HttpError(400, "Los productos del menú se quitan desde el menú semanal");
  }

  await updateJson(SHOPPING_LISTS_FILE, (lists) => {
    const entry = findOrCreateUserEntry(lists, userId);
    entry.manualItems = entry.manualItems.filter((manualItem) => manualItem.id !== itemId);
    entry.checked = entry.checked.filter((id) => id !== itemId);
  });
}
