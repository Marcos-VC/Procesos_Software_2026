import { HttpError } from "../errors.js";
import { readJson, updateJson } from "../store/jsonStore.js";
import { normalizeAllergen } from "../utils/text.js";

const USERS_FILE = "mock_usuarios.json";
const ALLERGENS_FILE = "mock_alergenos.json";

export async function findUser(userId) {
  const users = await readJson(USERS_FILE);
  const user = users.find((item) => item.userId === userId);
  if (!user) {
    throw new HttpError(404, "Usuario no encontrado");
  }
  return user;
}

export function getAllergenCatalog() {
  return readJson(ALLERGENS_FILE);
}

const isPlainObject = (value) =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Valida el cuerpo de PUT /nutritional-profile. Admite cambios parciales con la
 * misma forma que el perfil: { weight, caloricGoal, medicalRestrictions: { allergies, dietType } }.
 */
async function parseProfileChanges(body) {
  if (!isPlainObject(body)) {
    throw new HttpError(400, "El cuerpo debe ser un objeto JSON");
  }

  const changes = {};

  if (body.weight !== undefined) {
    if (typeof body.weight !== "number" || !(body.weight > 0)) {
      throw new HttpError(400, "weight debe ser un número mayor que 0");
    }
    changes.weight = body.weight;
  }

  if (body.caloricGoal !== undefined) {
    const goal = body.caloricGoal;
    if (!Number.isInteger(goal) || goal < 500 || goal > 10000) {
      throw new HttpError(400, "caloricGoal debe ser un entero entre 500 y 10000");
    }
    changes.caloricGoal = goal;
  }

  if (body.medicalRestrictions !== undefined) {
    const restrictions = body.medicalRestrictions;
    if (!isPlainObject(restrictions)) {
      throw new HttpError(400, "medicalRestrictions debe ser un objeto");
    }
    changes.medicalRestrictions = {};

    if (restrictions.allergies !== undefined) {
      if (
        !Array.isArray(restrictions.allergies) ||
        restrictions.allergies.some((item) => typeof item !== "string")
      ) {
        throw new HttpError(400, "allergies debe ser un array de strings");
      }
      const known = new Set((await getAllergenCatalog()).map((item) => item.id));
      const allergies = [...new Set(restrictions.allergies.map(normalizeAllergen))];
      const unknown = allergies.find((item) => !known.has(item));
      if (unknown) {
        throw new HttpError(400, `Alérgeno no reconocido: ${unknown}`);
      }
      changes.medicalRestrictions.allergies = allergies;
    }

    if (restrictions.dietType !== undefined) {
      if (typeof restrictions.dietType !== "string" || !restrictions.dietType.trim()) {
        throw new HttpError(400, "dietType debe ser un texto no vacío");
      }
      changes.medicalRestrictions.dietType = restrictions.dietType.trim();
    }
  }

  const { medicalRestrictions = {}, ...topLevel } = changes;
  if (Object.keys(topLevel).length + Object.keys(medicalRestrictions).length === 0) {
    throw new HttpError(400, "No hay ningún campo válido que actualizar");
  }

  return changes;
}

export async function updateNutritionalProfile(userId, body) {
  const changes = await parseProfileChanges(body);

  return updateJson(USERS_FILE, (users) => {
    const user = users.find((item) => item.userId === userId);
    if (!user) {
      throw new HttpError(404, "Usuario no encontrado");
    }
    const { medicalRestrictions, ...topLevel } = changes;
    Object.assign(user, topLevel);
    Object.assign(user.medicalRestrictions, medicalRestrictions);
    return user;
  });
}
