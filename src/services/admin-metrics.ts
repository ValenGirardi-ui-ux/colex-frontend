"use server";

import { assertAdminAction } from "@/src/lib/admin-action";
import { createServiceRoleClient } from "@/src/lib/supabase/admin-service";
import type { AdminMetrics } from "@/src/types/admin";

type ActionResult<T> = { data: T; error: string | null };

export async function adminGetMetrics(): Promise<ActionResult<AdminMetrics>> {
  try {
    await assertAdminAction();
    const db = createServiceRoleClient();

    const [
      usersRes,
      activeRes,
      pausedRes,
      soldRes,
      premiumRes,
      featuredRes,
      ordersRes,
      reportsRes,
    ] = await Promise.all([
      db.from("profiles").select("id", { count: "exact", head: true }),
      db.from("products").select("id", { count: "exact", head: true }).eq("status", "active"),
      db.from("products").select("id", { count: "exact", head: true }).eq("status", "paused"),
      db.from("products").select("id", { count: "exact", head: true }).eq("status", "sold"),
      db
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("is_premium", true)
        .not("shop_slug", "is", null),
      db.from("profiles").select("id", { count: "exact", head: true }).eq("is_featured", true),
      db.from("orders").select("id", { count: "exact", head: true }),
      db.from("product_reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
    ]);

    const firstError =
      usersRes.error ??
      activeRes.error ??
      pausedRes.error ??
      soldRes.error ??
      premiumRes.error ??
      featuredRes.error ??
      ordersRes.error ??
      reportsRes.error;

    if (firstError) {
      const msg = firstError.message.toLowerCase();
      if (msg.includes("product_reports") && msg.includes("does not exist")) {
        return {
          data: {
            registeredUsers: usersRes.count ?? 0,
            activeListings: activeRes.count ?? 0,
            pausedListings: pausedRes.count ?? 0,
            soldListings: soldRes.count ?? 0,
            premiumShops: premiumRes.count ?? 0,
            featuredBusinesses: featuredRes.count ?? 0,
            totalOrders: ordersRes.count ?? 0,
            pendingReports: 0,
          },
          error: null,
        };
      }
      return { data: emptyMetrics(), error: firstError.message };
    }

    return {
      data: {
        registeredUsers: usersRes.count ?? 0,
        activeListings: activeRes.count ?? 0,
        pausedListings: pausedRes.count ?? 0,
        soldListings: soldRes.count ?? 0,
        premiumShops: premiumRes.count ?? 0,
        featuredBusinesses: featuredRes.count ?? 0,
        totalOrders: ordersRes.count ?? 0,
        pendingReports: reportsRes.count ?? 0,
      },
      error: null,
    };
  } catch (e) {
    return { data: emptyMetrics(), error: e instanceof Error ? e.message : "No autorizado." };
  }
}

function emptyMetrics(): AdminMetrics {
  return {
    registeredUsers: 0,
    activeListings: 0,
    pausedListings: 0,
    soldListings: 0,
    premiumShops: 0,
    featuredBusinesses: 0,
    totalOrders: 0,
    pendingReports: 0,
  };
}
