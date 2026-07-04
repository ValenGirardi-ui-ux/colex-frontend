import { NextResponse } from "next/server";
import { resolveSiteOrigin } from "@/src/lib/mercadopago/site-url";
import { createServiceRoleClient } from "@/src/lib/supabase/admin-service";
import {
  processMercadoPagoPaymentById,
  type MercadoPagoReturnStatus,
} from "@/src/services/mercadopago-payment-process";

export const runtime = "nodejs";

function parseReturnStatus(value: string | null): MercadoPagoReturnStatus {
  const v = value?.trim().toLowerCase();
  if (v === "success" || v === "approved") return "success";
  if (v === "pending" || v === "in_process") return "pending";
  if (v === "failure" || v === "rejected" || v === "cancelled") return "failure";
  return "unknown";
}

function extractPaymentId(url: URL): string | null {
  return (
    url.searchParams.get("payment_id") ??
    url.searchParams.get("collection_id") ??
    url.searchParams.get("data.id")
  )?.trim() || null;
}

/**
 * URL de retorno de Checkout Pro: Mercado Pago redirige acá tras pagar.
 * Verifica el pago con la API, registra la compra y lleva al usuario a la pantalla de resultado.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = resolveSiteOrigin(request);
  const fallbackStatus = parseReturnStatus(url.searchParams.get("status"));
  const paymentId = extractPaymentId(url);

  let returnStatus: MercadoPagoReturnStatus = fallbackStatus;
  let orderId = url.searchParams.get("external_reference")?.trim() ?? null;
  let conversationId: string | null = null;
  let registered = false;

  if (paymentId) {
    const result = await processMercadoPagoPaymentById(paymentId);
    if (result.returnStatus !== "unknown") {
      returnStatus = result.returnStatus;
    }
    orderId = result.orderId ?? orderId;
    conversationId = result.conversationId;
    registered = returnStatus === "success" && (result.alreadyPaid || !result.error);
  }

  let productId: string | null = null;
  if (orderId) {
    try {
      const db = createServiceRoleClient();
      const { data } = await db.from("orders").select("product_id").eq("id", orderId).maybeSingle();
      if (data && typeof (data as { product_id?: unknown }).product_id === "string") {
        productId = (data as { product_id: string }).product_id;
      }
    } catch {
      productId = null;
    }
  }

  const resultUrl = new URL("/comprar/pago/resultado", origin);
  resultUrl.searchParams.set("status", returnStatus);
  if (orderId) resultUrl.searchParams.set("orderId", orderId);
  if (productId) resultUrl.searchParams.set("productId", productId);
  if (conversationId) resultUrl.searchParams.set("conv", conversationId);
  if (registered) resultUrl.searchParams.set("registered", "1");
  if (paymentId) resultUrl.searchParams.set("payment_id", paymentId);

  return NextResponse.redirect(resultUrl.toString());
}
