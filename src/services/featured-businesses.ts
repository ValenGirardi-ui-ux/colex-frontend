import { displayNameFromEmail } from "@/src/lib/auth-profile";
import { isPremiumEntitled } from "@/src/lib/premium-access";
import { isProfileVerified } from "@/src/lib/profile-verified";
import { hasSupabaseEnv, supabase } from "@/src/lib/supabase/client";
import { initialsFromName } from "@/src/data/mockProfiles";
import { premiumShopPath } from "@/src/lib/premium-shop";
import { sellerProfilePath } from "@/src/services/profiles";
import type { FeaturedBusiness } from "@/src/types/featured-business";

type FeaturedProfileRow = {
  id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
  institution: string | null;
  business_name: string | null;
  business_description: string | null;
  avatar_url: string | null;
  shop_slug: string | null;
  is_premium: boolean;
  is_featured: boolean;
  premium_current_period_end?: string | null;
  premium_cancel_at_period_end?: boolean;
};

function displayNameFromRow(row: FeaturedProfileRow): string {
  const businessName = row.business_name?.trim();
  if (businessName) return businessName;
  const fullName = row.full_name?.trim();
  if (fullName) return fullName;
  const username = row.username?.trim();
  if (username) return username;
  const email = row.email?.trim();
  if (email) return displayNameFromEmail(email);
  return "Negocio";
}

function rowFromUnknown(data: unknown): FeaturedProfileRow | null {
  if (!data || typeof data !== "object") return null;
  const r = data as Record<string, unknown>;
  const id = typeof r.id === "string" ? r.id : null;
  if (!id) return null;
  return {
    id,
    full_name: typeof r.full_name === "string" ? r.full_name : null,
    username: typeof r.username === "string" ? r.username : null,
    email: typeof r.email === "string" ? r.email : null,
    institution: typeof r.institution === "string" ? r.institution : null,
    business_name: typeof r.business_name === "string" ? r.business_name : null,
    business_description: typeof r.business_description === "string" ? r.business_description : null,
    avatar_url: typeof r.avatar_url === "string" && r.avatar_url.trim() ? r.avatar_url.trim() : null,
    shop_slug: typeof r.shop_slug === "string" ? r.shop_slug : null,
    is_premium: r.is_premium === true,
    is_featured: r.is_featured === true,
    premium_current_period_end:
      typeof r.premium_current_period_end === "string" ? r.premium_current_period_end : null,
    premium_cancel_at_period_end: r.premium_cancel_at_period_end === true,
  };
}

function toFeaturedBusiness(row: FeaturedProfileRow): FeaturedBusiness {
  const displayName = displayNameFromRow(row);
  const profileHref = sellerProfilePath(row.id);
  const slug = row.shop_slug?.trim();
  const hasPremiumShop = row.is_premium && Boolean(slug);
  const href = hasPremiumShop && slug ? premiumShopPath(slug) : profileHref;
  return {
    id: row.id,
    displayName,
    subtitle: row.business_description?.trim() || row.institution?.trim() || null,
    avatarUrl: row.avatar_url,
    initials: initialsFromName(displayName),
    href,
    profileHref,
    isVerified: isProfileVerified(row),
    hasPremiumShop,
  };
}

const FEATURED_SELECT =
  "id,full_name,username,email,institution,business_name,business_description,avatar_url,shop_slug,is_premium,is_featured,premium_current_period_end,premium_cancel_at_period_end" as const;

/**
 * Perfiles con plan Premium activo o marcados como destacados (para carrusel en home).
 * Si no hay filas o falla la consulta, devuelve [] (no mostrar sección).
 */
export async function getFeaturedBusinesses(): Promise<FeaturedBusiness[]> {
  if (!hasSupabaseEnv) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select(FEATURED_SELECT)
    .or("is_premium.eq.true,is_featured.eq.true")
    .order("is_premium", { ascending: false })
    .order("full_name", { ascending: true });

  if (error) {
    console.warn("[Colex featured-businesses]", error.message);
    return [];
  }

  const businesses: FeaturedBusiness[] = [];
  for (const raw of data ?? []) {
    const row = rowFromUnknown(raw);
    if (!row || (!row.is_premium && !row.is_featured)) continue;
    if (row.is_premium && !row.is_featured && !isPremiumEntitled(row)) continue;
    businesses.push(toFeaturedBusiness(row));
  }

  return businesses;
}
