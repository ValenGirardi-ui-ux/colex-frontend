import { normalizeFavoriteProductId } from "@/src/lib/favorite-product-id";

const STORAGE_VERSION = "v1";

export type LocalFavoriteEntry = {
  productId: string;
  savedAt: string;
};

function storageKey(userId: string): string {
  return `colex:favorites:${STORAGE_VERSION}:${userId}`;
}

function readRaw(userId: string): LocalFavoriteEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: LocalFavoriteEntry[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      const row = item as Record<string, unknown>;
      const productId =
        typeof row.productId === "string" ? normalizeFavoriteProductId(row.productId) : "";
      const savedAt = typeof row.savedAt === "string" ? row.savedAt : new Date().toISOString();
      if (productId) out.push({ productId, savedAt });
    }
    return out;
  } catch {
    return [];
  }
}

function writeRaw(userId: string, entries: LocalFavoriteEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify(entries));
  } catch (e) {
    console.warn("[Colex favorites] localStorage no disponible", e);
  }
}

/** Favoritos demo/mock guardados en el navegador (desarrollo). */
export function readLocalFavoriteEntries(userId: string): LocalFavoriteEntry[] {
  const seen = new Set<string>();
  const deduped: LocalFavoriteEntry[] = [];
  for (const entry of readRaw(userId)) {
    if (seen.has(entry.productId)) continue;
    seen.add(entry.productId);
    deduped.push(entry);
  }
  return deduped.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export function readLocalFavoriteIds(userId: string): Set<string> {
  return new Set(readLocalFavoriteEntries(userId).map((e) => e.productId));
}

export function addLocalFavorite(userId: string, productId: string): void {
  const pid = normalizeFavoriteProductId(productId);
  const now = new Date().toISOString();
  const rest = readRaw(userId).filter((e) => e.productId !== pid);
  writeRaw(userId, [{ productId: pid, savedAt: now }, ...rest]);
}

export function removeLocalFavorite(userId: string, productId: string): void {
  const pid = normalizeFavoriteProductId(productId);
  writeRaw(
    userId,
    readRaw(userId).filter((e) => e.productId !== pid),
  );
}

export function clearLocalFavorites(userId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey(userId));
  } catch {
    /* ignore */
  }
}
