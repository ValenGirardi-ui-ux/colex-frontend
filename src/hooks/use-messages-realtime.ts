"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { subscribePostgresChanges } from "@/src/lib/supabase/realtime-subscribe";
import { messagesQueryKeys } from "@/src/hooks/messages";

/**
 * Actualiza la lista de conversaciones (sidebar) cuando hay conversaciones nuevas o reordenadas.
 * Los mensajes del hilo abierto los maneja `useActiveConversationRealtime`.
 */
export function useMessagesRealtime(userId: string | null | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const inboxKey = messagesQueryKeys.inbox(userId);

    return subscribePostgresChanges(
      `conversations:${userId}`,
      [
        { event: "INSERT", table: "conversations" },
        { event: "UPDATE", table: "conversations" },
      ],
      () => {
        void queryClient.invalidateQueries({ queryKey: inboxKey });
      },
    );
  }, [userId, queryClient]);
}
