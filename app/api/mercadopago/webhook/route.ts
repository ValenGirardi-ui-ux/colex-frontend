import { NextResponse } from "next/server";
import {
  fetchMercadoPagoPayment,
  isWebhookTokenValid,
} from "@/src/services/mercadopago-server";
import {
  cancelOrderAfterMercadoPagoPayment,
  fulfillOrderAfterMercadoPagoPayment,
} from "@/src/services/order-payment-server";

export const runtime = "nodejs";

function extractPaymentId(request: Request, body: Record<string, unknown> | null): string | null {
  const url = new URL(request.url);
  const fromQuery = url.searchParams.get("id") ?? url.searchParams.get("data.id");
  if (fromQuery?.trim()) return fromQuery.trim();

  if (body) {
    const data = body.data;
    if (data && typeof data === "object" && "id" in data) {
      const id = (data as { id: unknown }).id;
      if (typeof id === "string" || typeof id === "number") return String(id);
    }
    if (typeof body.id === "string" || typeof body.id === "number") {
      return String(body.id);
    }
  }

  return null;
}

async function handlePaymentNotification(paymentId: string): Promise<NextResponse> {
  const { payment, error } = await fetchMercadoPagoPayment(paymentId);
  if (error || !payment) {
    console.error("[mercadopago/webhook] payment fetch failed", paymentId, error);
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  const orderId = payment.external_reference?.trim();
  if (!orderId) {
    console.warn("[mercadopago/webhook] payment without external_reference", paymentId);
    return NextResponse.json({ ok: true, skipped: "no_reference" });
  }

  const mpPaymentId = String(payment.id);
  const status = payment.status.toLowerCase();

  if (status === "approved") {
    const result = await fulfillOrderAfterMercadoPagoPayment(orderId, mpPaymentId);
    if (!result.ok && !result.alreadyPaid) {
      console.error("[mercadopago/webhook] fulfill failed", orderId, result.error);
    }
    return NextResponse.json({ ok: result.ok || result.alreadyPaid, status: "approved" });
  }

  if (status === "rejected" || status === "cancelled") {
    await cancelOrderAfterMercadoPagoPayment(orderId, mpPaymentId);
    return NextResponse.json({ ok: true, status });
  }

  return NextResponse.json({ ok: true, status, action: "ignored" });
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!isWebhookTokenValid(token)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  let body: Record<string, unknown> | null = null;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = null;
  }

  const paymentId = extractPaymentId(request, body);
  if (!paymentId) {
    return NextResponse.json({ ok: true, skipped: "no_payment_id" });
  }

  return handlePaymentNotification(paymentId);
}

/** IPN legacy de Mercado Pago (topic=payment&id=...). */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!isWebhookTokenValid(token)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const topic = url.searchParams.get("topic") ?? url.searchParams.get("type");
  const paymentId = url.searchParams.get("id") ?? url.searchParams.get("data.id");

  if (topic === "payment" && paymentId?.trim()) {
    return handlePaymentNotification(paymentId.trim());
  }

  return NextResponse.json({ ok: true, skipped: "ignored" });
}
