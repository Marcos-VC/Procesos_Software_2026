import { getShoppingList, setShoppingItemChecked } from "../services/shoppingService.js";

// GET /api/menus/:userId/shopping-list
export async function getShoppingListHandler(request, response) {
  response.json(await getShoppingList(request.params.userId));
}

// PUT /api/menus/:userId/shopping-list/items/:itemId  { checked: true | false } (HU 5.2)
export async function putShoppingItemHandler(request, response) {
  const { userId, itemId } = request.params;
  response.json(await setShoppingItemChecked(userId, itemId, request.body?.checked));
}
