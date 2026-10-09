import { readJson } from "../store/jsonStore.js";
import { normalizeAllergen, normalizeText } from "../utils/text.js";
import { findUser, getAllergenCatalog } from "./userService.js";

/**
 * Busca alimentos por nombre (sin distinguir mayúsculas ni tildes). Con userId marca
 * como bloqueados (blocked/blockedBy) los que contienen alérgenos prohibidos por el
 * perfil médico del usuario.
 */
export async function searchFoods(search = "", userId) {
  const term = normalizeText(search);
  const foods = await readJson("mock_alimentos.json");
  const matches = term ? foods.filter((food) => normalizeText(food.name).includes(term)) : foods;

  if (!userId) {
    return matches;
  }

  const user = await findUser(userId);
  const forbidden = user.medicalRestrictions.allergies.map(normalizeAllergen);

  return matches.map((food) => {
    const blockedBy = food.allergens.filter((allergen) => forbidden.includes(allergen));
    return { ...food, blocked: blockedBy.length > 0, blockedBy };
  });
}

export function listAllergens() {
  return getAllergenCatalog();
}
