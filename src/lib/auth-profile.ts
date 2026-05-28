import type { User } from "@supabase/supabase-js";
import type { MockPublicProfile } from "@/src/data/mockProfiles";
import { profileTaglineFromFields } from "@/src/lib/profile-tagline";
import { isProfileVerified } from "@/src/lib/profile-verified";
import { profileHasPublishedShop } from "@/src/lib/premium-shop";
import type { ProfileRow } from "@/src/types/profile";

/** Parte local del email (antes de @), sin espacios. */
export function displayNameFromEmail(email: string | null | undefined): string {
  if (!email?.trim()) return "Usuario";
  const local = email.trim().split("@")[0];
  return local?.trim() || "Usuario";
}

/**
 * Perfil público de UI combinando Auth y fila `profiles` (si existe).
 */
export function publicProfileFromUserAndRow(user: User, row: ProfileRow | null): MockPublicProfile {
  const email = user.email?.trim() ?? row?.email?.trim() ?? "";
  const defaultUser = email ? displayNameFromEmail(email) : "usuario";
  const username = row?.username?.trim() || defaultUser;
  const fullName = row?.full_name?.trim();
  const displayName = fullName || username || (email ? displayNameFromEmail(email) : "Usuario");
  const handle = email || "Sin email en la cuenta";
  const location = row?.location?.trim() || "No indicada";
  const institution = row?.institution?.trim() ?? null;
  const bioRaw = row?.bio?.trim();
  const bio = bioRaw || "Sin biografía todavía.";
  const phone = row?.phone?.trim() || null;
  const visibleContact = phone ? phone : "Solo mensajes por Colex";
  const memberSinceIso = row?.created_at || user.created_at || new Date().toISOString();

  return {
    id: user.id,
    displayName,
    handle,
    username: row?.username?.trim() || username,
    phone: phone || null,
    avatarUrl: typeof user.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : null,
    location,
    institution,
    memberSinceIso,
    bio,
    visibleContact,
    salesCount: 0,
    purchasesCount: 0,
    accountEmail: email || null,
    isVerified: isProfileVerified(row),
    shopSlug: row?.shop_slug?.trim() || null,
    isPremiumStore: profileHasPublishedShop(row),
    profileTagline: profileTaglineFromFields(row),
  };
}

/**
 * @deprecated Usar `publicProfileFromUserAndRow` con fila de `profiles`.
 */
export function publicProfileFromAuthUser(user: User): MockPublicProfile {
  return publicProfileFromUserAndRow(user, null);
}

/** Perfil público a partir de la fila `profiles` (p. ej. vendedor en ficha o /perfil/[id]). */
export function publicProfileFromRow(row: ProfileRow): MockPublicProfile {
  const email = row.email?.trim() ?? "";
  const defaultUser = email ? displayNameFromEmail(email) : "usuario";
  const username = row.username?.trim() || defaultUser;
  const fullName = row.full_name?.trim();
  const displayName = fullName || username || "Usuario";
  const handle = email || `@${username}`;
  const location = row.location?.trim() || "No indicada";
  const institution = row.institution?.trim() ?? null;
  const bioRaw = row.bio?.trim();
  const bio = bioRaw || "Sin biografía todavía.";
  const phone = row.phone?.trim() || null;
  const visibleContact = phone ? phone : "Solo mensajes por Colex";
  const memberSinceIso = row.created_at || new Date().toISOString();

  return {
    id: row.id,
    displayName,
    handle,
    username: row.username?.trim() || username,
    phone: phone || null,
    avatarUrl: row.avatar_url?.trim() || null,
    location,
    institution,
    memberSinceIso,
    bio,
    visibleContact,
    salesCount: 0,
    purchasesCount: 0,
    accountEmail: email || null,
    isVerified: isProfileVerified(row),
    shopSlug: row.shop_slug?.trim() || null,
    isPremiumStore: profileHasPublishedShop(row),
    profileTagline: profileTaglineFromFields(row),
  };
}
