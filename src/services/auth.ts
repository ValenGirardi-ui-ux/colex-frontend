import type { User } from "@supabase/supabase-js";
import {
  getSupabaseConfiguredHostname,
  hasSupabaseEnv,
  supabase,
  supabaseClientConfigError,
} from "@/src/lib/supabase/client";

export function authConfigError(): string | null {
  return supabaseClientConfigError();
}

async function upsertPublicProfile(params: {
  userId: string;
  email: string;
  fullName: string;
}) {
  const { error } = await supabase.from("profiles").upsert(
    { id: params.userId, email: params.email.trim(), full_name: params.fullName.trim() },
    { onConflict: "id" },
  );
  if (error) {
    // Tabla ausente / RLS: el registro de Auth ya puede estar OK; sólo registra aviso en consola (dev).
    console.warn("[Colex auth] profiles upsert:", error.message);
  }
}

/**
 * Alta con email/password. Opcionalmente rellena `public.profiles` si hay sesión (p. ej. sin confirmación por email).
 * `full_name` también queda en `user.user_metadata.full_name`.
 */
export async function registerWithEmail(
  email: string,
  password: string,
  fullName: string,
): Promise<{ error: string | null; sessionActive: boolean }> {
  const cfg = authConfigError();
  if (cfg) return { error: cfg, sessionActive: false };

  let data: Awaited<ReturnType<typeof supabase.auth.signUp>>["data"];
  let error: Awaited<ReturnType<typeof supabase.auth.signUp>>["error"];
  try {
    const out = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    });
    data = out.data;
    error = out.error;
  } catch (e) {
    return { error: mapThrownAuthError(e), sessionActive: false };
  }

  if (error) return { error: mapAuthMessage(error.message), sessionActive: false };

  const user = data.user;
  if (user && data.session) {
    await upsertPublicProfile({
      userId: user.id,
      email: user.email ?? email.trim(),
      fullName,
    });
  }

  return { error: null, sessionActive: Boolean(data.session) };
}

export async function signIn(
  email: string,
  password: string,
): Promise<{ error: string | null }> {
  const cfg = authConfigError();
  if (cfg) return { error: cfg };

  const trimmedEmail = email.trim();
  let data: Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>["data"];
  let error: Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>["error"];
  try {
    const out = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });
    data = out.data;
    error = out.error;
  } catch (e) {
    return { error: mapThrownAuthError(e) };
  }

  if (error) return { error: mapAuthMessage(error.message) };

  const user = data.user;
  if (user?.id) {
    const meta =
      user.user_metadata && typeof user.user_metadata.full_name === "string"
        ? user.user_metadata.full_name.trim()
        : "";
    const fallback = user.email?.split("@")[0]?.trim();
    await upsertPublicProfile({
      userId: user.id,
      email: user.email ?? trimmedEmail,
      fullName: meta || fallback || "Usuario",
    });
  }

  return { error: null };
}

export async function signOut(): Promise<{ error: string | null }> {
  const cfg = authConfigError();
  if (cfg) return { error: cfg };

  try {
    const { error } = await supabase.auth.signOut();
    if (error) return { error: mapAuthMessage(error.message) };
  } catch (e) {
    return { error: mapThrownAuthError(e) };
  }
  return { error: null };
}

/** Usuario JWT actual en el cliente; en servidor sin sesión suele dar null hasta integrar SSR/cookies. */
export async function getCurrentUser(): Promise<User | null> {
  if (!hasSupabaseEnv) return null;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user ?? null;
  } catch {
    return null;
  }
}

function mapThrownAuthError(e: unknown): string {
  let raw = e instanceof Error ? e.message : String(e);
  if (e instanceof Error && e.cause instanceof Error) {
    raw = `${raw} (${e.cause.message})`;
  }
  return mapAuthMessage(raw);
}

function mapAuthMessage(raw: string): string {
  const m = raw.toLowerCase();

  if (
    raw === "Failed to fetch" ||
    m === "failed to fetch" ||
    m.includes("failed to fetch") ||
    m.includes("load failed") ||
    m.includes("network error") ||
    m.includes("networkerror") ||
    m.includes("enotfound") ||
    m.includes("err_name_not_resolved")
  ) {
    const host = getSupabaseConfiguredHostname();
    const hostBit = host ? ` El cliente intenta hablar con «${host}».` : "";
    return (
      "No se pudo conectar con Supabase (fallo de red antes de cualquier respuesta del servidor)." +
      hostBit +
      " Copiá la «Project URL» tal cual desde Supabase → Settings → API (https://xxxx.supabase.co, sin rutas ni texto extra) en NEXT_PUBLIC_SUPABASE_URL, guardá .env.local y reiniciá npm run dev." +
      " Abrí esa misma URL en una pestaña nueva: si no carga el sitio, el subdominio está mal escrito, el proyecto está pausado o tu red/VPN/firewall o una extensión del navegador bloquea supabase.co."
    );
  }

  if (m.includes("invalid login credentials") || m.includes("invalid_credentials"))
    return "Email o contraseña incorrectos.";

  if (m.includes("email not confirmed"))
    return "Tenés que confirmar el correo antes de iniciar sesión. Revisá tu bandeja de entrada.";

  if (
    m.includes("user already registered") ||
    (m.includes("already") && (m.includes("registered") || m.includes("exist")))
  ) {
    return "Ese correo ya está registrado.";
  }

  if (m.includes("password")) return "Contraseña no válida. Probá cumplir con los requisitos de seguridad.";

  if (m.includes("network") || m.includes("fetch")) return "Sin conexión. Intentá de nuevo más tarde.";

  return raw || "Algo salió mal. Intentá de nuevo.";
}
