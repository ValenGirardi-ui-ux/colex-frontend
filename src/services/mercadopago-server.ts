import {
  isMercadoPagoTestMode,
  mercadoPagoAccessToken,
  mercadoPagoWebhookSecret,
} from "@/src/lib/mercadopago/config";

const MP_API = "https://api.mercadopago.com";

export type MercadoPagoPreferenceItem = {
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: "ARS";
};

export type CreatePreferenceInput = {
  orderId: string;
  productTitle: string;
  productPrice: number;
  shippingFee: number;
  totalAmount: number;
  payerEmail?: string | null;
  siteOrigin: string;
};

export type CreatePreferenceResult = {
  preferenceId: string | null;
  initPoint: string | null;
  error: string | null;
};

export type MercadoPagoPayment = {
  id: number;
  status: string;
  status_detail?: string;
  external_reference: string | null;
};

function authHeaders(): HeadersInit {
  const token = mercadoPagoAccessToken();
  if (!token) throw new Error("Mercado Pago no configurado (MERCADOPAGO_ACCESS_TOKEN).");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export async function createMercadoPagoPreference(
  input: CreatePreferenceInput,
): Promise<CreatePreferenceResult> {
  if (!mercadoPagoAccessToken()) {
    return { preferenceId: null, initPoint: null, error: "Mercado Pago no configurado en el servidor." };
  }

  const items: MercadoPagoPreferenceItem[] = [
    {
      title: input.productTitle.slice(0, 256) || "Producto Colex",
      quantity: 1,
      unit_price: roundMoney(input.productPrice),
      currency_id: "ARS",
    },
  ];

  const shipping = roundMoney(input.shippingFee);
  if (shipping > 0) {
    items.push({
      title: "Envío",
      quantity: 1,
      unit_price: shipping,
      currency_id: "ARS",
    });
  }

  const total = roundMoney(input.totalAmount);
  const itemsTotal = roundMoney(items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0));
  if (Math.abs(itemsTotal - total) > 0.02) {
    return {
      preferenceId: null,
      initPoint: null,
      error: "El total del checkout no coincide con producto + envío.",
    };
  }

  const secret = mercadoPagoWebhookSecret();
  const webhookBase = `${input.siteOrigin}/api/mercadopago/webhook`;
  const notificationUrl = secret
    ? `${webhookBase}?token=${encodeURIComponent(secret)}`
    : webhookBase;

  const body: Record<string, unknown> = {
    items,
    external_reference: input.orderId,
    back_urls: {
      success: `${input.siteOrigin}/comprar/pago/resultado?status=success`,
      failure: `${input.siteOrigin}/comprar/pago/resultado?status=failure`,
      pending: `${input.siteOrigin}/comprar/pago/resultado?status=pending`,
    },
    auto_return: "approved",
    notification_url: notificationUrl,
    statement_descriptor: "COLEX",
  };

  if (input.payerEmail?.trim()) {
    body.payer = { email: input.payerEmail.trim() };
  }

  try {
    const res = await fetch(`${MP_API}/checkout/preferences`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    });

    const data = (await res.json()) as Record<string, unknown>;

    if (!res.ok) {
      const message =
        typeof data.message === "string"
          ? data.message
          : typeof data.error === "string"
            ? data.error
            : "No se pudo crear la preferencia de pago.";
      return { preferenceId: null, initPoint: null, error: message };
    }

    const preferenceId = typeof data.id === "string" ? data.id : null;
    const initPoint = isMercadoPagoTestMode()
      ? typeof data.sandbox_init_point === "string"
        ? data.sandbox_init_point
        : null
      : typeof data.init_point === "string"
        ? data.init_point
        : null;

    if (!initPoint) {
      return { preferenceId, initPoint: null, error: "Mercado Pago no devolvió URL de pago." };
    }

    return { preferenceId, initPoint, error: null };
  } catch (e) {
    return {
      preferenceId: null,
      initPoint: null,
      error: e instanceof Error ? e.message : "Error al conectar con Mercado Pago.",
    };
  }
}

export async function fetchMercadoPagoPayment(paymentId: string): Promise<{
  payment: MercadoPagoPayment | null;
  error: string | null;
}> {
  if (!mercadoPagoAccessToken()) {
    return { payment: null, error: "Mercado Pago no configurado." };
  }

  try {
    const res = await fetch(`${MP_API}/v1/payments/${encodeURIComponent(paymentId)}`, {
      headers: authHeaders(),
      cache: "no-store",
    });

    const data = (await res.json()) as Record<string, unknown>;

    if (!res.ok) {
      const message = typeof data.message === "string" ? data.message : "No se pudo consultar el pago.";
      return { payment: null, error: message };
    }

    const id = typeof data.id === "number" ? data.id : Number(data.id);
    if (!Number.isFinite(id)) {
      return { payment: null, error: "Respuesta de pago inválida." };
    }

    return {
      payment: {
        id,
        status: typeof data.status === "string" ? data.status : "unknown",
        status_detail: typeof data.status_detail === "string" ? data.status_detail : undefined,
        external_reference:
          typeof data.external_reference === "string" ? data.external_reference : null,
      },
      error: null,
    };
  } catch (e) {
    return {
      payment: null,
      error: e instanceof Error ? e.message : "Error al consultar Mercado Pago.",
    };
  }
}

export function isWebhookTokenValid(token: string | null): boolean {
  const secret = mercadoPagoWebhookSecret();
  if (!secret) return true;
  return Boolean(token && token === secret);
}
