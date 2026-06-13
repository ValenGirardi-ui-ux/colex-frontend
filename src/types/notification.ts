export type NotificationType =
  | "purchase_interest"
  | "new_message"
  | "order_status"
  | "product_favorited";

export type AppNotification = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  /** Publicación relacionada (p. ej. favorito). */
  related_product_id?: string | null;
  /** Usuario que generó la acción (p. ej. quien marcó favorito). */
  actor_user_id?: string | null;
};
