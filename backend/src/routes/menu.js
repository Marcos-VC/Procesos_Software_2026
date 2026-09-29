import { Router } from "express";
import { getUserMenu, putUserMenu } from "../controllers/menuController.js";

const router = Router();

router.get("/menus/:userId", getUserMenu);
router.put("/menus/:userId", putUserMenu);

export default router;
