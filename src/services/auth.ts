import type { AuthError, User } from "@supabase/supabase-js";
import {
  getSupabaseConfiguredHostname,
  hasSupabaseEnv,
  supabase,
  supabaseClientConfigError,
} from "@/src/lib/supabase/client";
import { syncProfileAfterAuthSignup } from "@/src/services/profiles";

/**
 * Emails de confirmación / magic link (Supabase Dashboard — no se controlan desde este repo):
 * - Auth → Providers → Email → **Confirm email** activado si querés obligar confirmación antes de sesión.
 * - Auth → **URL Configuration**: Site URL + **Redirect URLs** deben incluir `/login`, `/auth/callback` y `/login/restablecer`.
 * - Sin SMTP custom, Supabase usa su mailer; revisá cuotas y carpeta spam.
 * - Auth → **Logs** en el dashboard para ver envíos / errores del proveedor.
 */
export function authConfigError(): string | null {
  return supabaseClientConfigError();
}

function logAuth(scope: string, payload: unknown) {
  console.log(`[Colex auth] ${scope}`, payload);
}

function logAuthError(scope: string, err: unknown) {
  console.error(`[Colex auth] ${scope}`, err);
}

function signUpRedirectUrl(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return `${window.location.origin}/login`;
}

function passwordResetRedirectUrl(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const next = encodeURIComponent("/login/restablecer");
  return `${window.location.origin}/auth/callback?next=${next}`;
}

async function upsertPublicProfile(params: {
  userId: string;
  email: string;
  fullName: string;
}) {
  const { error } = await syncProfileAfterAuthSignup({
    userId: params.userId,
    email: params.email,
    fullName: params.fullName,
  });
  if (error) {
    console.error("[Colex auth] profiles sync (tabla/RLS o permisos):", error);
  }
}

/**
 * Alta con email/password vía **`supabase.auth.signUp()`**.
 * Si **Confirm email** está activo en Supabase, `data.session` suele ser `null` hasta confirmar; el mail lo dispara el proyecto (revisá dashboard / logs).
 * `emailRedirectTo` debe estar permitido en **Auth → URL Configuration → Redirect URLs**.
 */
export async function registerWithEmail(
  email: string,
  password: string,
  fullName: string,
): Promise<{ error: string | null; sessionActive: boolean }> {
  const cfg = authConfigError();
  if (cfg) return { error: cfg, sessionActive: false };

  const redirectTo = signUpRedirectUrl();
  logAuth("signUp:request", {
    email: email.trim(),
    emailRedirectTo: redirectTo ?? "(no window — SSR)",
    hasPassword: Boolean(password),
  });

  let data: Awaited<ReturnType<typeof supabase.auth.signUp>>["data"];
  let error: Awaited<ReturnType<typeof supabase.auth.signUp>>["error"];
  try {
    const out = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          full_name: fullName.trim(),
        },
      },
    });
    data = out.data;
    error = out.error;

    logAuth("signUp:response (sin tokens)", {
      user: data.user
        ? {
            id: data.user.id,
            email: data.user.email,
            created_at: data.user.created_at,
            identitiesCount: data.user.identities?.length ?? 0,
            emailConfirmedAt: data.user.email_confirmed_at ?? null,
          }
        : null,
      session: data.session
        ? {
            expires_at: data.session.expires_at,
            expires_in: data.session.expires_in,
            token_type: data.session.token_type,
            user_id: data.session.user.id,
          }
        : null,
      error: error
        ? { name: error.name, message: error.message, status: error.status, code: (error as { code?: string }).code }
        : null,
    });
  } catch (e) {
    logAuthError("signUp:exception (raw)", e);
    return { error: mapThrownAuthError(e), sessionActive: false };
  }

  if (error) {
    logAuthError("signUp:AuthApiError", error);
    return { error: toUserAuthMessage(error.message, authErrorCode(error)), sessionActive: false };
  }

  const user = data.user;
  if (user && data.session) {
    await upsertPublicProfile({
      userId: user.id,
      email: user.email ?? email.trim(),
      fullName,
    });
  }

  const sessionActive = Boolean(data.session);
  logAuth("signUp:session-state", {
    sessionActive,
    hint: sessionActive
      ? "Hay sesión inmediata (confirmación por email desactivada o ya confirmado)."
      : "Sin sesión inmediata: si Confirm email está ON, revisá bandeja / spam y Auth Logs en Supabase. El usuario puede existir en Auth con email_confirmed_at null.",
  });

  try {
    const {
      data: { session: afterSession },
    } = await supabase.auth.getSession();
    logAuth("signUp:getSession() after signUp", {
      hasSession: Boolean(afterSession),
      userId: afterSession?.user?.id ?? null,
    });
  } catch (e) {
    logAuthError("signUp:getSession:exception", e);
  }

  return { error: null, sessionActive };
}

