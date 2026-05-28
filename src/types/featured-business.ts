export type FeaturedBusiness = {
  id: string;
  displayName: string;
  subtitle: string | null;
  avatarUrl: string | null;
  initials: string;
  href: string;
  profileHref: string;
  isVerified: boolean;
  hasPremiumShop: boolean;
};
