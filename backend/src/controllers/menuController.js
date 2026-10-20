import { createFavorite, getMenu, listFavorites, saveMenu } from "../services/menuService.js";

// GET /api/menus/:userId: menú del usuario (vacío si aún no ha guardado ninguno).
export async function getUserMenu(request, response) {
  response.json(await getMenu(request.params.userId));
}

// PUT /api/menus/:userId  { days: { lunes: { desayuno: [foodId], comida: [], cena: [] }, ... } }
export async function putUserMenu(request, response) {
  response.json(await saveMenu(request.params.userId, request.body?.days));
}

// GET /api/menus/favorites?userId=: menús favoritos guardados por el usuario (HU 3.3).
export async function getFavoriteMenus(request, response) {
  response.json(await listFavorites(String(request.query.userId ?? "")));
}

// POST /api/menus/favorites { userId, name, days }: guarda un menú completo bajo un nombre (HU 3.3).
export async function postFavoriteMenu(request, response) {
  const { userId, name, days } = request.body ?? {};
  response.json(await createFavorite(userId, name, days));
}
