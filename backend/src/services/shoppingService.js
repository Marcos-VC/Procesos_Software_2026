import { HttpError } from "../errors.js";
import { readJson, updateJson } from "../store/jsonStore.js";
import { getMenu } from "./menuService.js";

// Estado de la lista de la compra de cada usuario (HU 5.2): una entrada por usuario,
// { userId, checked: [itemId] }. Los ids marcados que ya no están en la lista se ignoran al leer.
const SHOPPING_LISTS_FILE = "mock_shopping_lists.json";

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

// Entrada del usuario en mock_shopping_lists.json, o una vacía si aún no ha marcado nada.
async function readUserEntry(userId) {
  const lists = await readJson(SHOPPING_LISTS_FILE);
  return lists.find((entry) => entry.userId === userId) ?? { userId, checked: [] };
}

// Dentro de updateJson: busca la entrada del usuario y la crea si no existe.
function findOrCreateUserEntry(lists, userId) {
  let entry = lists.find((item) => item.userId === userId);
  if (!entry) {
    entry = { userId, checked: [] };
    lists.push(entry);
  }
  entry.checked ??= [];
  return entry;
}

/**
 * Genera la lista de la compra a partir del menú semanal del usuario (HU 5.1),
 * ordenada por nombre, con el estado marcado/tachado de cada producto (HU 5.2).
 *
 * @param {string} userId
 * @returns {Promise<Array<{ id: string, foodId: string, name: string, count: number, checked: boolean }>>}
 */
export async function getShoppingList(userId) {
  const items = await getMenuItems(userId);
  const checked = new Set((await readUserEntry(userId)).checked ?? []);

  return items
    .map((item) => ({ ...item, checked: checked.has(item.id) }))
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}

/**
 * Marca o desmarca un producto de la lista de la compra como comprado (HU 5.2).
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
