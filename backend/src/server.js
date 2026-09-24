import cors from "cors";
import express from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const port = process.env.PORT || 3000;
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const mockUsersPath = path.resolve(
  currentDirectory,
  "../../mocks/mock_usuarios.json",
);

const foods = [
  {
    id: "food-001",
    name: "Arroz integral",
    calories: 111,
    protein: 2.6,
    carbohydrates: 23,
    fat: 0.9,
    allergens: [],
  },
  {
    id: "food-002",
    name: "Pechuga de pollo",
    calories: 165,
    protein: 31,
    carbohydrates: 0,
    fat: 3.6,
    allergens: [],
  },
  {
    id: "food-003",
    name: "Pan de trigo",
    calories: 265,
    protein: 9,
    carbohydrates: 49,
    fat: 3.2,
    allergens: ["gluten"],
  },
  {
    id: "food-004",
    name: "Crema de cacahuete",
    calories: 588,
    protein: 25,
    carbohydrates: 20,
    fat: 50,
    allergens: ["cacahuetes"],
  },
];

app.use(cors());
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", service: "healthy-life-e6-backend" });
});

app.get("/api/foods", (request, response) => {
  const search = String(request.query.search || "")
    .trim()
    .toLowerCase();
  const result = search
    ? foods.filter((food) => food.name.toLowerCase().includes(search))
    : foods;

  response.json(result);
});

app.get("/api/users/:userId", async (request, response) => {
  try {
    const mockUsers = JSON.parse(await fs.readFile(mockUsersPath, "utf8"));
    const user = mockUsers.find(
      (item) => item.userId === request.params.userId,
    );

    if (!user) {
      return response.status(404).json({ error: "Usuario no encontrado" });
    }

    return response.json(user);
  } catch (error) {
    return response
      .status(500)
      .json({
        error: "No se pudo cargar el mock de usuarios",
        detail: error.message,
      });
  }
});

app.listen(port, () => {
  console.log(`Healthy Life E6 backend escuchando en http://localhost:${port}`);
});
