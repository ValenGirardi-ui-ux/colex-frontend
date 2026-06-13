import type { ChatMessage } from "@/src/types/messages";

/** Combina mensajes del fetch con llegadas en vivo, sin duplicar por id. */
export function mergeChatMessages(base: ChatMessage[], extra: ChatMessage[]): ChatMessage[] {
  if (extra.length === 0) return base;
  const seen = new Set(base.map((m) => m.id));
  const merged = [...base];
  for (const message of extra) {
    if (seen.has(message.id)) continue;
    seen.add(message.id);
    merged.push(message);
  }
  return merged;
}

export function appendChatMessageIfNew(
  messages: ChatMessage[],
  incoming: ChatMessage,
): ChatMessage[] {
  if (messages.some((m) => m.id === incoming.id)) return messages;
  return [...messages, incoming];
}
