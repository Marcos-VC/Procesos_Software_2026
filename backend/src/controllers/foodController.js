import { listAllergens as getAllergens, searchFoods } from "../services/foodService.js";

// GET /api/foods?search=&userId=
export async function listFoods(request, response) {
  const { search, userId } = request.query;
  response.json(await searchFoods(search, userId ? String(userId) : undefined));
}

// GET /api/allergens: catálogo de alérgenos (id, nombre, icono y explicación).
export async function listAllergens(_request, response) {
  response.json(await getAllergens());
}
