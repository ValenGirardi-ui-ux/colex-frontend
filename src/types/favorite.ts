/** Fila `public.favorites` — ver `supabase/migrations/20260515100000_favorites.sql`. */
export type FavoriteRow = {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
};
