"use client";

import { useState } from "react";
import type { ChatMessage } from "@/src/types/messages";

function timeLabel(iso: string): string {
  try {
    return new Date(iso).toLocaleString("es-AR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

type ChatMessageBubbleProps = {
  message: ChatMessage;
};

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const isMe = message.sender === "me";
  const hasImage = Boolean(message.imageUrl);
  const hasText = Boolean(message.text.trim());

  return (
    <>
      <div className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
        <div
          className={`max-w-[88%] px-3.5 py-2.5 text-[15px] leading-snug sm:max-w-[82%] sm:text-base sm:leading-relaxed ${
            isMe
              ? "rounded-[18px] rounded-br-sm bg-[#822020] text-white"
              : "rounded-[18px] rounded-bl-sm border border-zinc-200/80 bg-white text-zinc-800"
          }`}
        >
          {hasImage ? (
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="mb-2 block max-w-full overflow-hidden rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#822020]"
              aria-label="Ver imagen en tamaño completo"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={message.imageUrl!}
                alt=""
                className="max-h-56 w-auto max-w-full object-cover sm:max-h-64"
                loading="lazy"
              />
            </button>
          ) : null}
          {hasText ? <p className="whitespace-pre-wrap break-words">{message.text}</p> : null}
          <p className={`mt-1 text-xs ${isMe ? "text-white/80" : "text-zinc-400"}`}>
            {timeLabel(message.createdAt)}
          </p>
        </div>
      </div>

      {lightboxOpen && hasImage ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-900/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Imagen del mensaje"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20"
            aria-label="Cerrar"
          >
            ×
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={message.imageUrl!}
            alt=""
            className="max-h-[90dvh] max-w-full rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </>
  );
}
