import type { User } from "@supabase/supabase-js";
import { displayNameFromEmail, publicProfileFromRow } from "@/src/lib/auth-profile";
import { isProfileVerified } from "@/src/lib/profile-verified";
import type { Product } from "@/src/types/product";
import { getMockProfileById, type MockPublicProfile } from "@/src/data/mockProfiles";
import { hasSupabaseEnv, supabase } from "@/src/lib/supabase/client";
import type { ProfileRow } from "@/src/types/profile";
import type { ReviewSummary } from "@/src/types/review";

export function isUserUuid(value: string | null | undefined): boolean {
  if (!value?.trim()) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.trim());
}

function isUuid(value: string): boolean {
  return isUserUuid(value);
}

function isProfileSchemaColumnError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("column") &&
    (m.includes("does not exist") || m.includes("schema cache") || m.includes("could not find"))
  );
}

export function sellerProfilePath(userId: string): string {
  return `/perfil/${encodeURIComponent(userId)}`;
}

export type SellerPreview = {
  id: string;
  displayName: string;
  username: string | null;
  href: string;
  isVerified: boolean;
  reviewSummary: ReviewSummary | null;
};

/** Resumen del vendedor para la ficha de producto. */
export async function getSellerPreview(userId: string): Promise<SellerPreview | null> {
  const profile = await resolvePublicProfile(userId);
  if (!profile) return null;
  let summary: ReviewSummary | null =
    profile.reviewSummary && profile.reviewSummary.count > 0 ? profile.reviewSummary : null;
  if (!summary && isUuid(userId)) {
    const { fetchReviewSummaryForUser } = await import("@/src/services/reviews");
    const fetched = await fetchReviewSummaryForUser(userId);
    summary = fetched.count > 0 ? fetched : null;
  }
  return {
    id: userId,
    displayName: profile.displayName,
    username: profile.username ?? null,
    href: sellerProfilePath(userId),
    isVerified: profile.isVerified === true,
    reviewSummary: summary,
  };
}

const VERIFIED_FLAGS_SELECT = "id,is_premium,is_featured" as const;

type SellerFlags = { verified: boolean; premium: boolean };

/** Mapa userId → badges de vendedor (premium / destacado). */
export async function fetchSellerFlagsByUserIds(userIds: string[]): Promise<Map<string, SellerFlags>> {
  const map = new Map<string, SellerFlags>();
  const unique = [...new Set(userIds.filter(isUuid))];
  if (!hasSupabaseEnv || unique.length === 0) return map;

  const { data, error } = await supabase.from("profiles").select(VERIFIED_FLAGS_SELECT).in("id", unique);
  if (error || !data) return map;

  for (const raw of data) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    const id = typeof r.id === "string" ? r.id : null;
    if (!id) continue;
    const row = { is_premium: r.is_premium === true, is_featured: r.is_featured === true };
    map.set(id, { verified: isProfileVerified(row), premium: row.is_premium });
  }
  return map;
}

/** Mapa userId → verificado (premium o destacado). */
export async function fetchVerifiedFlagsByUserIds(userIds: string[]): Promise<Map<string, boolean>> {
  const flags = await fetchSellerFlagsByUserIds(userIds);
  const map = new Map<string, boolean>();
  for (const [id, f] of flags) map.set(id, f.verified);
  return map;
}

/** Añade `seller_verified` y `seller_premium` según el perfil del vendedor. */
export async function enrichProductsWithSellerVerified(products: Product[]): Promise<Product[]> {
  if (products.length === 0) return products;
  const flags = await fetchSellerFlagsByUserIds(products.map((p) => p.user_id));
  return products.map((p) => {
    const f = flags.get(p.user_id);
    return {
      ...p,
      seller_verified: f?.verified ?? false,
      seller_premium: f?.premium ?? false,
    };
  });
}

/** Perfil público: Supabase si es UUID; si no, mocks por id legacy. */
export async function resolvePublicProfile(userId: string): Promise<MockPublicProfile | null> {
  const mock = getMockProfileById(userId);
  if (!hasSupabaseEnv || !isUuid(userId)) {
    return mock ?? null;
  }

  const { profile, error } = await fetchProfileByUserId(userId);
  if (profile) return publicProfileFromRow(profile);
  if (error) {
    console.warn("[Colex profiles] perfil público", userId, error);
  }
  return mock ?? null;
}

/** Columnas base de `profiles` (sin tienda premium). */
const PROFILE_CORE_SELECT =
  "id,email,username,full_name,phone,institution,bio,location,avatar_url,business_name,business_description,is_premium,is_featured,created_at,updated_at" as const;

