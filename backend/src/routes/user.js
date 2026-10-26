import { Router } from "express";
import {
  getNutritionalProfile,
  putAllergies,
  putNutritionalProfile,
} from "../controllers/userController.js";

const router = Router();

router.get("/users/:userId/nutritional-profile", getNutritionalProfile);
router.put("/users/:userId/nutritional-profile", putNutritionalProfile);
router.put("/users/:userId/allergies", putAllergies);

export default router;
