import { readJson } from "../store/jsonStore.js";
import { normalizeText } from "../utils/text.js";
import { getAllergenCatalog } from "./userService.js";

// Busca alimentos por nombre (sin distinguir mayúsculas ni tildes).
export async function searchFoods(search = "") {
  const term = normalizeText(search);
  const foods = await readJson("mock_alimentos.json");
  return term ? foods.filter((food) => normalizeText(food.name).includes(term)) : foods;
}

export function listAllergens() {
  return getAllergenCatalog();
}
