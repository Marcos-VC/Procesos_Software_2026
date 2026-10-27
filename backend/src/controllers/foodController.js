import {
  createFood,
  listAllergens as getAllergens,
  searchFoods,
} from "../services/foodService.js";

// GET /api/foods?search=
export async function listFoods(request, response) {
  response.json(await searchFoods(request.query.search));
}

// GET /api/allergens: catálogo de alérgenos (id, nombre, icono y explicación).
export async function listAllergens(_request, response) {
  response.json(await getAllergens());
}

export async function addFood(request, response) {
  response.status(201).json(await createFood(request.body));
}
