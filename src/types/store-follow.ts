/** Tienda premium seguida por el usuario actual. */
export type FollowedStore = {
  storeUserId: string;
  businessName: string;
  shopSlug: string | null;
  avatarUrl: string | null;
  subtitle: string | null;
  shopHref: string;
  profileHref: string;
  followedAt: string;
};

export type StoreFollowState = {
  followerCount: number;
  isFollowing: boolean;
  isOwnStore: boolean;
};

/** Payload futuro para notificaciones de actividad de tienda. */
export type StoreNewProductsNotificationPayload = {
  type: "store_new_products";
  storeUserId: string;
  storeDisplayName: string;
  productIds: string[];
};
