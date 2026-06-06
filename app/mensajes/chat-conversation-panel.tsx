"use client";

import type { RefObject } from "react";
import { useRef } from "react";
import { ChatMessageBubble } from "@/app/mensajes/chat-message-bubble";
import { VerifiedName } from "@/app/components/verified-badge";
import type { Conversation } from "@/src/types/messages";

type ChatConversationPanelProps = {
  conversation: Conversation;
  draft: string;
  threadLoading: boolean;
  sendPending: boolean;
  imageUploading: boolean;
  attachError: string | null;
  pendingImageUrl: string | null;
  pendingImageName: string | null;
  messagesScrollRef: RefObject<HTMLDivElement | null>;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  onAttachImage: (file: File) => void;
  onClearPendingImage: () => void;
  onBack: () => void;
};

export function ChatConversationPanel({
  conversation,
  draft,
  threadLoading,
  sendPending,
  imageUploading,
  attachError,
  pendingImageUrl,
  pendingImageName,
  messagesScrollRef,
  onDraftChange,
  onSend,
  onAttachImage,
  onClearPendingImage,
  onBack,
}: ChatConversationPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canSend = Boolean(draft.trim() || pendingImageUrl) && !sendPending && !imageUploading;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) onAttachImage(file);
  }

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
          <ChatMessageBubble key={m.id} message={m} />
        ))}
      </div>

      <footer className="shrink-0 border-t border-zinc-200/80 bg-white p-3 max-lg:pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4">
        {pendingImageUrl ? (
          <div className="mb-2 flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pendingImageUrl}
              alt=""
              className="h-12 w-12 shrink-0 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-zinc-800">
                {pendingImageName ?? "Imagen lista para enviar"}
              </p>
              <p className="text-[11px] text-zinc-500">Podés agregar un mensaje opcional.</p>
            </div>
            <button
              type="button"
              onClick={onClearPendingImage}
              disabled={sendPending || imageUploading}
              className="shrink-0 rounded-full px-2 py-1 text-xs font-medium text-zinc-600 transition hover:bg-zinc-200/80 disabled:opacity-50"
              aria-label="Quitar imagen"
            >
              Quitar
            </button>
          </div>
        ) : null}

        {imageUploading ? (
          <p className="mb-2 text-center text-xs text-zinc-500" role="status">
            Subiendo imagen…
          </p>
        ) : null}

        {attachError ? (
          <p role="alert" className="mb-2 rounded-xl border border-[#822020]/25 bg-[#822020]/10 px-3 py-2 text-xs text-[#6d1b1b]">
            {attachError}
          </p>
        ) : null}

        <div className="flex w-full items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            aria-hidden
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={sendPending || imageUploading}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-700 transition hover:border-[#822020]/30 hover:text-[#822020] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Adjuntar imagen"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <circle cx="8.5" cy="10" r="1.5" fill="currentColor" stroke="none" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21" />
            </svg>
          </button>

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
                if (canSend) onSend();
              }
            }}
            rows={1}
            placeholder="Escribí tu mensaje…"
            disabled={imageUploading}
            className="max-h-28 min-h-11 w-full min-w-0 flex-1 resize-none rounded-[20px] border border-zinc-200/90 bg-zinc-50/70 px-4 py-2.5 text-base text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-[#822020] focus:ring-2 focus:ring-[#822020]/20 disabled:opacity-60"
          />
          <button
            type="button"
            disabled={!canSend}
            onClick={onSend}
            className="h-11 shrink-0 rounded-full bg-[#822020] px-5 text-base font-semibold text-white transition hover:bg-[#6d1b1b] disabled:cursor-not-allowed disabled:opacity-60 sm:px-6"
          >
            {sendPending ? "Enviando…" : "Enviar"}
          </button>
        </div>
      </footer>
    </div>
  );
}
