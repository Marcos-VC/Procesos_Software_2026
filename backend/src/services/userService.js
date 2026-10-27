import { HttpError } from "../errors.js";
import { readJson, updateJson } from "../store/jsonStore.js";

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

export const VALID_DIET_TYPES = [
  "omnivore",
  "vegetarian",
  "vegan",
  "pescatarian",
  "keto",
];

const isPlainObject = (value) =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Normaliza y valida un tipo de dieta / preferencia dietética.
 */
function parseDietType(dietType) {
  if (typeof dietType !== "string") {
    throw new HttpError(400, "dietType debe ser un string");
  }
  const normalized = dietType.trim().toLowerCase();
  if (!VALID_DIET_TYPES.includes(normalized)) {
    throw new HttpError(
      400,
      `Tipo de dieta no válido: "${dietType}". Tipos válidos: ${VALID_DIET_TYPES.join(", ")}`
    );
  }
  return normalized;
}

/**
 * Valida el cuerpo de PUT /nutritional-profile. Admite cambios parciales:
 * { caloricGoal, dietType, medicalRestrictions: { dietType } }.
 */
function parseProfileChanges(body) {
  if (!isPlainObject(body)) {
    throw new HttpError(400, "El cuerpo debe ser un objeto JSON");
  }

  const changes = {};

  if (body.caloricGoal !== undefined) {
    const goal = body.caloricGoal;
    if (!Number.isInteger(goal) || goal < 500 || goal > 10000) {
      throw new HttpError(400, "caloricGoal debe ser un entero entre 500 y 10000");
    }
    changes.caloricGoal = goal;
  }

  const rawDiet = body.dietType ?? body.medicalRestrictions?.dietType;
  if (rawDiet !== undefined) {
    changes.dietType = parseDietType(rawDiet);
  }

  if (Object.keys(changes).length === 0) {
    throw new HttpError(400, "No hay ningún campo válido que actualizar");
  }

  return changes;
}

export async function updateNutritionalProfile(userId, body) {
  const changes = parseProfileChanges(body);

  return updateJson(USERS_FILE, (users) => {
    const user = users.find((item) => item.userId === userId);
    if (!user) {
      throw new HttpError(404, "Usuario no encontrado");
    }
    if (changes.caloricGoal !== undefined) {
      user.caloricGoal = changes.caloricGoal;
    }
    if (changes.dietType !== undefined) {
      user.medicalRestrictions = {
        ...user.medicalRestrictions,
        dietType: changes.dietType,
      };
    }
    return user;
  });
}

/**
 * Actualiza la preferencia dietética (HU 2.3).
 * Admite tanto un string directo ("vegan") como un objeto ({ dietType: "vegan" }).
 */
export async function updateDietType(userId, dietTypeInput) {
  const rawDiet =
    typeof dietTypeInput === "object" && dietTypeInput !== null
      ? dietTypeInput.dietType
      : dietTypeInput;
  const dietType = parseDietType(rawDiet);

  return updateJson(USERS_FILE, (users) => {
    const user = users.find((item) => item.userId === userId);
    if (!user) {
      throw new HttpError(404, "Usuario no encontrado");
    }
    user.medicalRestrictions = {
      ...user.medicalRestrictions,
      dietType,
    };
    return user;
  });
}
