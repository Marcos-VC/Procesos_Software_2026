// Tipos del dominio de E6. Reflejan exactamente las respuestas de la API
// (ver mocks/ y docs/sprint1-readme.md), por eso los macros son campos planos.

/** Identificador de un alérgeno: español, minúsculas, sin tildes ni espacios (p. ej. "frutos_secos"). */
export type AllergenId = string;

/** Entrada del catálogo de alérgenos (GET /api/allergens). */
export interface Allergen {
  id: AllergenId;
  name: string;
  icon: string;
  description: string;
}

/** Alimento del catálogo. Calorías y macros por cada 100 g. */
export interface Food {
  /** UUID v4 */
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  allergens: AllergenId[];
}

/** Alimento tal y como lo devuelve GET /api/foods?userId=: con el bloqueo según el perfil. */
export interface CatalogFood extends Food {
  blocked?: boolean;
  blockedBy?: AllergenId[];
}

export interface MedicalRestrictions {
  allergies: AllergenId[];
  dietType: string;
}

/** Perfil nutricional del usuario (contrato con E1). */
export interface UserProfile {
  /** UUID v4 */
  userId: string;
  weight: number;
  caloricGoal: number;
  medicalRestrictions: MedicalRestrictions;
}

/** Cambios admitidos por PUT /api/users/:userId/nutritional-profile (parciales). */
export interface ProfileChanges {
  weight?: number;
  caloricGoal?: number;
  medicalRestrictions?: Partial<MedicalRestrictions>;
}

/** Resumen del día (contrato con E2/E5). */
export interface DailySummary {
  userId: string;
  /** YYYY-MM-DD */
  date: string;
  totalCaloriesConsumed: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
}

export const DAY_KEYS = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
] as const;
export const MEAL_KEYS = ["desayuno", "comida", "cena"] as const;

export type DayKey = (typeof DAY_KEYS)[number];
export type MealKey = (typeof MEAL_KEYS)[number];

/** Alimentos (IDs) asignados a cada comida de un día. */
export type DayMeals = Record<MealKey, string[]>;

/** Estructura semanal del menú: día → comida → IDs de alimento. */
export type WeekDays = Record<DayKey, DayMeals>;

/** Menú de un usuario (GET/PUT /api/menus/:userId). `id` es null mientras no se ha guardado. */
export interface Menu {
  /** UUID v4 */
  id: string | null;
  userId: string;
  days: WeekDays;
}
