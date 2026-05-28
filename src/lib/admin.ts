import type { User } from "@supabase/supabase-js";

function parseList(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/[,;]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function parseUuidList(raw: string | undefined): string[] {
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return parseList(raw).filter((id) => uuidRe.test(id));
}

/** IDs de Supabase Auth permitidos como admin (server-only, `COLEX_ADMIN_USER_IDS`). */
export function getAdminUserIds(): string[] {
  return parseUuidList(process.env.COLEX_ADMIN_USER_IDS);
}

/** Emails permitidos como admin (server-only, `COLEX_ADMIN_EMAILS`). */
export function getAdminEmails(): string[] {
  return parseList(process.env.COLEX_ADMIN_EMAILS);
}

export function isColexAdminUser(user: Pick<User, "id" | "email"> | null | undefined): boolean {
  if (!user?.id) return false;

  const allowedIds = getAdminUserIds();
  if (allowedIds.length > 0 && allowedIds.includes(user.id.toLowerCase())) {
    return true;
  }

  const allowedEmails = getAdminEmails();
  const email = user.email?.trim().toLowerCase();
  if (allowedEmails.length > 0 && email && allowedEmails.includes(email)) {
    return true;
  }

  return false;
}

export function adminConfigError(): string | null {
  if (getAdminUserIds().length === 0 && getAdminEmails().length === 0) {
    return "Configurá COLEX_ADMIN_USER_IDS o COLEX_ADMIN_EMAILS en el entorno del servidor.";
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return "Falta SUPABASE_SERVICE_ROLE_KEY para operaciones de administración.";
  }
  return null;
}
