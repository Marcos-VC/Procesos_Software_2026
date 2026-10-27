import type {
  Allergen,
  DietType,
  AllergenId,
  Food,
  DailySummary,
  Menu,
  MenuFavorite,
  ProfileChanges,
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
  getFoods: (search: string) =>
    request<Food[]>(`/api/foods?${new URLSearchParams({ search }).toString()}`),
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
};
