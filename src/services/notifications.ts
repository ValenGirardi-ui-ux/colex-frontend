import { hasSupabaseEnv, supabase } from "@/src/lib/supabase/client";
import type { AppNotification, NotificationType } from "@/src/types/notification";

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function rowToNotification(row: Record<string, unknown>): AppNotification {
  return {
    id: String(row.id ?? ""),
    user_id: String(row.user_id ?? ""),
    type: row.type as NotificationType,
    title: String(row.title ?? ""),
    message: String(row.message ?? ""),
    read: Boolean(row.read),
    created_at: String(row.created_at ?? new Date().toISOString()),
  };
}

export function notificationHref(notification: AppNotification): string {
  switch (notification.type) {
    case "purchase_interest":
      return "/perfil?tab=ventas";
    case "new_message":
      return "/mensajes";
    case "order_status":
      return "/perfil?tab=compras";
    default:
      return "/";
  }
}

export async function createNotification(input: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
}): Promise<{ id: string | null; error: string | null }> {
  if (!hasSupabaseEnv || !isUuid(input.userId)) {
    return { id: null, error: null };
  }

  const { data, error } = await supabase.rpc("create_notification", {
    p_user_id: input.userId,
    p_type: input.type,
    p_title: input.title.trim(),
    p_message: input.message.trim(),
  });

  if (error) {
    return { id: null, error: error.message };
  }

  return { id: data != null ? String(data) : null, error: null };
}

export async function fetchNotifications(
  userId: string,
  limit = 30,
): Promise<{ notifications: AppNotification[]; error: string | null }> {
  if (!hasSupabaseEnv || !isUuid(userId)) {
    return { notifications: [], error: null };
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { notifications: [], error: error.message };
  }

  return {
    notifications: (data ?? []).map((row) => rowToNotification(row as Record<string, unknown>)),
    error: null,
  };
}

export async function fetchUnreadNotificationCount(
  userId: string,
): Promise<{ count: number; error: string | null }> {
  if (!hasSupabaseEnv || !isUuid(userId)) {
    return { count: 0, error: null };
  }

  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);

  if (error) {
    return { count: 0, error: error.message };
  }

  return { count: count ?? 0, error: null };
}

export async function markNotificationRead(
  notificationId: string,
  userId: string,
): Promise<{ error: string | null }> {
  if (!hasSupabaseEnv || !isUuid(notificationId) || !isUuid(userId)) {
    return { error: null };
  }

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("user_id", userId);

  return { error: error?.message ?? null };
}

export async function markAllNotificationsRead(userId: string): Promise<{ error: string | null }> {
  if (!hasSupabaseEnv || !isUuid(userId)) {
    return { error: null };
  }

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);

  return { error: error?.message ?? null };
}

/** Aviso al vendedor: nueva compra / interés. */
export async function notifySellerPurchaseInterest(input: {
  sellerId: string;
  productTitle: string;
  buyerLabel?: string;
}): Promise<void> {
  const who = input.buyerLabel?.trim() || "Un comprador";
  await createNotification({
    userId: input.sellerId,
    type: "purchase_interest",
    title: "Nueva compra",
    message: `${who} quiere comprar «${input.productTitle}».`,
  });
}

/** Aviso al destinatario: mensaje nuevo. */
export async function notifyRecipientNewMessage(input: {
  recipientId: string;
  productTitle: string;
  preview: string;
}): Promise<void> {
  const snippet =
    input.preview.length > 100 ? `${input.preview.slice(0, 97)}…` : input.preview;
  await createNotification({
    userId: input.recipientId,
    type: "new_message",
    title: "Nuevo mensaje",
    message: `Sobre «${input.productTitle}»: ${snippet}`,
  });
}

/** Aviso al comprador: cambió el estado de su compra. */
export async function notifyBuyerOrderStatus(input: {
  buyerId: string;
  productTitle: string;
  statusLabel: string;
}): Promise<void> {
  await createNotification({
    userId: input.buyerId,
    type: "order_status",
    title: "Estado de tu compra",
    message: `«${input.productTitle}» ahora está: ${input.statusLabel}.`,
  });
}

/** Aviso al vendedor: el comprador pagó (envío). */
export async function notifySellerOrderPaid(input: {
  sellerId: string;
  productTitle: string;
}): Promise<void> {
  await createNotification({
    userId: input.sellerId,
    type: "order_status",
    title: "Compra pagada",
    message: `El comprador pagó «${input.productTitle}».`,
  });
}
