import { Router } from "express";
import { addFood, listAllergens, listFoods } from "../controllers/foodController.js";

const router = Router();

router.get("/foods", listFoods);
router.post("/foods", addFood);
router.get("/allergens", listAllergens);

export default router;
