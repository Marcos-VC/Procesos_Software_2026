import { Router } from "express";
import { getNutritionalProfile } from "../controllers/userController.js";

const router = Router();

router.get("/users/:userId/nutritional-profile", getNutritionalProfile);

export default router;
