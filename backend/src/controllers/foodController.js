import { readJson } from "../store/jsonStore.js";
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
