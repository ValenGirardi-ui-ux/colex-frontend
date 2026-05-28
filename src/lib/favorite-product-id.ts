/** UUID (productos en Supabase). Los mocks usan ids cortos (`h-201`, `p-1001`). */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function normalizeFavoriteProductId(id: string): string {
  const trimmed = id.trim();
  if (UUID_RE.test(trimmed)) return trimmed.toLowerCase();
  return trimmed;
}

export function isUuidProductId(productId: string): boolean {
  return UUID_RE.test(normalizeFavoriteProductId(productId));
}

/** @deprecated Usar `isUuidProductId` */
export function canPersistFavorite(productId: string): boolean {
  return isUuidProductId(productId);
}
