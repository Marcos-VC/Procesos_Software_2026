import { Router } from "express";
import {
  getNutritionalProfile,
  putNutritionalProfile,
} from "../controllers/userController.js";

const router = Router();

router.get("/users/:userId/nutritional-profile", getNutritionalProfile);
router.put("/users/:userId/nutritional-profile", putNutritionalProfile);

export default router;