export async function signIn(
  email: string,
  password: string,
): Promise<{ error: string | null }> {
  const cfg = authConfigError();
  if (cfg) return { error: cfg };

  const trimmedEmail = email.trim();
  logAuth("signInWithPassword:request", { email: trimmedEmail });

  let data: Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>["data"];
  let error: Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>["error"];
  try {
    const out = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });
    data = out.data;
    error = out.error;

    logAuth("signInWithPassword:response (sin tokens)", {
      user: data.user
        ? {
            id: data.user.id,
            email: data.user.email,
            emailConfirmedAt: data.user.email_confirmed_at ?? null,
          }
        : null,
      session: data.session
        ? {
            expires_at: data.session.expires_at,
            user_id: data.session.user.id,
          }
        : null,
      error: error
        ? { name: error.name, message: error.message, status: error.status, code: (error as { code?: string }).code }
        : null,
    });
  } catch (e) {
    logAuthError("signInWithPassword:exception (raw)", e);
    return { error: mapThrownAuthError(e) };
  }

  if (error) {
    logAuthError("signInWithPassword:AuthApiError", error);
    return { error: toUserAuthMessage(error.message, authErrorCode(error)) };
  }

  try {
    const {
      data: { session: afterSession },
    } = await supabase.auth.getSession();
    logAuth("signInWithPassword:getSession() after signIn", {
      hasSession: Boolean(afterSession),
      userId: afterSession?.user?.id ?? null,
    });
  } catch (e) {
    logAuthError("signInWithPassword:getSession:exception", e);
  }

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

/** Envía el mail de recuperación (Supabase Auth). */
export async function requestPasswordReset(email: string): Promise<{ error: string | null }> {
  const cfg = authConfigError();
  if (cfg) return { error: cfg };

  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    return { error: "Ingresá tu email." };
  }

  const redirectTo = passwordResetRedirectUrl();
  logAuth("resetPasswordForEmail:request", {
    email: trimmedEmail,
    redirectTo: redirectTo ?? "(no window — SSR)",
  });

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo,
    });
    if (error) {
      logAuthError("resetPasswordForEmail:AuthApiError", error);
      return { error: toUserAuthMessage(error.message, authErrorCode(error)) };
    }
    logAuth("resetPasswordForEmail:ok", {});
    return { error: null };
  } catch (e) {
    logAuthError("resetPasswordForEmail:exception (raw)", e);
    return { error: mapThrownAuthError(e) };
  }
}

/** Nueva contraseña tras abrir el enlace del mail (sesión recovery activa). */
export async function updatePasswordAfterRecovery(password: string): Promise<{ error: string | null }> {
  const cfg = authConfigError();
  if (cfg) return { error: cfg };

  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres" };
  }

  logAuth("updateUser:password", { hasPassword: true });

  try {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      logAuthError("updateUser:password:AuthApiError", error);
      return { error: toUserAuthMessage(error.message, authErrorCode(error)) };
    }
    logAuth("updateUser:password:ok", {});
    return { error: null };
  } catch (e) {
    logAuthError("updateUser:password:exception (raw)", e);
    return { error: mapThrownAuthError(e) };
  }
}

export async function signOut(): Promise<{ error: string | null }> {
  const cfg = authConfigError();
  if (cfg) return { error: cfg };

  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      logAuthError("signOut:error", error);
      return { error: toUserAuthMessage(error.message, authErrorCode(error)) };
    }
    logAuth("signOut:ok", {});
  } catch (e) {
    logAuthError("signOut:exception (raw)", e);
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
      error,
    } = await supabase.auth.getUser();
    if (error) {
      logAuthError("getUser:error", error);
      return null;
    }
    return user ?? null;
  } catch (e) {
    logAuthError("getUser:exception (raw)", e);
    return null;
  }
}

