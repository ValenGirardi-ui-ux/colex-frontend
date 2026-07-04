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

export function isMercadoPagoTestMode(): boolean {
  return mercadoPagoAccessToken().startsWith("TEST-");
}

export function isMercadoPagoServerConfigured(): boolean {
  return true;
}

export function isMercadoPagoClientConfigured(): boolean {
  return true;
}
