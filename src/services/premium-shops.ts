import { displayNameFromEmail } from "@/src/lib/auth-profile";
import { isPremiumEntitled } from "@/src/lib/premium-access";
import {
  canHavePremiumShop,
  parseShopSocialLinks,
  shopSocialLinksForSave,
} from "@/src/lib/premium-shop";
import { premiumShopPath } from "@/src/lib/premium-shop";
import { isProfileVerified } from "@/src/lib/profile-verified";
import { normalizeShopSlug, validateShopSlug } from "@/src/lib/shop-slug";
import { getCurrentUser } from "@/src/services/auth";
import { fetchProfileByUserId, isUserUuid } from "@/src/services/profiles";
import { hasSupabaseEnv, supabase } from "@/src/lib/supabase/client";
import type { ProfileRow } from "@/src/types/profile";
import type { PremiumShop, PremiumShopSettingsInput } from "@/src/types/shop";

export { premiumShopPath };

const SHOP_PROFILE_SELECT =
  "id,email,username,full_name,phone,institution,bio,location,avatar_url,business_name,business_description,shop_slug,shop_banner_url,shop_description,shop_social_links,is_premium,is_featured,created_at,updated_at" as const;

type ShopProfileRow = ProfileRow & {
  shop_slug?: string | null;
  shop_banner_url?: string | null;
  shop_description?: string | null;
  shop_social_links?: unknown;
};

function isUuid(value: string): boolean {
  return isUserUuid(value);
}

function isShopSchemaError(message: string): boolean {
  const m = message.toLowerCase();
  return m.includes("shop_slug") || m.includes("shop_banner") || m.includes("shop_description");
}

function shopRowFromUnknown(data: unknown): ShopProfileRow | null {
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
    created_at: typeof r.created_at === "string" ? r.created_at : undefined,
    updated_at: typeof r.updated_at === "string" ? r.updated_at : null,
  };
}

function businessDisplayName(row: ShopProfileRow): string {
  const bn = row.business_name?.trim();
  if (bn) return bn;
  const full = row.full_name?.trim();
  if (full) return full;
  const user = row.username?.trim();
  if (user) return user;
  const email = row.email?.trim();
  if (email) return displayNameFromEmail(email);
  return "Tienda";
}

function rowToPremiumShop(row: ShopProfileRow): PremiumShop | null {
  const slug = row.shop_slug?.trim();
  if (!isPremiumEntitled(row) || !slug) return null;
  return {
    userId: row.id,
    slug,
    businessName: businessDisplayName(row),
    shortDescription: row.business_description?.trim() || null,
    description: row.shop_description?.trim() || row.business_description?.trim() || row.bio?.trim() || null,
    location: row.location?.trim() || null,
    institution: row.institution?.trim() || null,
    avatarUrl: row.avatar_url?.trim() || null,
    bannerUrl: row.shop_banner_url?.trim() || null,
    socialLinks: parseShopSocialLinks(row.shop_social_links),
    isPremium: true,
    isVerified: isProfileVerified(row),
  };
}

export function formatShopErrorForUser(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("profiles_shop_slug_lower_unique") || (m.includes("duplicate") && m.includes("shop_slug"))) {
    return "Ese slug ya está en uso. Elegí otro.";
  }
  if (m.includes("shop_slug") && m.includes("schema")) {
    return "Falta la migración de tiendas premium. Ejecutá supabase/migrations/20260516400000_profiles_premium_shop.sql.";
  }
  return message || "No se pudo guardar la tienda.";
}

export async function isShopSlugTaken(slug: string, excludeUserId?: string): Promise<boolean> {
  if (!hasSupabaseEnv) return false;
  const normalized = normalizeShopSlug(slug);
  if (!normalized) return false;

  let query = supabase.from("profiles").select("id").ilike("shop_slug", normalized).limit(1);
  if (excludeUserId && isUuid(excludeUserId)) {
    query = query.neq("id", excludeUserId);
  }

  const { data, error } = await query;
  if (error) {
    if (isShopSchemaError(error.message)) return false;
    console.warn("[Colex shops] slug check", error.message);
    return false;
  }
  return (data?.length ?? 0) > 0;
}

export async function fetchPremiumShopBySlug(slug: string): Promise<PremiumShop | null> {
  if (!hasSupabaseEnv) return null;
  const normalized = normalizeShopSlug(slug);
  if (!normalized) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select(SHOP_PROFILE_SELECT)
    .ilike("shop_slug", normalized)
    .eq("is_premium", true)
    .maybeSingle();
  // Acceso vigente validado en rowToPremiumShop (período de suscripción).

  if (error || !data) {
    if (error) console.warn("[Colex shops] by slug", error.message);
    return null;
  }

  const row = shopRowFromUnknown(data);
  if (!row) return null;
  return rowToPremiumShop(row);
}

export async function fetchPremiumShopByUserId(userId: string): Promise<PremiumShop | null> {
  if (!hasSupabaseEnv || !isUuid(userId)) return null;
  const { profile, error } = await fetchProfileByUserId(userId);
  if (error || !profile) return null;
  const row = shopRowFromUnknown(profile);
  if (!row) return null;
  return rowToPremiumShop(row);
}

/**
 * Guarda negocio + tienda premium (solo `is_premium`).
 * Slug obligatorio para publicar tienda en /tienda/[slug].
 */
export async function savePremiumShopSettings(
  fields: PremiumShopSettingsInput,
): Promise<{ error: string | null; shopPath: string | null }> {
  const user = await getCurrentUser();
  if (!user?.id || !isUuid(user.id)) {
    return { error: "Iniciá sesión para guardar tu tienda.", shopPath: null };
  }
  const userId = user.id;

  const { profile, error: fetchErr } = await fetchProfileByUserId(userId);
  if (fetchErr && !isShopSchemaError(fetchErr)) {
    return { error: fetchErr, shopPath: null };
  }
  if (!profile || !canHavePremiumShop(profile)) {
    return { error: "Necesitás Colex Premium para configurar tu tienda.", shopPath: null };
  }

  if (!fields.businessName.trim()) {
    return { error: "Ingresá el nombre de tu negocio.", shopPath: null };
  }

  const slugValidation = validateShopSlug(fields.shopSlug);
  if (!slugValidation.ok) {
    return { error: slugValidation.error, shopPath: null };
  }

  const taken = await isShopSlugTaken(slugValidation.slug, userId);
  if (taken) {
    return { error: "Ese slug ya está en uso. Elegí otro.", shopPath: null };
  }

  const { data: updated, error } = await supabase
    .from("profiles")
    .update({
      business_name: fields.businessName.trim(),
      institution: fields.institution.trim() || null,
      business_description: fields.businessDescription.trim() || null,
      shop_description: fields.shopDescription.trim() || null,
      location: fields.location.trim() || null,
      avatar_url: fields.avatarUrl?.trim() || null,
      shop_banner_url: fields.bannerUrl?.trim() || null,
      shop_slug: slugValidation.slug,
      shop_social_links: shopSocialLinksForSave(fields.socialLinks),
    })
    .eq("id", userId)
    .select("id,shop_slug")
    .maybeSingle();

  if (error) {
    return { error: formatShopErrorForUser(error.message), shopPath: null };
  }
  if (!updated?.id) {
    return {
      error: "No se pudo guardar. Verificá que tu perfil exista en Supabase y que la sesión sea la misma cuenta.",
      shopPath: null,
    };
  }

  return { error: null, shopPath: premiumShopPath(slugValidation.slug) };
}
