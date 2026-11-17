import { getShoppingList } from "../services/shoppingService.js";

// GET /api/menus/:userId/shopping-list
export async function getShoppingListHandler(request, response) {
  response.json(await getShoppingList(request.params.userId));
}
