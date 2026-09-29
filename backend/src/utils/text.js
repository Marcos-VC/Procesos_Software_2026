// Minúsculas y sin tildes, para comparar textos.
export function normalizeText(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

// Formato de alérgenos: español, minúsculas, sin tildes ni espacios.
export function normalizeAllergen(value) {
  return normalizeText(value).replace(/\s+/g, "_");
}
