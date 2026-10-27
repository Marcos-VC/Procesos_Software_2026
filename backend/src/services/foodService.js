import { readJson, updateJson } from "../store/jsonStore.js";
import { HttpError } from "../errors.js";
import { normalizeText } from "../utils/text.js";
import { getAllergenCatalog } from "./userService.js";

// Busca alimentos por nombre (sin distinguir mayúsculas ni tildes).
export async function searchFoods(search = "") {
  const term = normalizeText(search);
  const foods = await readJson("mock_alimentos.json");
  return term ? foods.filter((food) => normalizeText(food.name).includes(term)) : foods;
}

export function listAllergens() {
  return getAllergenCatalog();
}

export async function createFood(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new HttpError(400, "El alimento debe ser un objeto");
  }

  const name = typeof input.name === "string" ? input.name.trim() : "";
  const numericFields = ["calories", "protein", "carbohydrates", "fat"];
  if (!name || numericFields.some((field) => !Number.isFinite(input[field]) || input[field] < 0)) {
    throw new HttpError(400, "Nombre y valores nutricionales válidos son obligatorios");
  }
  if (!Array.isArray(input.allergens) || input.allergens.some((item) => typeof item !== "string")) {
    throw new HttpError(400, "allergens debe ser un array de identificadores");
  }
  const allergens = await getAllergenCatalog();
  const knownAllergens = new Set(allergens.map((item) => item.id));
  const unknownAllergen = input.allergens.find((item) => !knownAllergens.has(item));
  if (unknownAllergen) {
    throw new HttpError(400, `Alérgeno no reconocido: ${unknownAllergen}`);
  }
  const suitableFor = input.suitableFor === undefined ? undefined : input.suitableFor;
  if (suitableFor !== undefined && (!Array.isArray(suitableFor) || suitableFor.some((item) => typeof item !== "string"))) {
    throw new HttpError(400, "suitableFor debe ser un array de dietas");
  }

  return updateJson("mock_alimentos.json", (foods) => {
    if (foods.some((food) => normalizeText(food.name) === normalizeText(name))) {
      throw new HttpError(409, "Ya existe un alimento con ese nombre");
    }
    const food = {
      id: crypto.randomUUID(),
      name,
      calories: input.calories,
      protein: input.protein,
      carbohydrates: input.carbohydrates,
      fat: input.fat,
      allergens: [...new Set(input.allergens)],
      ...(suitableFor === undefined ? {} : { suitableFor: [...new Set(suitableFor)] }),
    };
    foods.push(food);
    return food;
  });
}
