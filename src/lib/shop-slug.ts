const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MIN_LEN = 3;
const MAX_LEN = 48;

/** Slug URL para /tienda/[slug]: minúsculas, números y guiones. */
export function normalizeShopSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_LEN);
}

export function validateShopSlug(slug: string): { ok: true; slug: string } | { ok: false; error: string } {
  const normalized = normalizeShopSlug(slug);
  if (!normalized) {
    return { ok: false, error: "Ingresá un slug para tu tienda (ej. libreria-san-martin)." };
  }
  if (normalized.length < MIN_LEN) {
    return { ok: false, error: `El slug debe tener al menos ${MIN_LEN} caracteres.` };
  }
  if (!SLUG_PATTERN.test(normalized)) {
    return { ok: false, error: "Usá solo letras minúsculas, números y guiones." };
  }
  const reserved = new Set(["perfil", "premium", "tienda", "shop", "login", "registro", "ajustes", "vender", "admin"]);
  if (reserved.has(normalized)) {
    return { ok: false, error: "Ese slug está reservado. Elegí otro." };
  }
  return { ok: true, slug: normalized };
}
