"use server";

import { assertAdminAction } from "@/src/lib/admin-action";
import { createServiceRoleClient } from "@/src/lib/supabase/admin-service";
import type { AdminReportRow } from "@/src/types/admin";

type ActionResult<T> = { data: T; error: string | null };

function rowToAdminReport(raw: Record<string, unknown>): AdminReportRow | null {
  const id = typeof raw.id === "string" ? raw.id : null;
  if (!id) return null;
  const status = raw.status === "reviewed" ? "reviewed" : "pending";
  return {
    id,
    productId: typeof raw.product_id === "string" ? raw.product_id : "",
    productTitle: typeof raw.product_title === "string" ? raw.product_title : "Sin título",
    reporterId: typeof raw.reporter_id === "string" ? raw.reporter_id : null,
    reporterEmail: typeof raw.reporter_email === "string" ? raw.reporter_email : null,
    reason: typeof raw.reason === "string" ? raw.reason : "",
    status,
    createdAt: typeof raw.created_at === "string" ? raw.created_at : "",
    reviewedAt: typeof raw.reviewed_at === "string" ? raw.reviewed_at : null,
  };
}

export async function adminListReports(): Promise<ActionResult<AdminReportRow[]>> {
  try {
    await assertAdminAction();
    const db = createServiceRoleClient();
    const { data, error } = await db
      .from("product_reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("product_reports") && (msg.includes("does not exist") || msg.includes("schema"))) {
        return {
          data: [],
          error: "Falta la migración product_reports. Ejecutá supabase/migrations/20260516700000_product_reports.sql.",
        };
      }
      return { data: [], error: error.message };
    }

    const reports: AdminReportRow[] = [];
    for (const raw of data ?? []) {
      if (raw && typeof raw === "object") {
        const row = rowToAdminReport(raw as Record<string, unknown>);
        if (row) reports.push(row);
      }
    }
    return { data: reports, error: null };
  } catch (e) {
    return { data: [], error: e instanceof Error ? e.message : "No autorizado." };
  }
}

export async function adminMarkReportReviewed(reportId: string): Promise<ActionResult<null>> {
  try {
    await assertAdminAction();
    const db = createServiceRoleClient();
    const { error } = await db
      .from("product_reports")
      .update({ status: "reviewed", reviewed_at: new Date().toISOString() })
      .eq("id", reportId);
    if (error) return { data: null, error: error.message };
    return { data: null, error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : "No autorizado." };
  }
}

export async function adminHideReportedProduct(productId: string): Promise<ActionResult<null>> {
  try {
    await assertAdminAction();
    const db = createServiceRoleClient();
    const { error } = await db.from("products").update({ status: "paused" }).eq("id", productId);
    if (error) return { data: null, error: error.message };
    return { data: null, error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : "No autorizado." };
  }
}
