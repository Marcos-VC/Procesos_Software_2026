import { readJson } from "../store/jsonStore.js";
import { getMenu } from "./menuService.js";

/**
 * Genera la lista de la compra a partir del menú semanal del usuario.
 * Recorre todos los días y comidas, agrupa los alimentos por id
 * y devuelve un array ordenado por nombre con el nº de veces que aparece.
 *
 * @param {string} userId
 * @returns {Promise<Array<{ foodId: string, name: string, count: number }>>}
 */
export async function getShoppingList(userId) {
  const menu = await getMenu(userId);
  const foods = await readJson("mock_alimentos.json");
  const foodsById = new Map(foods.map((food) => [food.id, food]));

  /** @type {Map<string, { foodId: string, name: string, count: number }>} */
  const counts = new Map();

  for (const day of Object.values(menu.days)) {
    for (const mealFoods of Object.values(day)) {
      for (const foodId of mealFoods) {
        if (counts.has(foodId)) {
          counts.get(foodId).count += 1;
        } else {
          const food = foodsById.get(foodId);
          const name = food ? food.name : foodId;
          counts.set(foodId, { foodId, name, count: 1 });
        }
      }
    }
  }

  return [...counts.values()].sort((a, b) => a.name.localeCompare(b.name, "es"));
}
