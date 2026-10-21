import { Router } from "express";
import {
  getFavoriteMenus,
  getUserMenu,
  postFavoriteMenu,
  putUserMenu,
} from "../controllers/menuController.js";

const router = Router();

// Rutas literales antes de /menus/:userId, para que "favorites" no se confunda con un userId.
router.get("/menus/favorites", getFavoriteMenus);
router.post("/menus/favorites", postFavoriteMenu);

router.get("/menus/:userId", getUserMenu);
router.put("/menus/:userId", putUserMenu);

export default router;
