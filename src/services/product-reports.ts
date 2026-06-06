"use server";

import { PRODUCT_REPORT_REASONS, type ProductReportReason } from "@/src/lib/product-report-reasons";
import { getSessionUser } from "@/src/lib/admin-guard";
import { createServiceRoleClient } from "@/src/lib/supabase/admin-service";

type SubmitResult = { ok: boolean; error: string | null };

export async function submitProductReport(
  productId: string,
  reason: ProductReportReason,
): Promise<SubmitResult> {
  const id = productId.trim();
  if (!id) return { ok: false, error: "Publicación inválida." };

  if (!PRODUCT_REPORT_REASONS.includes(reason)) {
    return { ok: false, error: "Motivo de reporte inválido." };
  }

  try {
    const db = createServiceRoleClient();
    const { data: product, error: productError } = await db
      .from("products")
      .select("id,title")
      .eq("id", id)
      .maybeSingle();

    if (productError) {
      const msg = productError.message.toLowerCase();
      if (msg.includes("product_reports")) {
        return { ok: false, error: "Reportes no configurados en Supabase." };
      }
      return { ok: false, error: productError.message };
    }
    if (!product) return { ok: false, error: "No encontramos esta publicación." };

    const user = await getSessionUser();
    const title =
      product && typeof product === "object" && "title" in product && typeof product.title === "string"
        ? product.title
        : "Sin título";

    const { error } = await db.from("product_reports").insert({
      product_id: id,
      product_title: title,
      reporter_id: user?.id ?? null,
      reporter_email: user?.email?.trim() || null,
      reason,
      status: "pending",
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("product_reports") && (msg.includes("does not exist") || msg.includes("schema"))) {
        return { ok: false, error: "Reportes no configurados en Supabase." };
      }
      return { ok: false, error: error.message };
    }

    return { ok: true, error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : "No se pudo enviar el reporte.";
    if (message.includes("SERVICE_ROLE")) {
      return { ok: false, error: "Reportes no disponibles en este entorno." };
    }
    return { ok: false, error: message };
  }
}
