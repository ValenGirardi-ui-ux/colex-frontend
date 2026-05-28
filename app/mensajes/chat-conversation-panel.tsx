"use client";

import type { RefObject } from "react";
import { VerifiedName } from "@/app/components/verified-badge";
import type { Conversation } from "@/src/types/messages";

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

type ChatConversationPanelProps = {
  conversation: Conversation;
  draft: string;
  threadLoading: boolean;
  sendPending: boolean;
  messagesScrollRef: RefObject<HTMLDivElement | null>;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  onBack: () => void;
};

export function ChatConversationPanel({
  conversation,
  draft,
  threadLoading,
  sendPending,
  messagesScrollRef,
  onDraftChange,
  onSend,
  onBack,
}: ChatConversationPanelProps) {
  return (
    <div className="colex-messages-chat">
      <header className="shrink-0 border-b border-zinc-200/80 bg-white px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-700 transition hover:bg-zinc-100 lg:hidden"
            aria-label="Volver a conversaciones"
          >
            ←
          </button>
          <div className="min-w-0 flex-1">
            <VerifiedName verified={conversation.peerIsVerified} nameClassName="font-semibold text-zinc-900">
              {conversation.peerName}
            </VerifiedName>
            {conversation.peerEmail ? (
              <p className="truncate text-sm text-zinc-500">{conversation.peerEmail}</p>
            ) : null}
            <p className="truncate text-sm text-zinc-500">{conversation.productLabel}</p>
          </div>
        </div>
      </header>

      <div
        ref={messagesScrollRef}
        className="colex-messages-chat-messages px-3 py-3 sm:px-4 sm:py-4 lg:px-5"
        aria-label="Mensajes de la conversación"
      >
        {threadLoading && conversation.messages.length === 0 ? (
          <p className="py-4 text-center text-sm text-zinc-500">Cargando mensajes…</p>
        ) : null}
        {conversation.messages.map((m) => (
          <div key={m.id} className={`flex w-full ${m.sender === "me" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[88%] px-3.5 py-2.5 text-[15px] leading-snug sm:max-w-[82%] sm:text-base sm:leading-relaxed ${
                m.sender === "me"
                  ? "rounded-[18px] rounded-br-sm bg-[#822020] text-white"
                  : "rounded-[18px] rounded-bl-sm border border-zinc-200/80 bg-white text-zinc-800"
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{m.text}</p>
              <p className={`mt-1 text-xs ${m.sender === "me" ? "text-white/80" : "text-zinc-400"}`}>
                {timeLabel(m.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <footer className="shrink-0 border-t border-zinc-200/80 bg-white p-3 max-lg:pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4">
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-end">
          <label className="sr-only" htmlFor="mensaje-input">
            Escribir mensaje
          </label>
          <textarea
            id="mensaje-input"
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            rows={1}
            placeholder="Escribí tu mensaje…"
            className="max-h-28 min-h-11 w-full flex-1 resize-none rounded-[20px] border border-zinc-200/90 bg-zinc-50/70 px-4 py-2.5 text-base text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-[#822020] focus:ring-2 focus:ring-[#822020]/20"
          />
          <button
            type="button"
            disabled={sendPending || !draft.trim()}
            onClick={onSend}
            className="h-11 shrink-0 rounded-full bg-[#822020] px-6 text-base font-semibold text-white transition hover:bg-[#6d1b1b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sendPending ? "Enviando…" : "Enviar"}
          </button>
        </div>
      </footer>
    </div>
  );
}
