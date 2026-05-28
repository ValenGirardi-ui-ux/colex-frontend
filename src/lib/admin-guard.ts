import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import {
  adminConfigError,
  getAdminEmails,
  getAdminUserIds,
  isColexAdminUser,
} from "@/src/lib/admin";
import { createServerSupabaseClient } from "@/src/lib/supabase/server";

/** TODO: poner en false cuando termine el debug de acceso a /admin */
export const ADMIN_GUARD_DEBUG_MODE = true;

export type AdminAccessDebugStep = "adminConfigError" | "missing_session" | "not_admin";

export type AdminAccessDebugInfo = {
  reason: string;
  step: AdminAccessDebugStep;
  hasSession: boolean;
  userEmail: string | null;
  userId: string | null;
  allowedEmails: string[];
  allowedUserIds: string[];
  hasServiceRoleKey: boolean;
};

export type AdminAccessResult =
  | { allowed: true; user: User }
  | { allowed: false; debug: AdminAccessDebugInfo };

function hasServiceRoleKeyEnv(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

function logAdminGuard(message: string, payload: Record<string, unknown>): void {
  if (!ADMIN_GUARD_DEBUG_MODE) return;
  console.info(`[Colex admin guard] ${message}`, payload);
}

export async function getSessionUser(): Promise<User | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      logAdminGuard("getSessionUser: error de Supabase Auth", {
        errorMessage: error.message,
        errorStatus: error.status ?? null,
      });
      return null;
    }

    if (!user) {
      logAdminGuard("getSessionUser: sin usuario en sesión", {
        userId: null,
        userEmail: null,
      });
      return null;
    }

    logAdminGuard("getSessionUser: sesión OK", {
      userId: user.id,
      userEmail: user.email ?? null,
    });
    return user;
  } catch (err) {
    logAdminGuard("getSessionUser: excepción", {
      errorMessage: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

export async function evaluateAdminAccess(): Promise<AdminAccessResult> {
  const allowedUserIds = getAdminUserIds();
  const allowedEmails = getAdminEmails();
  const hasServiceRoleKey = hasServiceRoleKeyEnv();

  logAdminGuard("evaluateAdminAccess: inicio", {
    allowedEmails,
    allowedUserIds,
    hasServiceRoleKey,
    rawEnv: {
      COLEX_ADMIN_EMAILS_set: Boolean(process.env.COLEX_ADMIN_EMAILS?.trim()),
      COLEX_ADMIN_USER_IDS_set: Boolean(process.env.COLEX_ADMIN_USER_IDS?.trim()),
      SUPABASE_SERVICE_ROLE_KEY_set: hasServiceRoleKey,
    },
  });

  const configErr = adminConfigError();
  if (configErr) {
    const debug: AdminAccessDebugInfo = {
      reason: configErr,
      step: "adminConfigError",
      hasSession: false,
      userEmail: null,
      userId: null,
      allowedEmails,
      allowedUserIds,
      hasServiceRoleKey,
    };
    logAdminGuard("acceso denegado", debug);
    console.error("[Colex admin]", configErr);
    return { allowed: false, debug };
  }

  const user = await getSessionUser();
  if (!user) {
    const debug: AdminAccessDebugInfo = {
      reason: "No hay sesión activa (supabase.auth.getUser() no devolvió usuario).",
      step: "missing_session",
      hasSession: false,
      userEmail: null,
      userId: null,
      allowedEmails,
      allowedUserIds,
      hasServiceRoleKey,
    };
    logAdminGuard("acceso denegado", debug);
    return { allowed: false, debug };
  }

  if (!isColexAdminUser(user)) {
    const debug: AdminAccessDebugInfo = {
      reason: "Usuario logueado no está en COLEX_ADMIN_USER_IDS ni en COLEX_ADMIN_EMAILS.",
      step: "not_admin",
      hasSession: true,
      userEmail: user.email ?? null,
      userId: user.id,
      allowedEmails,
      allowedUserIds,
      hasServiceRoleKey,
    };
    logAdminGuard("acceso denegado", debug);
    return { allowed: false, debug };
  }

  logAdminGuard("acceso permitido", {
    userId: user.id,
    userEmail: user.email ?? null,
  });

  return { allowed: true, user };
}

/** Redirige a home si no hay sesión admin válida (salvo en modo debug: el layout muestra el panel). */
export async function requireAdminUser(): Promise<User> {
  const result = await evaluateAdminAccess();
  if (result.allowed) return result.user;

  if (ADMIN_GUARD_DEBUG_MODE) {
    throw new Error(
      "Admin guard en modo debug: usá evaluateAdminAccess() en el layout, no requireAdminUser().",
    );
  }

  redirect("/");
}
