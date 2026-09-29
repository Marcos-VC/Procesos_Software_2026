import { Router } from "express";
import { getDailySummary } from "../controllers/nutritionController.js";

const router = Router();

router.get("/nutrition/:userId/daily-summary", getDailySummary);

export default router;
