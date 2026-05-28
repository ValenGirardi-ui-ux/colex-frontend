import { createClient } from "@supabase/supabase-js";

/** Normaliza valores típicos de .env (espacios, comillas, BOM UTF-8). */
function normalizeEnv(raw: string | undefined): string {
  if (raw == null) return "";
  let s = String(raw).trim();
  if (s.charCodeAt(0) === 0xfeff) s = s.slice(1).trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

export const supabaseUrl = normalizeEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
export const supabaseAnonKey = normalizeEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Faltan variables de entorno de Supabase");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const hasSupabaseEnv = true;

/** Hostname de la Project URL (para mensajes de diagnóstico; no incluye la clave). */
export function getSupabaseConfiguredHostname(): string {
  try {
    return new URL(supabaseUrl).hostname;
  } catch {
    return "";
  }
}

/** Devuelve null si la URL es usable; mensaje para el usuario si la validación local falla. */
export function supabaseClientConfigError(): string | null {
  try {
    const u = new URL(supabaseUrl);
    const local =
      u.hostname === "localhost" ||
      u.hostname === "127.0.0.1" ||
      u.hostname === "::1";
    const protocolOk = u.protocol === "https:" || (u.protocol === "http:" && local);
    if (!protocolOk) {
      return "NEXT_PUBLIC_SUPABASE_URL debe usar https (o http solo si Supabase corre en localhost).";
    }
  } catch {
    return "NEXT_PUBLIC_SUPABASE_URL no es válida. Revisá que no tenga espacios ni comillas de más en .env.local.";
  }
  return null;
}
