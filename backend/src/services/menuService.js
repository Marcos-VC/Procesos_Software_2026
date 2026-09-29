import { randomUUID } from "node:crypto";
import { HttpError } from "../errors.js";
import { readJson, updateJson } from "../store/jsonStore.js";
import { normalizeAllergen } from "../utils/text.js";
import { findUser } from "./userService.js";

const MENUS_FILE = "mock_menus.json";

export const DAYS = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
export const MEALS = ["desayuno", "comida", "cena"];

const emptyDays = () =>
  Object.fromEntries(DAYS.map((day) => [day, Object.fromEntries(MEALS.map((meal) => [meal, []]))]));

export async function getMenu(userId) {
  await findUser(userId);
  const menus = await readJson(MENUS_FILE);
  return menus.find((item) => item.userId === userId) ?? { id: null, userId, days: emptyDays() };
}

/**
 * Valida la estructura { dia: { desayuno: [foodId], comida: [...], cena: [...] } }
 * y devuelve una copia completa (todos los días y comidas presentes).
 * Rechaza alimentos inexistentes y alimentos con alérgenos prohibidos por el perfil.
 */
async function parseDays(days, user) {
  if (typeof days !== "object" || days === null || Array.isArray(days)) {
    throw new HttpError(400, "days debe ser un objeto con los días de la semana");
  }

  const foods = await readJson("mock_alimentos.json");
  const foodsById = new Map(foods.map((food) => [food.id, food]));
  const forbidden = new Set(user.medicalRestrictions.allergies.map(normalizeAllergen));

  const unknownDay = Object.keys(days).find((day) => !DAYS.includes(day));
  if (unknownDay) {
    throw new HttpError(400, `Día no válido: ${unknownDay}`);
  }

  const result = emptyDays();
  for (const day of DAYS) {
    const meals = days[day] ?? {};
    if (typeof meals !== "object" || meals === null || Array.isArray(meals)) {
      throw new HttpError(400, `El día ${day} debe ser un objeto con desayuno, comida y cena`);
    }
    const unknownMeal = Object.keys(meals).find((meal) => !MEALS.includes(meal));
    if (unknownMeal) {
      throw new HttpError(400, `Sección no válida en ${day}: ${unknownMeal}`);
    }

    for (const meal of MEALS) {
      const foodIds = meals[meal] ?? [];
      if (!Array.isArray(foodIds)) {
        throw new HttpError(400, `${day}.${meal} debe ser un array de IDs de alimento`);
      }
      for (const foodId of foodIds) {
        const food = foodsById.get(foodId);
        if (!food) {
          throw new HttpError(400, `Alimento no encontrado: ${foodId}`);
        }
        const blockedBy = food.allergens.filter((allergen) => forbidden.has(allergen));
        if (blockedBy.length > 0) {
          throw new HttpError(
            422,
            `"${food.name}" está bloqueado por tu perfil (${blockedBy.join(", ")})`,
          );
        }
        result[day][meal].push(foodId);
      }
    }
  }
  return result;
}

// Crea o reemplaza el menú del usuario (un menú por usuario en el Sprint 1).
export async function saveMenu(userId, days) {
  const user = await findUser(userId);
  const validDays = await parseDays(days, user);

  return updateJson(MENUS_FILE, (menus) => {
    let menu = menus.find((item) => item.userId === userId);
    if (!menu) {
      menu = { id: randomUUID(), userId, days: validDays };
      menus.push(menu);
    } else {
      menu.days = validDays;
    }
    return menu;
  });
}
