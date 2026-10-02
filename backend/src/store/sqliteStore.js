// Infraestructura de SQLite: persistencia definitiva del módulo (sustituye al plan
// original de MongoDB).
//
// SPRINT 1: este fichero está preparado pero SIN USO ACTIVO. Ningún controlador ni
// servicio lo importa; la API sigue leyendo y escribiendo en los JSON de /mocks a
// través de store/jsonStore.js. La migración real a SQLite se hará en el Sprint 2
// (cargar los mocks con las sentencias de abajo y cambiar los servicios al nuevo store).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

// SQLITE_PATH permite elegir otro fichero (o ":memory:" en pruebas).
export const DATABASE_PATH = process.env.SQLITE_PATH
  ? process.env.SQLITE_PATH
  : path.resolve(currentDirectory, "../../data/healthy-life.db");

// Mismo modelo que los mocks JSON: IDs UUID v4 y alérgenos como ids en español,
// minúsculas, sin tildes ni espacios (p. ej. "frutos_secos").
export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  user_id       TEXT PRIMARY KEY,                    -- UUID v4
  weight        REAL    NOT NULL CHECK (weight > 0),
  caloric_goal  INTEGER NOT NULL CHECK (caloric_goal BETWEEN 500 AND 10000),
  diet_type     TEXT    NOT NULL DEFAULT 'omnivore'
);

CREATE TABLE IF NOT EXISTS allergens (
  id            TEXT PRIMARY KEY,                    -- p. ej. 'gluten', 'frutos_secos'
  name          TEXT NOT NULL,
  icon          TEXT NOT NULL,
  description   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_allergies (
  user_id       TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  allergen_id   TEXT NOT NULL REFERENCES allergens(id),
  PRIMARY KEY (user_id, allergen_id)
);

CREATE TABLE IF NOT EXISTS foods (
  id            TEXT PRIMARY KEY,                    -- UUID v4
  name          TEXT NOT NULL,
  calories      REAL NOT NULL CHECK (calories >= 0), -- por cada 100 g
  protein       REAL NOT NULL CHECK (protein >= 0),
  carbohydrates REAL NOT NULL CHECK (carbohydrates >= 0),
  fat           REAL NOT NULL CHECK (fat >= 0)
);

CREATE TABLE IF NOT EXISTS food_allergens (
  food_id       TEXT NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  allergen_id   TEXT NOT NULL REFERENCES allergens(id),
  PRIMARY KEY (food_id, allergen_id)
);

CREATE TABLE IF NOT EXISTS menus (
  id            TEXT PRIMARY KEY,                    -- UUID v4
  user_id       TEXT NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS menu_items (
  menu_id       TEXT    NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  day           TEXT    NOT NULL CHECK (day IN
                  ('lunes','martes','miercoles','jueves','viernes','sabado','domingo')),
  meal          TEXT    NOT NULL CHECK (meal IN ('desayuno','comida','cena')),
  position      INTEGER NOT NULL,                    -- orden dentro de la comida
  food_id       TEXT    NOT NULL REFERENCES foods(id),
  PRIMARY KEY (menu_id, day, meal, position)
);
`;

/**
 * Abre (o crea) la base de datos y se asegura de que existe el esquema.
 * Para usarla desde el Sprint 2: `const db = getDatabase();`
 */
export function openDatabase(filePath = DATABASE_PATH) {
  if (filePath !== ":memory:") {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }
  const database = new Database(filePath);
  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");
  database.exec(SCHEMA_SQL);
  return database;
}

// Conexión compartida y perezosa: no se abre hasta la primera llamada, así que
// importar este módulo no crea ningún fichero.
let sharedDatabase;

export function getDatabase() {
  sharedDatabase ??= openDatabase();
  return sharedDatabase;
}
