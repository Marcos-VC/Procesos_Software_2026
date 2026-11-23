import {
  addManualShoppingItem,
  deleteManualShoppingItem,
  getShoppingList,
  setShoppingItemChecked,
} from "../services/shoppingService.js";

// GET /api/menus/:userId/shopping-list
export async function getShoppingListHandler(request, response) {
  response.json(await getShoppingList(request.params.userId));
}

// POST /api/menus/:userId/shopping-list/items  { name } (HU 5.4): añade un producto a mano.
export async function postShoppingItemHandler(request, response) {
  response.status(201).json(await addManualShoppingItem(request.params.userId, request.body?.name));
}

// PUT /api/menus/:userId/shopping-list/items/:itemId  { checked: true | false } (HU 5.2)
export async function putShoppingItemHandler(request, response) {
  const { userId, itemId } = request.params;
  response.json(await setShoppingItemChecked(userId, itemId, request.body?.checked));
}

// DELETE /api/menus/:userId/shopping-list/items/:itemId (HU 5.4): quita un producto añadido a mano.
export async function deleteShoppingItemHandler(request, response) {
  const { userId, itemId } = request.params;
  await deleteManualShoppingItem(userId, itemId);
  response.status(204).end();
}
