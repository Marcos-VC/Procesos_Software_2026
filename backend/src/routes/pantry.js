import { Router } from "express";
import {
  deletePantryItem,
  getUserPantry,
  postPantryItem,
  putPantryItem,
} from "../controllers/pantryController.js";

const router = Router();

router.get("/pantry/:userId", getUserPantry);
router.post("/pantry/:userId", postPantryItem);
router.put("/pantry/:userId/:itemId", putPantryItem);
router.delete("/pantry/:userId/:itemId", deletePantryItem);

export default router;