function mapThrownAuthError(e: unknown): string {
  if (isAuthLikeError(e)) {
    return toUserAuthMessage(e.message, e.code);
  }
  let raw = e instanceof Error ? e.message : String(e);
  if (e instanceof Error && e.cause instanceof Error) {
    raw = `${raw} (${e.cause.message})`;
  }
  return toUserAuthMessage(raw);
}

function authErrorCode(error: AuthError | { message: string; code?: string } | null): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  const c = (error as { code?: string }).code;
  return typeof c === "string" ? c : undefined;
}

function isAuthLikeError(e: unknown): e is { message: string; code?: string } {
  return (
    typeof e === "object" &&
    e !== null &&
    "message" in e &&
    typeof (e as { message: unknown }).message === "string"
  );
}

/**
 * Mensaje seguro para mostrar en la UI (nunca devuelve texto crudo inglés largo de la API).
 * El detalle queda en consola vía `logAuthError` cuando no hay mapeo específico.
 */
export function formatAuthErrorForUser(message: unknown, code?: string): string {
  const m = typeof message === "string" ? message : String(message ?? "");
  return toUserAuthMessage(m, code);
}

function toUserAuthMessage(message: string, code?: string): string {
  const trimmed = message.trim();
  const m = trimmed.toLowerCase();
  const c = (code ?? "").toLowerCase();

  if (
    trimmed === "Failed to fetch" ||
    m === "failed to fetch" ||
    m.includes("failed to fetch") ||
    m.includes("load failed") ||
    m.includes("network error") ||
    m.includes("networkerror") ||
    m.includes("enotfound") ||
    m.includes("err_name_not_resolved")
  ) {
    logAuthError("auth:network-detail", {
      message: trimmed,
      code: c || undefined,
      host: getSupabaseConfiguredHostname(),
    });
    return "No pudimos conectar con el servidor. Revisá tu conexión y que la URL de Supabase en la configuración del proyecto sea correcta.";
  }

  if (
    m.includes("invalid login credentials") ||
    m.includes("invalid_credentials") ||
    c === "invalid_credentials" ||
    c === "invalid_grant"
  ) {
    return "Email o contraseña incorrectos.";
  }

  if (m.includes("email not confirmed") || c === "email_not_confirmed") {
    return "Tenés que confirmar el correo antes de iniciar sesión. Revisá tu bandeja de entrada.";
  }

  if (
    m.includes("user already registered") ||
    m.includes("user already exists") ||
    m.includes("already registered") ||
    m.includes("database error saving new user") ||
    c === "user_already_exists"
  ) {
    return "Ya existe una cuenta con este email";
  }

  if (
    m.includes("password should be at least 6 characters") ||
    m.includes("at least 6 characters") ||
    (m.includes("password") && m.includes("at least") && m.includes("6"))
  ) {
    return "La contraseña debe tener al menos 6 caracteres";
  }

  if (c === "weak_password") {
    return "La contraseña no cumple los requisitos de seguridad. Probá una más larga o con letras y números.";
  }

  if (
    m.includes("rate limit") ||
    m.includes("too many requests") ||
    m.includes("over_request_rate") ||
    c === "over_email_send_rate_limit" ||
    c === "too_many_requests"
  ) {
    return "Demasiados intentos. Esperá unos minutos y probá de nuevo.";
  }

  if (m.includes("invalid email") || m.includes("unable to validate email") || c === "email_address_invalid") {
    return "El email no es válido.";
  }

  if ((m.includes("signup") && m.includes("disabled")) || c === "signup_disabled") {
    return "El registro con email está deshabilitado en este proyecto. Contactá al administrador.";
  }

  if (m.includes("network") || m.includes("fetch")) {
    logAuthError("auth:network-generic", { message: trimmed, code: c || undefined });
    return "Sin conexión o el servidor no respondió. Intentá de nuevo más tarde.";
  }

  if (trimmed.startsWith("NEXT_PUBLIC_") || trimmed.includes("SUPABASE_URL")) {
    return trimmed;
  }

  logAuthError("auth:unmapped-user-message", { message: trimmed, code: c || undefined });
  return "No pudimos completar la solicitud. Revisá los datos o intentá de nuevo en unos momentos.";
}
