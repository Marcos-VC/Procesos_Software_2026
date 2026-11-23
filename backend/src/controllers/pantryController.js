import {
  addPantryItem,
  getPantry,
  removePantryItem,
  updatePantryItem,
} from "../services/pantryService.js";

// GET /api/pantry/:userId: listado de existencias de la despensa virtual (HU 4.1).
export async function getUserPantry(request, response) {
  response.json(await getPantry(request.params.userId));
}

// POST /api/pantry/:userId { name, quantity?, unit }: añade o suma un producto al inventario (HU 4.1).
export async function postPantryItem(request, response) {
  response.status(201).json(await addPantryItem(request.params.userId, request.body));
}

// PUT /api/pantry/:userId/:itemId { quantity, unit? }: actualiza las existencias de un producto (HU 4.1).
export async function putPantryItem(request, response) {
  const { userId, itemId } = request.params;
  response.json(await updatePantryItem(userId, itemId, request.body));
}

// DELETE /api/pantry/:userId/:itemId: elimina un producto de la despensa (HU 4.1).
export async function deletePantryItem(request, response) {
  const { userId, itemId } = request.params;
  response.json(await removePantryItem(userId, itemId));
}

