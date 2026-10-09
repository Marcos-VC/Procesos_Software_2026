import { getDailySummary as buildDailySummary } from "../services/nutritionService.js";

// GET /api/nutrition/:userId/daily-summary (contrato con E2/E5)
export async function getDailySummary(request, response) {
  response.json(await buildDailySummary(request.params.userId));
}
