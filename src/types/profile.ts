/** Fila `public.profiles`: columnas en `supabase/migrations/20260515000000_profiles_editable_columns.sql`. */
export type ProfileRow = {
  id: string;
  email: string | null;
  username: string | null;
  full_name: string | null;
  phone: string | null;
  institution: string | null;
  bio: string | null;
  location: string | null;
  avatar_url?: string | null;
  business_name?: string | null;
  business_description?: string | null;
  shop_slug?: string | null;
  shop_banner_url?: string | null;
  shop_description?: string | null;
  shop_social_links?: unknown;
  is_premium?: boolean;
  is_featured?: boolean;
  created_at?: string;
  updated_at?: string | null;
};
