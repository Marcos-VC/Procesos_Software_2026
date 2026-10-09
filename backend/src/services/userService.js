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

const isPlainObject = (value) =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Valida el cuerpo de PUT /nutritional-profile. Admite cambios parciales con la
 * misma forma que el perfil: { caloricGoal }.
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
    Object.assign(user, changes);
    return user;
  });
}
