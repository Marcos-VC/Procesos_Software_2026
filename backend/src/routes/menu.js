import { Router } from "express";
import {
  getFavoriteMenus,
  getUserMenu,
  postFavoriteMenu,
  putUserMenu,
} from "../controllers/menuController.js";
import { getShoppingListHandler, putShoppingItemHandler } from "../controllers/shoppingController.js";

const router = Router();

// Rutas literales antes de /menus/:userId, para que "favorites" no se confunda con un userId.
router.get("/menus/favorites", getFavoriteMenus);
router.post("/menus/favorites", postFavoriteMenu);

// HU 5.1: lista de la compra generada a partir del menú semanal del usuario.
router.get("/menus/:userId/shopping-list", getShoppingListHandler);
// HU 5.2: marcar/desmarcar un producto de la lista como comprado.
router.put("/menus/:userId/shopping-list/items/:itemId", putShoppingItemHandler);

router.get("/menus/:userId", getUserMenu);
router.put("/menus/:userId", putUserMenu);

export default router;
