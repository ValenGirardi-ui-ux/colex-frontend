import type { Conversation, ConversationType } from "@/src/types/messages";

export type MessagesInboxTab = "chat" | "ventas";

export function filterConversationsByTab(
  conversations: Conversation[],
  tab: MessagesInboxTab,
): Conversation[] {
  if (tab === "ventas") {
    return conversations.filter((c) => c.conversationType === "sale");
  }
  return conversations.filter((c) => c.conversationType === "chat");
}

export function inboxTabForConversation(conversation: Conversation): MessagesInboxTab {
  return conversation.conversationType === "sale" ? "ventas" : "chat";
}

export function parseConversationType(value: unknown): ConversationType {
  return value === "sale" ? "sale" : "chat";
}
