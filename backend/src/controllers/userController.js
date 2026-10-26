import { findUser, updateAllergies, updateNutritionalProfile } from "../services/userService.js";

// GET /api/users/:userId/nutritional-profile (contrato con E1, mockeado)
export async function getNutritionalProfile(request, response) {
  response.json(await findUser(request.params.userId));
}

// PUT /api/users/:userId/nutritional-profile: actualiza alergias, objetivo calórico...
export async function putNutritionalProfile(request, response) {
  response.json(await updateNutritionalProfile(request.params.userId, request.body));
}

// PUT /api/users/:userId/allergies: recibe un array de ids de alérgenos y sustituye las alergias del usuario (HU 2.2).
export async function putAllergies(request, response) {
  response.json(await updateAllergies(request.params.userId, request.body));
}
