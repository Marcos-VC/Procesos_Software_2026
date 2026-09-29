import { getMenu, saveMenu } from "../services/menuService.js";

// GET /api/menus/:userId: menú del usuario (vacío si aún no ha guardado ninguno).
export async function getUserMenu(request, response) {
  response.json(await getMenu(request.params.userId));
}

// PUT /api/menus/:userId  { days: { lunes: { desayuno: [foodId], comida: [], cena: [] }, ... } }
export async function putUserMenu(request, response) {
  response.json(await saveMenu(request.params.userId, request.body?.days));
}
