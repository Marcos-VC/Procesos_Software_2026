import { readJson } from "../store/jsonStore.js";
import { findUser, getAllergenCatalog } from "../services/userService.js";
import { normalizeAllergen, normalizeText } from "../utils/text.js";

// GET /api/foods?search=&userId=
// Con userId marca como bloqueados (blocked/blockedBy) los alimentos que contienen
// alérgenos prohibidos por el perfil médico del usuario.
export async function listFoods(request, response) {
  const search = normalizeText(request.query.search ?? "");
  const foods = await readJson("mock_alimentos.json");
  const matches = search
    ? foods.filter((food) => normalizeText(food.name).includes(search))
    : foods;

  if (!request.query.userId) {
    return response.json(matches);
  }

  const user = await findUser(String(request.query.userId));
  const forbidden = user.medicalRestrictions.allergies.map(normalizeAllergen);

  return response.json(
    matches.map((food) => {
      const blockedBy = food.allergens.filter((allergen) => forbidden.includes(allergen));
      return { ...food, blocked: blockedBy.length > 0, blockedBy };
    }),
  );
}

// GET /api/allergens: catálogo de alérgenos (id, nombre, icono y explicación).
export async function listAllergens(_request, response) {
  response.json(await getAllergenCatalog());
}
