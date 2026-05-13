import { getAllListProducts, getProductDetailById } from "@/src/data/mockProducts";
import { hasSupabaseEnv, supabase } from "@/src/lib/supabase/client";
import type { Product, ProductInsert } from "@/src/types/product";

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

async function fallbackProducts(): Promise<Product[]> {
  return getAllListProducts();
}

export async function getProducts(): Promise<Product[]> {
  if (!hasSupabaseEnv) return fallbackProducts();

  const { data, error } = await supabase.from("products").select("*").eq("status", "active").order("created_at", { ascending: false });
  if (error || !data || data.length === 0) return fallbackProducts();
  return data as Product[];
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!hasSupabaseEnv) return getProductDetailById(id) ?? null;

  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (error || !data) return getProductDetailById(id) ?? null;
  return data as Product;
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
    new_condition: productData.new_condition ?? null,
    used_condition: productData.used_condition ?? null,
  };

  const { data, error } = await supabase.from("products").insert(payload).select("*").single();
  if (error || !data) {
    throw new Error("No se pudo crear el producto en Supabase.");
  }
  return data as Product;
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const all = await getProducts();
  const target = normalize(category);
  const matched = all.filter((product) => normalize(product.category) === target);
  return matched.length > 0 ? matched : all;
}
