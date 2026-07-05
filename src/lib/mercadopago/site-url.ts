import { mercadoPagoSiteUrlFallback } from "@/src/lib/mercadopago/config";

function isLocalHost(host: string): boolean {
  const hostname = host.toLowerCase().split(":")[0];
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function isLocalOrigin(origin: string): boolean {
  try {
    return isLocalHost(new URL(origin).hostname);
  } catch {
    return false;
  }
}

function requestPublicOrigin(request: Request): string | null {
  const host = (request.headers.get("x-forwarded-host") ?? request.headers.get("host"))
    ?.split(",")[0]
    ?.trim();
  if (!host || isLocalHost(host)) return null;

  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

/** Origen público del sitio (back_urls y notification_url de Mercado Pago). */
export function resolveSiteOrigin(request: Request): string {
  const fromConfig = mercadoPagoSiteUrlFallback();
  const fromRequest = requestPublicOrigin(request);

  // En Vercel, priorizar el host real (colex-frontend.vercel.app) sobre VERCEL_URL interno
  // o un NEXT_PUBLIC_SITE_URL=localhost heredado del entorno local.
  if (fromRequest) return fromRequest;

  if (fromConfig && !isLocalOrigin(fromConfig)) return fromConfig;

  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProduction) return `https://${vercelProduction.replace(/\/$/, "")}`;

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  if (fromConfig) return fromConfig;

  return "http://localhost:3000";
}

export function isLocalSiteOrigin(origin: string): boolean {
  return isLocalOrigin(origin);
}
