import type {
  Allergen,
  DietType,
  AllergenId,
  Food,
  DailySummary,
  Menu,
  MenuFavorite,
  NewFood,
  NewPantryItem,
  PantryItem,
  ProfileChanges,
  ShoppingItem,
  UserProfile,
  WeekDays,
} from "./types";

const apiUrl: string = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Usuario de demo (Sprint 1): primer perfil de mocks/mock_usuarios.json.
export const demoUserId = "5d37a69d-97c8-4280-afb7-2dc90467d688";

/** Error estándar de la API: { error: true, code, message }. */
interface ApiErrorBody {
  error: true;
  code: number;
  message: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, options);
  // 204 No Content (p. ej. al borrar): no hay cuerpo que leer.
  if (response.status === 204) {
    return undefined as T;
  }
  const body: unknown = await response.json();
  if (!response.ok) {
    throw new Error(
      (body as Partial<ApiErrorBody>).message || "Error en la petición",
    );
  }
  return body as T;
}

const sendJson = <T>(method: "PUT" | "POST", path: string, payload: unknown) =>
  request<T>(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

export const api = {
  getFoods: (search: string, userId?: string) =>
    request<Food[]>(
      `/api/foods?${new URLSearchParams(
        userId ? { search, userId } : { search },
      ).toString()}`,
    ),
  addFood: (food: NewFood) => sendJson<Food>("POST", "/api/foods", food),
  getAllergens: () => request<Allergen[]>("/api/allergens"),
  getProfile: (userId: string) =>
    request<UserProfile>(`/api/users/${userId}/nutritional-profile`),
  updateProfile: (userId: string, changes: ProfileChanges) =>
    sendJson<UserProfile>(
      "PUT",
      `/api/users/${userId}/nutritional-profile`,
      changes,
    ),
  updateDietType: (userId: string, dietType: DietType | string) =>
    sendJson<UserProfile>("PUT", `/api/users/${userId}/diet-type`, { dietType }),
  updateAllergies: (userId: string, allergies: AllergenId[]) =>
    sendJson<UserProfile>("PUT", `/api/users/${userId}/allergies`, allergies),
  getSummary: (userId: string) =>
    request<DailySummary>(`/api/nutrition/${userId}/daily-summary`),
  getMenu: (userId: string) => request<Menu>(`/api/menus/${userId}`),
  saveMenu: (userId: string, days: WeekDays) =>
    sendJson<Menu>("PUT", `/api/menus/${userId}`, { days }),
  getFavoriteMenus: (userId: string) =>
    request<MenuFavorite[]>(`/api/menus/favorites?${new URLSearchParams({ userId }).toString()}`),
  saveFavoriteMenu: (userId: string, name: string, days: WeekDays) =>
    sendJson<MenuFavorite>("POST", "/api/menus/favorites", { userId, name, days }),
  getShoppingList: (userId: string) =>
    request<ShoppingItem[]>(`/api/menus/${userId}/shopping-list`),
  setShoppingItemChecked: (userId: string, itemId: string, checked: boolean) =>
    sendJson<ShoppingItem>(
      "PUT",
      `/api/menus/${userId}/shopping-list/items/${itemId}`,
      { checked },
    ),
  addManualShoppingItem: (userId: string, name: string) =>
    sendJson<ShoppingItem>("POST", `/api/menus/${userId}/shopping-list/items`, { name }),
  deleteManualShoppingItem: (userId: string, itemId: string) =>
    request<void>(`/api/menus/${userId}/shopping-list/items/${itemId}`, { method: "DELETE" }),
  getPantry: (userId: string) => request<PantryItem[]>(`/api/pantry/${userId}`),
  addPantryItem: (userId: string, item: NewPantryItem) =>
    sendJson<PantryItem>("POST", `/api/pantry/${userId}`, item),
  updatePantryItem: (
    userId: string,
    itemId: string,
    changes: { quantity: number; unit?: string },
  ) => sendJson<PantryItem>("PUT", `/api/pantry/${userId}/${itemId}`, changes),
  deletePantryItem: (userId: string, itemId: string) =>
    request<{ deleted: boolean; id: string }>(`/api/pantry/${userId}/${itemId}`, {
      method: "DELETE",
    }),
};
