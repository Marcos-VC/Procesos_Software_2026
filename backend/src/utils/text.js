// Minúsculas y sin tildes, para comparar textos.
export function normalizeText(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}
