import { HttpError } from "../errors.js";
import { readJson } from "../store/jsonStore.js";

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
