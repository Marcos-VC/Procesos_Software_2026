import { readJson } from "../store/jsonStore.js";
import { findUser } from "../services/userService.js";

const round = (value) => Math.round(value * 10) / 10;

// GET /api/nutrition/:userId/daily-summary (contrato con E2/E5)
// Suma calorías y macros de lo consumido hoy (mock_consumo.json, gramos por alimento).
export async function getDailySummary(request, response) {
  const { userId } = await findUser(request.params.userId);
  const foods = await readJson("mock_alimentos.json");
  const consumption = (await readJson("mock_consumo.json")).find(
    (item) => item.userId === userId,
  );

  const totals = { calories: 0, protein: 0, carbs: 0, fats: 0 };
  for (const { foodId, grams } of consumption?.consumedToday ?? []) {
    const food = foods.find((item) => item.id === foodId);
    if (!food) continue;
    const factor = grams / 100;
    totals.calories += food.calories * factor;
    totals.protein += food.protein * factor;
    totals.carbs += food.carbohydrates * factor;
    totals.fats += food.fat * factor;
  }

  response.json({
    userId,
    date: new Date().toISOString().slice(0, 10),
    totalCaloriesConsumed: round(totals.calories),
    macros: {
      protein: round(totals.protein),
      carbs: round(totals.carbs),
      fats: round(totals.fats),
    },
  });
}
