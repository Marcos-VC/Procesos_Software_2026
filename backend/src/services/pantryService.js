import { randomUUID } from "node:crypto";
import { HttpError } from "../errors.js";
import { readJson, updateJson } from "../store/jsonStore.js";
import { normalizeText } from "../utils/text.js";
import { findUser } from "./userService.js";

const PANTRY_FILE = "mock_despensa.json";

const isPlainObject = (value) =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const roundQuantity = (value) => Number(value.toFixed(2));

function parseQuantity(rawQuantity, defaultIfUndefined = false) {
  if (rawQuantity === undefined && defaultIfUndefined) {
    return 1;
  }
  if (typeof rawQuantity !== "number" || !Number.isFinite(rawQuantity) || rawQuantity <= 0) {
    throw new HttpError(400, "quantity debe ser un número mayor que 0");
  }
  return roundQuantity(rawQuantity);
}

// GET /api/pantry/:userId: listado de existencias de la despensa del usuario (HU 4.1).
export async function getPantry(userId) {
  await findUser(userId);
  const items = await readJson(PANTRY_FILE);
  return items.filter((item) => item.userId === userId);
}

// POST /api/pantry/:userId { name, quantity?, unit }: añade un producto o suma su cantidad si ya existe con la misma unidad (HU 4.1).
export async function addPantryItem(userId, input) {
  await findUser(userId);
  if (!isPlainObject(input)) {
    throw new HttpError(400, "El producto debe ser un objeto JSON");
  }

  const name = typeof input.name === "string" ? input.name.trim() : "";
  const unit = typeof input.unit === "string" ? input.unit.trim() : "";
  if (!name || !unit) {
    throw new HttpError(400, "Nombre y unidad del producto son obligatorios");
  }
  const quantity = parseQuantity(input.quantity, true);

  return updateJson(PANTRY_FILE, (items) => {
    const existing = items.find(
      (item) =>
        item.userId === userId &&
        normalizeText(item.name) === normalizeText(name) &&
        normalizeText(item.unit) === normalizeText(unit),
    );
    if (existing) {
      existing.quantity = roundQuantity(existing.quantity + quantity);
      return existing;
    }

    const item = {
      id: randomUUID(),
      userId,
      name,
      quantity,
      unit,
    };
    items.push(item);
    return item;
  });
}

// PUT /api/pantry/:userId/:itemId { quantity, unit? }: actualiza la cantidad o unidad de un producto de la despensa (HU 4.1).
export async function updatePantryItem(userId, itemId, changes) {
  await findUser(userId);
  if (!isPlainObject(changes)) {
    throw new HttpError(400, "El cuerpo debe ser un objeto JSON");
  }

  const quantity = parseQuantity(changes.quantity, false);
  const unit =
    changes.unit !== undefined
      ? typeof changes.unit === "string"
        ? changes.unit.trim()
        : ""
      : undefined;
  if (unit !== undefined && !unit) {
    throw new HttpError(400, "unit no puede estar vacío");
  }

  return updateJson(PANTRY_FILE, (items) => {
    const item = items.find((entry) => entry.id === itemId && entry.userId === userId);
    if (!item) {
      throw new HttpError(404, "Producto no encontrado en la despensa");
    }
    item.quantity = quantity;
    if (unit !== undefined) {
      item.unit = unit;
    }
    return item;
  });
}

// DELETE /api/pantry/:userId/:itemId: elimina un producto de la despensa del usuario (HU 4.1).
export async function removePantryItem(userId, itemId) {
  await findUser(userId);

  return updateJson(PANTRY_FILE, (items) => {
    const index = items.findIndex((entry) => entry.id === itemId && entry.userId === userId);
    if (index === -1) {
      throw new HttpError(404, "Producto no encontrado en la despensa");
    }
    items.splice(index, 1);
    return { deleted: true, id: itemId };
  });
}

