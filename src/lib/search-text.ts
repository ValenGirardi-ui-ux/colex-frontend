/** Texto normalizado para búsqueda: minúsculas, sin acentos, espacios colapsados. */
export function normalizeSearchText(value: string | null | undefined): string {
  if (value == null) return "";
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Tokens de la consulta (mín. 1 carácter). */
export function searchQueryTokens(query: string): string[] {
  const normalized = normalizeSearchText(query);
  if (!normalized) return [];
  return normalized.split(" ").filter((t) => t.length > 0);
}

/**
 * Variantes simples para coincidencias parciales (ej. libro / libros).
 */
export function tokenMatchVariants(token: string): string[] {
  const base = normalizeSearchText(token);
  if (!base) return [];
  const variants = new Set<string>([base]);
  if (base.length > 3 && base.endsWith("s")) {
    variants.add(base.slice(0, -1));
  } else if (base.length > 2) {
    variants.add(`${base}s`);
  }
  if (base.length > 4 && base.endsWith("es")) {
    variants.add(base.slice(0, -2));
  } else if (base.length > 2 && !base.endsWith("s")) {
    variants.add(`${base}es`);
  }
  return [...variants];
}
