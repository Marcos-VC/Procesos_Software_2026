import { Router } from "express";
import { listFoods } from "../controllers/foodController.js";

const router = Router();

router.get("/foods", listFoods);

export default router;
