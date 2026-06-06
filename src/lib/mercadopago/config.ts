export function mercadoPagoAccessToken(): string | null {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
  return token || null;
}

export function mercadoPagoPublicKey(): string | null {
  const key = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY?.trim();
  return key || null;
}

export function mercadoPagoWebhookSecret(): string | null {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET?.trim();
  return secret || null;
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
