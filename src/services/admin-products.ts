"use server";

import { assertAdminAction } from "@/src/lib/admin-action";
import { createServiceRoleClient } from "@/src/lib/supabase/admin-service";
import type { AdminProductRow } from "@/src/types/admin";

type ActionResult<T> = { data: T; error: string | null };

const PRODUCT_SELECT =
  "id,title,category,status,price,created_at,user_id" as const;

type ProductDbRow = {
  id: string;
  title: string;
  category: string;
  status: string;
  price: number;
  created_at: string;
  user_id: string;
};

function rowToAdminProduct(
  row: ProductDbRow,
  seller: { email: string | null; full_name: string | null } | null,
): AdminProductRow {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    status: row.status,
    price: row.price,
    createdAt: row.created_at,
    sellerId: row.user_id,
    sellerEmail: seller?.email ?? null,
    sellerName: seller?.full_name ?? null,
  };
}

export async function adminListProducts(): Promise<ActionResult<AdminProductRow[]>> {
  try {
    await assertAdminAction();
    const db = createServiceRoleClient();

    const { data, error } = await db
      .from("products")
      .select(PRODUCT_SELECT)
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) return { data: [], error: error.message };

    const rows = (data ?? []) as ProductDbRow[];
    const sellerIds = [...new Set(rows.map((r) => r.user_id))];

    const sellersMap = new Map<string, { email: string | null; full_name: string | null }>();
    if (sellerIds.length > 0) {
      const { data: profiles } = await db
        .from("profiles")
        .select("id,email,full_name")
        .in("id", sellerIds);
      for (const p of profiles ?? []) {
        if (p && typeof p === "object" && "id" in p) {
          const r = p as { id: string; email: string | null; full_name: string | null };
          sellersMap.set(r.id, { email: r.email, full_name: r.full_name });
        }
      }
    }

    const products = rows.map((row) => rowToAdminProduct(row, sellersMap.get(row.user_id) ?? null));
    return { data: products, error: null };
  } catch (e) {
    return { data: [], error: e instanceof Error ? e.message : "No autorizado." };
  }
}

export async function adminSetProductStatus(
  productId: string,
  status: "active" | "paused",
): Promise<ActionResult<null>> {
  try {
    await assertAdminAction();
    const db = createServiceRoleClient();
    const { error } = await db.from("products").update({ status }).eq("id", productId);
    if (error) return { data: null, error: error.message };
    return { data: null, error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : "No autorizado." };
  }
}

export async function adminDeleteProduct(productId: string): Promise<ActionResult<null>> {
  try {
    await assertAdminAction();
    const db = createServiceRoleClient();
    const { error } = await db.from("products").delete().eq("id", productId);
    if (error) return { data: null, error: error.message };
    return { data: null, error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : "No autorizado." };
  }
}
