import { NextResponse } from "next/server";
import { isWebhookTokenValid } from "@/src/services/mercadopago-server";
import { processMercadoPagoPaymentById } from "@/src/services/mercadopago-payment-process";

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
  const result = await processMercadoPagoPaymentById(paymentId);
  if (result.error) {
    console.error("[mercadopago/webhook] process failed", paymentId, result.error);
  }
  return NextResponse.json({
    ok: result.returnStatus === "success" || result.returnStatus === "pending" || !result.error,
    status: result.returnStatus,
    orderId: result.orderId,
    alreadyPaid: result.alreadyPaid,
  });
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
