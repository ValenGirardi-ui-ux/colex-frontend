import { getProductDetailById } from "@/src/data/mockProducts";
import {
  addLocalFavorite,
  readLocalFavoriteEntries,
  readLocalFavoriteIds,
  removeLocalFavorite,
  type LocalFavoriteEntry,
} from "@/src/lib/favorites-local-storage";
import { isUuidProductId, normalizeFavoriteProductId } from "@/src/lib/favorite-product-id";
import { supabase } from "@/src/lib/supabase/client";
import type { Product } from "@/src/types/product";

/** Tabla `public.favorites` no creada o caché de PostgREST desactualizada. */
export function isFavoritesSchemaError(message: string | null | undefined): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  return (
    m.includes("favorites") &&
    (m.includes("schema cache") || m.includes("does not exist") || m.includes("could not find"))
  );
}

function isSupabaseFallbackError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    isFavoritesSchemaError(message) ||
    m.includes("foreign key") ||
    m.includes("violates foreign key") ||
    m.includes("invalid input syntax for type uuid")
  );
}

export function formatFavoriteErrorForUser(message: string): string {
  if (isFavoritesSchemaError(message)) {
    return "Falta configurar favoritos en Supabase; los demos se guardan en este navegador.";
  }
  return "No pudimos actualizar favoritos. Intentá de nuevo.";
}

let schemaWarned = false;

export function warnFavoritesSchemaOnce(error: string): void {
  if (!isFavoritesSchemaError(error) || schemaWarned) return;
  schemaWarned = true;
  console.warn(
    "[Colex favorites] Tabla Supabase opcional en desarrollo. Ejecutá supabase/favorites-setup.sql cuando publiques productos reales.",
    error,
  );
}

function ensureProductImages<T extends Product>(product: T): T {
  const raw = product.images;
  const images = Array.isArray(raw) ? raw : [];
  return { ...product, images };
}

type FavoriteRef = {
  productId: string;
  savedAt: string;
  source: "supabase" | "local";
};

async function fetchSupabaseFavoriteRefs(userId: string): Promise<{
  refs: FavoriteRef[];
  ids: Set<string>;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("favorites")
    .select("product_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    warnFavoritesSchemaOnce(error.message);
    return { refs: [], ids: new Set(), error: error.message };
  }

  const refs: FavoriteRef[] = [];
  const ids = new Set<string>();
  for (const row of data ?? []) {
    if (row.product_id == null) continue;
    const productId = normalizeFavoriteProductId(String(row.product_id));
    if (!productId || ids.has(productId)) continue;
    ids.add(productId);
    refs.push({
      productId,
      savedAt: typeof row.created_at === "string" ? row.created_at : new Date().toISOString(),
      source: "supabase",
    });
  }
  return { refs, ids, error: null };
}

function mergeFavoriteRefs(supabaseRefs: FavoriteRef[], localEntries: LocalFavoriteEntry[]): FavoriteRef[] {
  const supabaseIds = new Set(supabaseRefs.map((r) => r.productId));
  const localRefs: FavoriteRef[] = localEntries
    .filter((e) => !supabaseIds.has(e.productId))
    .map((e) => ({
      productId: e.productId,
      savedAt: e.savedAt,
      source: "local" as const,
    }));
  return [...supabaseRefs, ...localRefs].sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

/**
 * IDs favoritos: Supabase (reales) + localStorage (demo/mock).
 */
export async function fetchFavoriteProductIds(userId: string): Promise<{ ids: Set<string>; error: string | null }> {
  const { refs, error } = await fetchSupabaseFavoriteRefs(userId);
  const localEntries = readLocalFavoriteEntries(userId);
  const merged = mergeFavoriteRefs(refs, localEntries);
  const ids = new Set(merged.map((r) => r.productId));
  return { ids, error: isFavoritesSchemaError(error) ? null : error };
}

async function resolveProductsForRefs(refs: FavoriteRef[]): Promise<Product[]> {
  if (refs.length === 0) return [];

  const uuidIds = refs.filter((r) => isUuidProductId(r.productId)).map((r) => r.productId);
  const byId = new Map<string, Product>();

  if (uuidIds.length > 0) {
    const { data: productRows, error: prodErr } = await supabase.from("products").select("*").in("id", uuidIds);
    if (prodErr) {
      console.warn("[Colex favorites] productos Supabase", prodErr.message);
    } else {
      for (const row of productRows ?? []) {
        const p = ensureProductImages(row as Product);
        byId.set(normalizeFavoriteProductId(p.id), p);
      }
    }
  }

  const products: Product[] = [];
  for (const ref of refs) {
    const fromDb = byId.get(ref.productId);
    if (fromDb) {
      products.push(fromDb);
      continue;
    }
    const mock = getProductDetailById(ref.productId);
    if (mock) products.push(ensureProductImages(mock));
  }
  const { enrichProductsWithSellerVerified } = await import("@/src/services/profiles");
  const { enrichProductsWithSellerReviews } = await import("@/src/services/reviews");
  const verified = await enrichProductsWithSellerVerified(products);
  return enrichProductsWithSellerReviews(verified);
}

/** Productos favoritos: prioridad Supabase, demo desde catálogo mock + localStorage. */
export async function fetchFavoriteProducts(userId: string): Promise<{ products: Product[]; error: string | null }> {
  const { refs, error } = await fetchSupabaseFavoriteRefs(userId);
  const localEntries = readLocalFavoriteEntries(userId);
  const merged = mergeFavoriteRefs(refs, localEntries);
  const products = await resolveProductsForRefs(merged);
  return { products, error: isFavoritesSchemaError(error) ? null : error };
}

async function addSupabaseFavorite(userId: string, productId: string): Promise<{ error: string | null; usedLocalFallback: boolean }> {
  const { error } = await supabase.from("favorites").insert({
    user_id: userId,
    product_id: productId,
  });
  if (!error) {
    removeLocalFavorite(userId, productId);
    return { error: null, usedLocalFallback: false };
  }
  if (error.code === "23505") {
    removeLocalFavorite(userId, productId);
    return { error: null, usedLocalFallback: false };
  }
  if (isSupabaseFallbackError(error.message)) {
    addLocalFavorite(userId, productId);
    return { error: null, usedLocalFallback: true };
  }
  warnFavoritesSchemaOnce(error.message);
  return { error: error.message, usedLocalFallback: false };
}

/**
 * Agregar favorito: UUID → Supabase primero; si falla o es mock → localStorage.
 */
export async function addFavorite(userId: string, productId: string): Promise<{ error: string | null }> {
  const pid = normalizeFavoriteProductId(productId);

  if (isUuidProductId(pid)) {
    const result = await addSupabaseFavorite(userId, pid);
    return { error: result.error };
  }

  addLocalFavorite(userId, pid);
  return { error: null };
}

/**
 * Quitar favorito de Supabase (si aplica) y siempre de localStorage.
 */
export async function removeFavorite(userId: string, productId: string): Promise<{ error: string | null }> {
  const pid = normalizeFavoriteProductId(productId);
  removeLocalFavorite(userId, pid);

  if (!isUuidProductId(pid)) return { error: null };

  const { error } = await supabase.from("favorites").delete().eq("user_id", userId).eq("product_id", pid);
  if (error && !isFavoritesSchemaError(error.message)) {
    console.warn("[Colex favorites] quitar en Supabase", error.message);
  }
  return { error: null };
}

/** Para depuración: saber si un id está solo en local. */
export function isLocalOnlyFavorite(userId: string, productId: string): boolean {
  const pid = normalizeFavoriteProductId(productId);
  return readLocalFavoriteIds(userId).has(pid);
}
