import { readJson } from "../store/jsonStore.js";
import { findUser } from "./userService.js";

const round = (value) => Math.round(value * 10) / 10;

/**
 * Resumen diario (contrato con E2/E5): suma calorías y macros de lo consumido hoy
 * (mock_consumo.json, gramos por alimento).
 */
export async function getDailySummary(userId) {
  const user = await findUser(userId);
  const foods = await readJson("mock_alimentos.json");
  const consumption = (await readJson("mock_consumo.json")).find(
    (item) => item.userId === user.userId,
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

  return {
    userId: user.userId,
    date: new Date().toISOString().slice(0, 10),
    totalCaloriesConsumed: round(totals.calories),
    macros: {
      protein: round(totals.protein),
      carbs: round(totals.carbs),
      fats: round(totals.fats),
    },
  };
}
