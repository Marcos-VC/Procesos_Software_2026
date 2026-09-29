import { findUser } from "../services/userService.js";

// GET /api/users/:userId/nutritional-profile (contrato con E1, mockeado)
export async function getNutritionalProfile(request, response) {
  response.json(await findUser(request.params.userId));
}
