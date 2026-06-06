export type AdminUserRow = {
  id: string;
  email: string | null;
  fullName: string | null;
  username: string | null;
  createdAt: string | null;
  isPremium: boolean;
  isFeatured: boolean;
  shopSlug: string | null;
};

export type AdminCreateUserInput = {
  email: string;
  password: string;
  fullName: string;
};

export type AdminMetrics = {
  registeredUsers: number;
  activeListings: number;
  pausedListings: number;
  soldListings: number;
  premiumShops: number;
  featuredBusinesses: number;
  totalOrders: number;
  pendingReports: number;
};

export type AdminProductRow = {
  id: string;
  title: string;
  category: string;
  status: string;
  price: number;
  createdAt: string;
  sellerId: string;
  sellerEmail: string | null;
  sellerName: string | null;
};

export type AdminReportRow = {
  id: string;
  productId: string;
  productTitle: string;
  reporterId: string | null;
  reporterEmail: string | null;
  reason: string;
  status: "pending" | "reviewed";
  createdAt: string;
  reviewedAt: string | null;
};

export type AdminSection = "dashboard" | "usuarios" | "publicaciones" | "reportes";
