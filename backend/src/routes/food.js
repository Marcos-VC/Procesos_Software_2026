import { Router } from "express";
import { listAllergens, listFoods } from "../controllers/foodController.js";

const router = Router();

router.get("/foods", listFoods);
router.get("/allergens", listAllergens);

export default router;
