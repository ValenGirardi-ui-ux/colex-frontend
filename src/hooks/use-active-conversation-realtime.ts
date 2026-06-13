"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { appendChatMessageIfNew } from "@/src/lib/chat-message-merge";
import { chatMessagePreviewText } from "@/src/lib/chat-message-preview";
import { subscribePostgresChanges } from "@/src/lib/supabase/realtime-subscribe";
import { messagesQueryKeys } from "@/src/hooks/messages";
import { parseChatMessageRecord } from "@/src/services/conversations";
import type { ChatMessage, Conversation } from "@/src/types/messages";

type UseActiveConversationRealtimeOptions = {
  /** Mensaje nuevo en la conversación abierta (para estado local + scroll). */
  onMessageInserted?: (message: ChatMessage) => void;
};

/**
 * Realtime de la conversación abierta: solo INSERT en `messages` con filtro por conversation_id.
 */
export function useActiveConversationRealtime(
  userId: string | null | undefined,
  activeConversationId: string | null,
  options: UseActiveConversationRealtimeOptions = {},
) {
  const { onMessageInserted } = options;
  const queryClient = useQueryClient();
  const onInsertRef = useRef(onMessageInserted);
  onInsertRef.current = onMessageInserted;

  useEffect(() => {
    if (!userId || !activeConversationId) return;

    const threadKey = messagesQueryKeys.thread(userId, activeConversationId);
    const inboxKey = messagesQueryKeys.inbox(userId);
    const filter = `conversation_id=eq.${activeConversationId}`;

    const unsubscribe = subscribePostgresChanges(
      `chat-thread:${userId}:${activeConversationId}`,
      [{ event: "INSERT", table: "messages", filter }],
      (payload) => {
        const record = payload.new as Record<string, unknown> | undefined;
        const message = parseChatMessageRecord(record, userId);
        if (!message) return;

        const preview = chatMessagePreviewText(message.text, message.messageType, message.imageUrl);

        queryClient.setQueryData<Conversation>(threadKey, (old) => {
          if (!old) {
            void queryClient.invalidateQueries({ queryKey: threadKey });
            return old;
          }
          return {
            ...old,
            messages: appendChatMessageIfNew(old.messages, message),
            lastMessage: preview,
            lastMessageAt: message.createdAt,
          };
        });

        queryClient.setQueryData<Conversation[]>(inboxKey, (old) => {
          if (!old?.length) return old;
          const idx = old.findIndex((c) => c.id === activeConversationId);
          if (idx === -1) return old;
          const conv = old[idx]!;
          const updated: Conversation = {
            ...conv,
            lastMessage: preview,
            lastMessageAt: message.createdAt,
            messages: appendChatMessageIfNew(conv.messages, message),
          };
          const rest = old.filter((_, i) => i !== idx);
          return [updated, ...rest];
        });

        onInsertRef.current?.(message);
      },
    );

    return unsubscribe;
  }, [userId, activeConversationId, queryClient]);
}
