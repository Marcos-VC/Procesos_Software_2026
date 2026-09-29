import { readJson } from "../store/jsonStore.js";
import { getAllergenCatalog } from "../services/userService.js";
import { normalizeText } from "../utils/text.js";

// GET /api/foods?search=
export async function listFoods(request, response) {
  const search = normalizeText(request.query.search ?? "");
  const foods = await readJson("mock_alimentos.json");
  const matches = search
    ? foods.filter((food) => normalizeText(food.name).includes(search))
    : foods;

  return response.json(matches);
}

// GET /api/allergens: catálogo de alérgenos (id, nombre, icono y explicación).
export async function listAllergens(_request, response) {
  response.json(await getAllergenCatalog());
}
