import cors from "cors";
import express from "express";
import { errorHandler, notFoundHandler } from "./errors.js";
import foodRoutes from "./routes/food.js";
import menuRoutes from "./routes/menu.js";
import nutritionRoutes from "./routes/nutrition.js";
import userRoutes from "./routes/user.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", service: "healthy-life-e6-backend" });
});

// Express 5 propaga los errores de handlers async a errorHandler.
app.use("/api", foodRoutes, userRoutes, nutritionRoutes, menuRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
