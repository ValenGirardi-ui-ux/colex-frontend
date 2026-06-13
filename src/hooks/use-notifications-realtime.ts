"use client";

import { useEffect } from "react";
import { subscribePostgresChanges } from "@/src/lib/supabase/realtime-subscribe";
import { parseNotificationRecord } from "@/src/services/notifications";
import type { AppNotification } from "@/src/types/notification";

type NotificationsRealtimeHandlers = {
  onInsert?: (notification: AppNotification) => void;
  onUpdate?: (notification: AppNotification) => void;
  onDelete?: (notificationId: string) => void;
  onConnectionIssue?: () => void;
};

export function useNotificationsRealtime(
  userId: string | null | undefined,
  handlers: NotificationsRealtimeHandlers,
) {
  const { onInsert, onUpdate, onDelete, onConnectionIssue } = handlers;

  useEffect(() => {
    if (!userId) return;

    return subscribePostgresChanges(
      `notifications:${userId}`,
      [
        { event: "INSERT", table: "notifications", filter: `user_id=eq.${userId}` },
        { event: "UPDATE", table: "notifications", filter: `user_id=eq.${userId}` },
        { event: "DELETE", table: "notifications", filter: `user_id=eq.${userId}` },
      ],
      (payload) => {
        if (payload.eventType === "INSERT") {
          const notification = parseNotificationRecord(payload.new);
          if (notification) onInsert?.(notification);
          return;
        }
        if (payload.eventType === "UPDATE") {
          const notification = parseNotificationRecord(payload.new);
          if (notification) onUpdate?.(notification);
          return;
        }
        if (payload.eventType === "DELETE") {
          const id = typeof payload.old?.id === "string" ? payload.old.id : null;
          if (id) onDelete?.(id);
        }
      },
    );
  }, [userId, onInsert, onUpdate, onDelete, onConnectionIssue]);
}