/** Incluye tienda premium (`20260516400000_profiles_premium_shop.sql`). */
const PROFILE_ROW_SELECT =
  `${PROFILE_CORE_SELECT},shop_slug,shop_banner_url,shop_description,shop_social_links,premium_started_at,premium_current_period_end,premium_cancel_at_period_end,premium_last_payment_at,premium_payment_provider,premium_payment_ref` as const;

async function queryProfileRow(
  userId: string,
  select: string,
): Promise<{ data: unknown; error: string | null }> {
  const { data, error } = await supabase.from("profiles").select(select).eq("id", userId).maybeSingle();
  return { data, error: error?.message ?? null };
}

function rowFromUnknown(data: unknown): ProfileRow | null {
  if (!data || typeof data !== "object") return null;
  const r = data as Record<string, unknown>;
  const id = typeof r.id === "string" ? r.id : null;
  if (!id) return null;
  return {
    id,
    email: typeof r.email === "string" ? r.email : null,
    username: typeof r.username === "string" ? r.username : null,
    full_name: typeof r.full_name === "string" ? r.full_name : null,
    phone: typeof r.phone === "string" ? r.phone : null,
    institution: typeof r.institution === "string" ? r.institution : null,
    bio: typeof r.bio === "string" ? r.bio : null,
    location: typeof r.location === "string" ? r.location : null,
    avatar_url: typeof r.avatar_url === "string" ? r.avatar_url : null,
    business_name: typeof r.business_name === "string" ? r.business_name : null,
    business_description: typeof r.business_description === "string" ? r.business_description : null,
    shop_slug: typeof r.shop_slug === "string" ? r.shop_slug : null,
    shop_banner_url: typeof r.shop_banner_url === "string" ? r.shop_banner_url : null,
    shop_description: typeof r.shop_description === "string" ? r.shop_description : null,
    shop_social_links: r.shop_social_links,
    is_premium: r.is_premium === true,
    is_featured: r.is_featured === true,
    premium_started_at: typeof r.premium_started_at === "string" ? r.premium_started_at : null,
    premium_current_period_end:
      typeof r.premium_current_period_end === "string" ? r.premium_current_period_end : null,
    premium_cancel_at_period_end: r.premium_cancel_at_period_end === true,
    premium_last_payment_at: typeof r.premium_last_payment_at === "string" ? r.premium_last_payment_at : null,
    premium_payment_provider: typeof r.premium_payment_provider === "string" ? r.premium_payment_provider : null,
    premium_payment_ref: typeof r.premium_payment_ref === "string" ? r.premium_payment_ref : null,
    created_at: typeof r.created_at === "string" ? r.created_at : undefined,
    updated_at: typeof r.updated_at === "string" ? r.updated_at : null,
  };
}

export async function fetchProfileByUserId(userId: string): Promise<{ profile: ProfileRow | null; error: string | null }> {
  if (!hasSupabaseEnv) return { profile: null, error: null };
  if (!isUuid(userId)) {
    return { profile: null, error: "ID de usuario inválido." };
  }

  let { data, error } = await queryProfileRow(userId, PROFILE_ROW_SELECT);
  if (error && isProfileSchemaColumnError(error)) {
    ({ data, error } = await queryProfileRow(userId, PROFILE_CORE_SELECT));
  }
  if (error) return { profile: null, error };
  return { profile: rowFromUnknown(data), error: null };
}

export async function fetchProfilesByUserIds(userIds: string[]): Promise<Map<string, ProfileRow>> {
  const map = new Map<string, ProfileRow>();
  const unique = [...new Set(userIds.filter(isUuid))];
  if (!hasSupabaseEnv || unique.length === 0) return map;

  const full = await supabase.from("profiles").select(PROFILE_ROW_SELECT).in("id", unique);
  let rows: unknown[] | null = full.data;
  let loadError = full.error;
  if (loadError?.message && isProfileSchemaColumnError(loadError.message)) {
    const fallback = await supabase.from("profiles").select(PROFILE_CORE_SELECT).in("id", unique);
    rows = fallback.data;
    loadError = fallback.error;
  }
  if (loadError || !rows) return map;

  for (const row of rows) {
    const profile = rowFromUnknown(row);
    if (profile) map.set(profile.id, profile);
  }
  return map;
}

/**
 * Garantiza una fila `profiles` para el usuario (insert si no existe).
 * Valores iniciales: `email`, `username` = parte local del email, `full_name` desde metadata o username.
 */
