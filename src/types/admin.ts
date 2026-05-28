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
