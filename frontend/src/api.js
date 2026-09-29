const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Usuario de demo (Sprint 1): primer perfil de mocks/mock_usuarios.json.
export const demoUserId = "5d37a69d-97c8-4280-afb7-2dc90467d688";

async function request(path, options) {
  const response = await fetch(`${apiUrl}${path}`, options);
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.message || "Error en la petición");
  }
  return body;
}

export const api = {
  getFoods: (search) =>
    request(`/api/foods?${new URLSearchParams({ search }).toString()}`),
  getProfile: (userId) => request(`/api/users/${userId}/nutritional-profile`),
  getSummary: (userId) => request(`/api/nutrition/${userId}/daily-summary`),
};
