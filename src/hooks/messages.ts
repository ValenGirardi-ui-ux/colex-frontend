"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ensureProductConversation,
  ensureConversationWithPeer,
  fetchConversationMessages,
  fetchConversationsForUser,
  sendMessage,
} from "@/src/services/conversations";
import { supabase } from "@/src/lib/supabase/client";
import { chatMessagePreviewText } from "@/src/lib/chat-message-preview";
import type { Conversation } from "@/src/types/messages";

export const messagesQueryKeys = {
  all: ["messages"] as const,
  session: () => [...messagesQueryKeys.all, "session"] as const,
  inbox: (userId: string) => [...messagesQueryKeys.all, "inbox", userId] as const,
  thread: (userId: string, conversationId: string) =>
    [...messagesQueryKeys.all, "thread", userId, conversationId] as const,
};

export function useChatSession() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      void queryClient.invalidateQueries({ queryKey: messagesQueryKeys.session() });
    });
    return () => authListener.subscription.unsubscribe();
  }, [queryClient]);

  return useQuery({
    queryKey: messagesQueryKeys.session(),
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session?.user?.id ?? null;
    },
  });
}

export function useConversations(userId: string | null | undefined) {
  return useQuery({
    queryKey: messagesQueryKeys.inbox(userId ?? ""),
    queryFn: async () => {
      const { conversations, error } = await fetchConversationsForUser(userId!);
      if (error) throw new Error(error);
      return conversations;
    },
    enabled: Boolean(userId),
  });
}

export function useConversationThread(
  userId: string | null | undefined,
  conversationId: string | null,
) {
  return useQuery({
    queryKey: messagesQueryKeys.thread(userId ?? "", conversationId ?? ""),
    queryFn: async () => {
      const { conversation, error } = await fetchConversationMessages(conversationId!, userId!);
      if (error) throw new Error(error);
      if (!conversation) throw new Error("Conversación no encontrada.");
      return conversation;
    },
    enabled: Boolean(userId && conversationId),
  });
}

export function useSendMessageMutation(userId: string | null | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      conversationId: string;
      content?: string;
      imageUrl?: string | null;
    }) => {
      const { message, error } = await sendMessage({
        conversationId: input.conversationId,
        senderId: userId!,
        content: input.content,
        imageUrl: input.imageUrl,
      });
      if (error || !message) throw new Error(error ?? "No se pudo enviar el mensaje.");
      return { message, conversationId: input.conversationId };
    },
    onSuccess: ({ message, conversationId }) => {
      if (!userId) return;

      const preview = chatMessagePreviewText(message.text, message.messageType, message.imageUrl);

      queryClient.setQueryData<Conversation>(
        messagesQueryKeys.thread(userId, conversationId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            messages: [...old.messages, message],
            lastMessage: preview,
            lastMessageAt: message.createdAt,
          };
        },
      );

      void queryClient.invalidateQueries({ queryKey: messagesQueryKeys.inbox(userId) });

      const thread = queryClient.getQueryData<Conversation>(
        messagesQueryKeys.thread(userId, conversationId),
      );
      if (thread?.peerId) {
        void queryClient.invalidateQueries({ queryKey: messagesQueryKeys.inbox(thread.peerId) });
      }
    },
  });
}

export function useEnsureProductConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ensureProductConversation,
    onSuccess: (result, variables) => {
      if (!result.conversationId) return;
      void queryClient.invalidateQueries({
        queryKey: messagesQueryKeys.inbox(variables.buyerId),
      });
      void queryClient.invalidateQueries({
        queryKey: messagesQueryKeys.inbox(variables.sellerId),
      });
    },
  });
}

export function useEnsurePeerConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ensureConversationWithPeer,
    onSuccess: (result, variables) => {
      if (!result.conversationId) return;
      void queryClient.invalidateQueries({
        queryKey: messagesQueryKeys.inbox(variables.currentUserId),
      });
      void queryClient.invalidateQueries({
        queryKey: messagesQueryKeys.inbox(variables.peerUserId),
      });
    },
  });
}
