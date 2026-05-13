"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { initialMockConversations } from "@/src/data/mockConversations";
import type { ChatMessage, Conversation } from "@/src/types/messages";

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

function cloneConversations(data: Conversation[]): Conversation[] {
  return JSON.parse(JSON.stringify(data)) as Conversation[];
}

export function MensajesInbox() {
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setConversations(cloneConversations(initialMockConversations));
    setActiveId(initialMockConversations[0]!.id);
    setInitialized(true);
  }, []);

  const productoParam = searchParams.get("producto");

  // Solo reacciona al producto de la URL; no re-ejecutar al agregar mensajes.
  useEffect(() => {
    if (!initialized || !productoParam) return;
    const byProduct = initialMockConversations.find((c) => c.productId === productoParam);
    if (byProduct) {
      setActiveId(byProduct.id);
      setMobileView("chat");
    }
  }, [initialized, productoParam]);

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId]
  );

  const onSelect = useCallback((id: string) => {
    setActiveId(id);
    setMobileView("chat");
  }, []);

  const onBack = useCallback(() => {
    setMobileView("list");
  }, []);

  const send = useCallback(() => {
    const t = draft.trim();
    if (!t || !activeId) return;
    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: "me",
      text: t,
      createdAt: new Date().toISOString(),
    };
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeId) return c;
        return {
          ...c,
          lastMessage: t,
          lastMessageAt: newMsg.createdAt,
          messages: [...c.messages, newMsg],
        };
      })
    );
    setDraft("");
  }, [draft, activeId]);

  if (!initialized) {
    return (
      <div className="px-4 py-16 text-center text-sm text-zinc-500" role="status">
        Cargando mensajes…
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-[1240px] flex-1 p-3 sm:p-4 lg:p-6">
      <div
        className={`${
          mobileView === "chat" ? "hidden" : "flex"
        } w-full flex-col rounded-3xl border border-zinc-200/70 bg-white/95 shadow-[0_8px_30px_rgba(24,24,27,0.06)] lg:block lg:max-w-sm xl:max-w-md`}
      >
        <div className="border-b border-zinc-100 px-5 py-4 lg:py-5">
          <h2 className="text-lg font-bold text-zinc-900">Conversaciones</h2>
        </div>
        <ul className="max-h-[60vh] flex-1 space-y-2 overflow-y-auto p-3 lg:max-h-[calc(100vh-220px)]">
          {conversations.map((c) => (
            <li key={c.id} className="first:pt-0">
              <button
                type="button"
                onClick={() => onSelect(c.id)}
                className={`flex w-full gap-3 rounded-2xl border border-transparent px-4 py-3.5 text-left transition hover:bg-zinc-50 ${
                  c.id === activeId
                    ? "border-[#822020]/15 bg-[#822020]/[0.07] shadow-[0_6px_20px_rgba(130,32,32,0.09)]"
                    : "bg-white"
                }`}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#822020]/10 text-sm font-semibold text-[#822020]">
                  {c.peerInitials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-zinc-900">{c.peerName}</p>
                  <p className="truncate text-xs text-zinc-500">{c.productLabel}</p>
                  <p className="line-clamp-1 text-sm text-zinc-600">{c.lastMessage}</p>
                  <p className="text-xs text-zinc-400">{timeLabel(c.lastMessageAt)}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div
        className={`${
          mobileView === "list" ? "hidden" : "flex"
        } min-h-0 w-full min-w-0 flex-1 flex-col rounded-3xl border border-zinc-200/70 bg-[#F6F6F6] shadow-[0_8px_30px_rgba(24,24,27,0.06)] lg:flex`}
      >
        {active ? (
          <>
            <div className="shrink-0 border-b border-zinc-200/80 bg-white px-5 py-4 lg:px-6 lg:py-5">
              <div className="flex items-center gap-2 lg:gap-3">
                <button
                  type="button"
                  onClick={onBack}
                  className="-ml-1 flex h-9 w-9 items-center justify-center rounded-full text-zinc-700 transition hover:bg-zinc-100 lg:hidden"
                  aria-label="Volver a conversaciones"
                >
                  ←
                </button>
                <div>
                  <p className="font-semibold text-zinc-900">{active.peerName}</p>
                  <p className="text-sm text-zinc-500">{active.productLabel}</p>
                </div>
              </div>
            </div>
            <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto px-4 py-5 lg:px-7">
              {active.messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.sender === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2.5 text-sm shadow-sm sm:max-w-[70%] ${
                      m.sender === "me"
                        ? "rounded-[22px] rounded-br-md bg-[#822020] text-white"
                        : "rounded-[22px] rounded-bl-md border border-zinc-200/80 bg-white text-zinc-800"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.text}</p>
                    <p
                      className={`mt-1 text-[10px] sm:text-xs ${
                        m.sender === "me" ? "text-white/80" : "text-zinc-400"
                      }`}
                    >
                      {timeLabel(m.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="shrink-0 border-t border-zinc-200/80 bg-white p-4 lg:p-5">
              <div className="mx-auto flex max-w-3xl flex-col gap-2.5 sm:flex-row sm:items-end">
                <label className="sr-only" htmlFor="mensaje-input">
                  Escribir mensaje
                </label>
                <textarea
                  id="mensaje-input"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={2}
                  placeholder="Escribí tu mensaje…"
                  className="w-full min-h-11 flex-1 resize-y rounded-[26px] border border-zinc-200/90 bg-zinc-50/70 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-[#822020] focus:ring-2 focus:ring-[#822020]/20 sm:min-h-0 sm:py-3.5"
                />
                <button
                  type="button"
                  onClick={send}
                  className="h-11 shrink-0 rounded-full bg-[#822020] px-6 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(130,32,32,0.28)] transition hover:bg-[#6d1b1b] sm:h-12 sm:px-7"
                >
                  Enviar
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-8 text-zinc-500">Seleccioná una conversación</div>
        )}
      </div>
    </div>
  );
}
