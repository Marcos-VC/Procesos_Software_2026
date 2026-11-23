import { Router } from "express";
import {
  getFavoriteMenus,
  getUserMenu,
  postFavoriteMenu,
  putUserMenu,
} from "../controllers/menuController.js";
import {
  deleteShoppingItemHandler,
  getShoppingListHandler,
  postShoppingItemHandler,
  putShoppingItemHandler,
} from "../controllers/shoppingController.js";

const router = Router();

// Rutas literales antes de /menus/:userId, para que "favorites" no se confunda con un userId.
router.get("/menus/favorites", getFavoriteMenus);
router.post("/menus/favorites", postFavoriteMenu);

// HU 5.1: lista de la compra generada a partir del menú semanal del usuario.
router.get("/menus/:userId/shopping-list", getShoppingListHandler);
// HU 5.2: marcar/desmarcar un producto de la lista como comprado.
router.put("/menus/:userId/shopping-list/items/:itemId", putShoppingItemHandler);
// HU 5.4: añadir y quitar productos a mano (que no salen del menú).
router.post("/menus/:userId/shopping-list/items", postShoppingItemHandler);
router.delete("/menus/:userId/shopping-list/items/:itemId", deleteShoppingItemHandler);

router.get("/menus/:userId", getUserMenu);
router.put("/menus/:userId", putUserMenu);

export default router;
