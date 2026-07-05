import { MERCADOPAGO_ACCESS_TOKEN, MERCADOPAGO_PUBLIC_KEY } from "@/src/lib/mercadopago/credentials";

export function mercadoPagoAccessToken(): string {
  return process.env.MERCADOPAGO_ACCESS_TOKEN?.trim() || MERCADOPAGO_ACCESS_TOKEN;
}

export function mercadoPagoPublicKey(): string {
  return process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY?.trim() || MERCADOPAGO_PUBLIC_KEY;
}

export function mercadoPagoWebhookSecret(): string | null {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET?.trim();
  return secret || null;
}

export function mercadoPagoSiteUrlFallback(): string | null {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return fromEnv ? fromEnv.replace(/\/$/, "") : null;
}

/** Checkout Pro de prueba: usa sandbox_init_point (no init_point de producción). */
export function isMercadoPagoTestMode(): boolean {
  const override = process.env.MERCADOPAGO_USE_SANDBOX?.trim().toLowerCase();
  if (override === "true" || override === "1") return true;
  if (override === "false" || override === "0") return false;
  if (mercadoPagoAccessToken().startsWith("TEST-")) return true;
  // APP_USR del panel de prueba también expone sandbox_init_point; en dev usamos sandbox.
  return process.env.NODE_ENV !== "production";
}

export function isMercadoPagoServerConfigured(): boolean {
  return true;
}

export function isMercadoPagoClientConfigured(): boolean {
  return true;
}
