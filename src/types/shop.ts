export type ShopSocialLinks = {
  instagram?: string | null;
  facebook?: string | null;
  tiktok?: string | null;
  whatsapp?: string | null;
  website?: string | null;
};

export type PremiumShop = {
  userId: string;
  slug: string;
  businessName: string;
  shortDescription: string | null;
  description: string | null;
  location: string | null;
  institution: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  socialLinks: ShopSocialLinks;
  isPremium: boolean;
  isVerified: boolean;
};

export type PremiumShopSettingsInput = {
  businessName: string;
  institution: string;
  businessDescription: string;
  shopDescription: string;
  location: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  shopSlug: string;
  socialLinks: ShopSocialLinks;
};
