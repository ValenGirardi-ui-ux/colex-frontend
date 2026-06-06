import { getAllListProducts, getProductDetailById, getProductsBySellerId } from "@/src/data/mockProducts";
import { filterAndRankProducts } from "@/src/lib/product-search";
import { normalizeSearchText } from "@/src/lib/search-text";
import { sortProductsFeaturedFirst } from "@/src/lib/featured-listings";
import { enrichProductsWithSellerVerified } from "@/src/services/profiles";
import { enrichProductsWithSellerReviews } from "@/src/services/reviews";
import { hasSupabaseEnv, supabase } from "@/src/lib/supabase/client";
import type { Product, ProductInsert } from "@/src/types/product";

/** Filas de Supabase u otras fuentes pueden traer `images` null/omitido. */
function ensureProductImages<T extends Product>(product: T): T {
  const raw = product.images;
  const images = Array.isArray(raw) ? raw : [];
  return { ...product, images };
}

const normalize = normalizeSearchText;

async function enrichCatalogProducts(products: Product[]): Promise<Product[]> {
  const verified = await enrichProductsWithSellerVerified(products);
  return enrichProductsWithSellerReviews(verified);
}

async function fallbackProducts(): Promise<Product[]> {
  return getAllListProducts().map(ensureProductImages);
}

export async function getProducts(): Promise<Product[]> {
  const mocks = await fallbackProducts();
  if (!hasSupabaseEnv) return mocks;

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("[Colex products] listar activos", error.message);
    return mocks;
  }

  const fromDb = (data ?? []).map((row) => ensureProductImages(row as Product));
  if (fromDb.length === 0) return mocks;

  const dbIds = new Set(fromDb.map((p) => p.id));
  const demoRest = mocks.filter((m) => !dbIds.has(m.id));
  const enriched = await enrichCatalogProducts([...fromDb, ...demoRest]);
  return sortProductsFeaturedFirst(enriched);
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!hasSupabaseEnv) {
    const mock = getProductDetailById(id);
    return mock ? ensureProductImages(mock) : null;
  }

  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (error || !data) {
    const mock = getProductDetailById(id);
    return mock ? ensureProductImages(mock) : null;
  }
  const product = ensureProductImages(data as Product);
  if (product.status !== "active") {
    return null;
  }
  const [enriched] = await enrichCatalogProducts([product]);
  return enriched ?? product;
}

/** Producto propio del vendedor. Requiere RLS products_select_own. */
export async function getOwnProductById(id: string, userId: string): Promise<Product | null> {
  if (!hasSupabaseEnv) return null;

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return ensureProductImages(data as Product);
}

export async function createProduct(productData: ProductInsert): Promise<Product> {
  if (!hasSupabaseEnv) {
    const now = new Date().toISOString();
    const { status, images, new_condition, used_condition, ...rest } = productData;
    return {
      ...rest,
      id: `mock-${Date.now()}`,
      created_at: now,
      status: status ?? "active",
      images: images ?? [],
      new_condition: new_condition ?? null,
      used_condition: used_condition ?? null,
    };
  }

  const payload = {
    ...productData,
    status: productData.status ?? "active",
    images: productData.images ?? [],
    condition: productData.condition ?? "usado",
    new_condition: productData.new_condition ?? null,
    used_condition: productData.used_condition ?? null,
  };

  const { data, error } = await supabase.from("products").insert(payload).select("*").single();
  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    throw new Error("No se recibió el producto creado.");
  }
  return ensureProductImages(data as Product);
}

export async function updateProduct(
  id: string,
  patch: Partial<ProductInsert> & { status?: Product["status"] },
  userId?: string,
): Promise<Product> {
  if (!hasSupabaseEnv) {
    throw new Error("Supabase no configurado.");
  }

  let query = supabase.from("products").update(patch).eq("id", id);
  if (userId) {
    query = query.eq("user_id", userId);
  }
  const { data, error } = await query.select("*").single();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("No se recibió el producto actualizado.");
  return ensureProductImages(data as Product);
}

export async function deleteProduct(id: string, userId: string): Promise<void> {
  if (!hasSupabaseEnv) return;

  const { error } = await supabase.from("products").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const all = await getProducts();
  const target = normalize(category);
  const matched = all.filter((product) => normalize(product.category) === target);
  return matched.length > 0 ? matched : all;
}

/**
 * Búsqueda en catálogo unificado (Supabase activos + mocks demo).
 * Coincidencias parciales en título, descripción, categoría, marca, institución, ubicación, talle y tags.
 */
export async function searchProducts(query: string): Promise<Product[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const catalog = await getProducts();
  return filterAndRankProducts(catalog, trimmed).products;
}

/** Publicaciones activas del vendedor (Supabase o mocks si no hay env). */
export async function getActiveListingsByUserId(userId: string): Promise<Product[]> {
  if (!hasSupabaseEnv) {
    return getProductsBySellerId(userId);
  }
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false });
  if (error || !data?.length) return [];
  const list = (data as Product[]).map(ensureProductImages);
  return enrichCatalogProducts(list);
}

/** Publicaciones activas y pausadas del vendedor (panel de gestión en perfil propio). */
export async function getSellerManageableListingsByUserId(userId: string): Promise<Product[]> {
  if (!hasSupabaseEnv) {
    return getProductsBySellerId(userId);
  }
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["active", "paused"])
    .order("created_at", { ascending: false });
  if (error || !data?.length) return [];
  const list = (data as Product[]).map(ensureProductImages);
  return enrichCatalogProducts(list);
}