export async function ensureProfileForUser(user: User): Promise<{ profile: ProfileRow | null; error: string | null }> {
  const email = user.email?.trim() ?? "";
  const defaultUsername = email ? displayNameFromEmail(email) : "usuario";
  const metaName =
    user.user_metadata && typeof user.user_metadata.full_name === "string"
      ? String(user.user_metadata.full_name).trim()
      : "";

  const { data: existing, error: selErr } = await supabase.from("profiles").select(PROFILE_ROW_SELECT).eq("id", user.id).maybeSingle();
  if (selErr) return { profile: null, error: selErr.message };
  if (existing) return { profile: rowFromUnknown(existing), error: null };

  const insertRow = {
    id: user.id,
    email: email || null,
    username: defaultUsername,
    full_name: metaName || defaultUsername,
    phone: null,
    institution: null,
    bio: null,
    location: null,
  };

  const { data: inserted, error: insErr } = await supabase
    .from("profiles")
    .insert(insertRow)
    .select(PROFILE_ROW_SELECT)
    .maybeSingle();
  if (!insErr && inserted) return { profile: rowFromUnknown(inserted), error: null };

  if (insErr) {
    const { data: again } = await supabase.from("profiles").select(PROFILE_ROW_SELECT).eq("id", user.id).maybeSingle();
    if (again) return { profile: rowFromUnknown(again), error: null };
    return { profile: null, error: insErr.message };
  }

  return { profile: null, error: "No se pudo crear el perfil." };
}

/** Tras registro/login: actualiza o inserta nombre/email sin borrar columnas opcionales. */
export async function syncProfileAfterAuthSignup(params: {
  userId: string;
  email: string;
  fullName: string;
}): Promise<{ error: string | null }> {
  const username = displayNameFromEmail(params.email);
  const { data: existing, error: selErr } = await supabase.from("profiles").select("id").eq("id", params.userId).maybeSingle();
  if (selErr) return { error: selErr.message };

  if (existing) {
    const { error } = await supabase
      .from("profiles")
      .update({
        email: params.email.trim(),
        full_name: params.fullName.trim(),
      })
      .eq("id", params.userId);
    return { error: error?.message ?? null };
  }

  const { error } = await supabase.from("profiles").insert({
    id: params.userId,
    email: params.email.trim(),
    full_name: params.fullName.trim(),
    username,
    phone: null,
    institution: null,
    bio: null,
    location: null,
  });
  return { error: error?.message ?? null };
}

export type ProfileEditableFields = {
  fullName: string;
  username: string;
  phone: string;
  institution: string;
  bio: string;
  location: string;
};

/**
 * Guarda edición del perfil del usuario autenticado (tabla `profiles`).
 * Requiere RLS: insert/update solo donde `auth.uid() = id`.
 */
export async function saveOwnProfile(
  userId: string,
  authEmail: string,
  fields: ProfileEditableFields,
): Promise<{ error: string | null }> {
  const username = fields.username.trim() || displayNameFromEmail(authEmail);
  const payload = {
    full_name: fields.fullName.trim() || username,
    username,
    phone: fields.phone.trim() || null,
    institution: fields.institution.trim() || null,
    bio: fields.bio.trim() || null,
    location: fields.location.trim() || null,
    email: authEmail.trim(),
  };

  const { data: existing, error: selErr } = await supabase.from("profiles").select("id").eq("id", userId).maybeSingle();
  if (selErr) return { error: selErr.message };

  if (existing) {
    const { error } = await supabase.from("profiles").update(payload).eq("id", userId);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("profiles").insert({
      id: userId,
      ...payload,
    });
    if (error) return { error: error.message };
  }

  const { error: metaErr } = await supabase.auth.updateUser({
    data: { full_name: fields.fullName.trim() },
  });
  if (metaErr) {
    console.warn("[Colex profiles] auth.updateUser metadata:", metaErr.message);
  }

  return { error: null };
}

export type PremiumBusinessFields = {
  businessName: string;
  institution: string;
  businessDescription: string;
  avatarUrl: string | null;
};

/**
 * Configuración del negocio en carrusel (solo usuarios Premium o destacados).
 */
/** @deprecated Usar `savePremiumShopSettings` desde `@/src/services/premium-shops`. */
export async function savePremiumBusinessProfile(
  _userId: string,
  fields: PremiumBusinessFields,
): Promise<{ error: string | null }> {
  const { savePremiumShopSettings } = await import("@/src/services/premium-shops");
  const { profile } = await fetchProfileByUserId(_userId);
  const { error } = await savePremiumShopSettings({
    businessName: fields.businessName,
    institution: fields.institution,
    businessDescription: fields.businessDescription,
    shopDescription: profile?.shop_description?.trim() ?? fields.businessDescription,
    location: profile?.location?.trim() ?? "",
    avatarUrl: fields.avatarUrl,
    bannerUrl: profile?.shop_banner_url?.trim() || null,
    shopSlug: profile?.shop_slug?.trim() ?? "",
    socialLinks: {},
  });
  return { error };
}
