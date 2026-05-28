export type NotificationType = "purchase_interest" | "new_message" | "order_status";

export type AppNotification = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
};
