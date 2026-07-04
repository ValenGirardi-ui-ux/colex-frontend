import { mercadoPagoSiteUrlFallback } from "@/src/lib/mercadopago/config";

/** Origen público del sitio (back_urls y notification_url de Mercado Pago). */
export function resolveSiteOrigin(request: Request): string {
  const fromConfig = mercadoPagoSiteUrlFallback();
  if (fromConfig) return fromConfig;

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return "http://localhost:3000";

  const proto =
    request.headers.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
