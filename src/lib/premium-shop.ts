import type { ProfileRow } from "@/src/types/profile";
import type { ShopSocialLinks } from "@/src/types/shop";

export function premiumShopPath(slug: string): string {
  return `/tienda/${encodeURIComponent(slug.trim().toLowerCase())}`;
}

export function canHavePremiumShop(profile: Pick<ProfileRow, "is_premium"> | null | undefined): boolean {
  return profile?.is_premium === true;
}

export function profileHasPublishedShop(
  profile: Pick<ProfileRow, "is_premium" | "shop_slug"> | null | undefined,
): boolean {
  return canHavePremiumShop(profile) && Boolean(profile?.shop_slug?.trim());
}

export function resolvePublicShopHref(
  profile: Pick<ProfileRow, "id" | "is_premium" | "shop_slug">,
  fallbackProfilePath: string,
): string {
  const slug = profile.shop_slug?.trim();
  if (profile.is_premium === true && slug) {
    return premiumShopPath(slug);
  }
  return fallbackProfilePath;
}

export function parseShopSocialLinks(raw: unknown): ShopSocialLinks {
  if (!raw || typeof raw !== "object") return {};
  const r = raw as Record<string, unknown>;
  const pick = (key: keyof ShopSocialLinks) => {
    const v = r[key];
    return typeof v === "string" && v.trim() ? v.trim() : null;
  };
  return {
    instagram: pick("instagram"),
    facebook: pick("facebook"),
    tiktok: pick("tiktok"),
    whatsapp: pick("whatsapp"),
    website: pick("website"),
  };
}

export function shopSocialLinksForSave(links: ShopSocialLinks): ShopSocialLinks {
  const trimUrl = (v: string | null | undefined) => {
    const t = v?.trim();
    return t || null;
  };
  return {
    instagram: trimUrl(links.instagram),
    facebook: trimUrl(links.facebook),
    tiktok: trimUrl(links.tiktok),
    whatsapp: trimUrl(links.whatsapp),
    website: trimUrl(links.website),
  };
}

export function hasAnySocialLink(links: ShopSocialLinks): boolean {
  return Object.values(links).some((v) => Boolean(v?.trim()));
}
