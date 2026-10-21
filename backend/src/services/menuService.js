import { randomUUID } from "node:crypto";
import { HttpError } from "../errors.js";
import { readJson, updateJson } from "../store/jsonStore.js";
import { findUser } from "./userService.js";

const MENUS_FILE = "mock_menus.json";
const FAVORITES_FILE = "mock_menu_favorites.json";

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
 * Rechaza alimentos inexistentes.
 */
export async function parseDays(days) {
  if (typeof days !== "object" || days === null || Array.isArray(days)) {
    throw new HttpError(400, "days debe ser un objeto con los días de la semana");
  }

  const foods = await readJson("mock_alimentos.json");
  const foodsById = new Map(foods.map((food) => [food.id, food]));

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
        result[day][meal].push(foodId);
      }
    }
  }
  return result;
}

// Crea o reemplaza el menú del usuario (un menú por usuario en el Sprint 1).
export async function saveMenu(userId, days) {
  await findUser(userId);
  const validDays = await parseDays(days);

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

// GET /api/menus/favorites?userId=: menús favoritos guardados por el usuario (HU 3.3).
export async function listFavorites(userId) {
  await findUser(userId);
  const favorites = await readJson(FAVORITES_FILE);
  return favorites.filter((item) => item.userId === userId);
}

// POST /api/menus/favorites { userId, name, days }: guarda un menú completo bajo un nombre.
export async function createFavorite(userId, name, days) {
  await findUser(userId);
  const trimmedName = typeof name === "string" ? name.trim() : "";
  if (!trimmedName) {
    throw new HttpError(400, "name es obligatorio");
  }
  const validDays = await parseDays(days);

  return updateJson(FAVORITES_FILE, (favorites) => {
    const favorite = { id: randomUUID(), userId, name: trimmedName, days: validDays };
    favorites.push(favorite);
    return favorite;
  });
}
