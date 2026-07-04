/**
 * Credenciales Mercado Pago (prueba). Prioridad: variables de entorno → fallback fijo.
 * TODO: mover a MERCADOPAGO_ACCESS_TOKEN / NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY en producción.
 */
const MP_ACCESS_TOKEN_FALLBACK =
  "APP_USR-3578198684622129-070411-4c1799b8b1f4bb603d2a70a291a47a57-3515682775";

const MP_PUBLIC_KEY_FALLBACK = "APP_USR-0f46a7a4-cf61-4e6e-bd14-ac5ccb85cdf6";

/** URL pública del sitio para back_urls (opcional; si falta se infiere del request). */
const MP_SITE_URL_FALLBACK: string | null = null;

export function mercadoPagoAccessToken(): string | null {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
  return token || MP_ACCESS_TOKEN_FALLBACK;
}

export function mercadoPagoPublicKey(): string | null {
  const key = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY?.trim();
  return key || MP_PUBLIC_KEY_FALLBACK;
}

export function mercadoPagoWebhookSecret(): string | null {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET?.trim();
  return secret || null;
}

export function mercadoPagoSiteUrlFallback(): string | null {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return MP_SITE_URL_FALLBACK;
}

export function isMercadoPagoTestMode(): boolean {
  const token = mercadoPagoAccessToken();
  return token?.startsWith("TEST-") ?? false;
}

export function isMercadoPagoServerConfigured(): boolean {
  return Boolean(mercadoPagoAccessToken());
}

export function isMercadoPagoClientConfigured(): boolean {
  return Boolean(mercadoPagoPublicKey());
}
