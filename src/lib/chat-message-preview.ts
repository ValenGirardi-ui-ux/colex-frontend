import type { MessageType } from "@/src/types/messages";

export function chatMessagePreviewText(
  content: string,
  messageType: MessageType,
  imageUrl: string | null,
): string {
  const text = content.trim();
  if (messageType === "image" || imageUrl) {
    if (text) return `${text} · Imagen`;
    return "Imagen";
  }
  return text || "Mensaje";
}
