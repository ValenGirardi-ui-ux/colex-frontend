"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  useChatSession,
  useConversationThread,
  useConversations,
  useEnsureProductConversation,
  useSendMessageMutation,
} from "@/src/hooks/messages";
import {
  filterConversationsByTab,
  inboxTabForConversation,
  type MessagesInboxTab,
} from "@/src/lib/conversation-inbox";
import { ChatConversationPanel } from "@/app/mensajes/chat-conversation-panel";
import { VerifiedName } from "@/app/components/verified-badge";
import { uploadChatImage } from "@/src/services/chat-images";
import { getProductById } from "@/src/services/products";
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

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function mergeInboxWithThread(
  inbox: Conversation[],
  activeId: string | null,
  thread: Conversation | undefined,
): Conversation[] {
  if (!activeId || !thread) return inbox;
  const idx = inbox.findIndex((c) => c.id === activeId);
  if (idx === -1) return [...inbox, thread];
  const next = [...inbox];
  next[idx] = thread;
  return next;
}

function parseInboxTab(value: string | null): MessagesInboxTab {
  return value === "ventas" ? "ventas" : "chat";
}

export function MensajesInbox() {
  const searchParams = useSearchParams();
  const convParam = searchParams.get("conv");
  const productoParam = searchParams.get("producto");
  const errorParam = searchParams.get("error");
  const tabParam = searchParams.get("tab");

  const { data: userId, isLoading: sessionLoading } = useChatSession();
  const {
    data: inbox = [],
    isLoading: inboxLoading,
    error: inboxError,
  } = useConversations(userId);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [inboxTab, setInboxTab] = useState<MessagesInboxTab>(() => parseInboxTab(tabParam));
  const [draft, setDraft] = useState("");
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const [pendingImageName, setPendingImageName] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [attachError, setAttachError] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [urlHandled, setUrlHandled] = useState(false);
  const messagesScrollRef = useRef<HTMLDivElement>(null);

  const {
    data: activeThread,
    isLoading: threadLoading,
    error: threadError,
  } = useConversationThread(userId, activeId);

  const sendMessageMutation = useSendMessageMutation(userId);
  const ensureConversation = useEnsureProductConversation();

  const conversations = useMemo(
    () => mergeInboxWithThread(inbox, activeId, activeThread),
    [inbox, activeId, activeThread],
  );

  const filteredConversations = useMemo(
    () => filterConversationsByTab(conversations, inboxTab),
    [conversations, inboxTab],
  );

  const loadError =
    urlError ??
    (inboxError instanceof Error ? inboxError.message : null) ??
    (threadError instanceof Error ? threadError.message : null) ??
    (sendMessageMutation.error instanceof Error ? sendMessageMutation.error.message : null);

  useEffect(() => {
    if (sessionLoading || !userId || urlHandled) return;

    if (convParam && isUuid(convParam)) {
      setActiveId(convParam);
      setMobileView("chat");
      if (tabParam) {
        setInboxTab(parseInboxTab(tabParam));
      }
      setUrlHandled(true);
      return;
    }

    if (!productoParam) {
      if (!activeId && inbox.length > 0) {
        const tabbed = filterConversationsByTab(inbox, inboxTab);
        const first = tabbed[0] ?? inbox[0];
        if (first) setActiveId(first.id);
      }
      setUrlHandled(true);
      return;
    }

    const buyerId = userId;
    let cancelled = false;

    async function openProductChat() {
      if (!productoParam) {
        setUrlHandled(true);
        return;
      }
      const product = await getProductById(productoParam);
      if (cancelled) return;
      if (!product || !isUuid(product.user_id)) {
        setUrlHandled(true);
        return;
      }

      try {
        const result = await ensureConversation.mutateAsync({
          productId: product.id,
          productTitle: product.title,
          buyerId,
          sellerId: product.user_id,
          conversationType: "chat",
        });
        if (cancelled) return;
        if (result.conversationId) {
          setActiveId(result.conversationId);
          setInboxTab("chat");
          setMobileView("chat");
        } else if (result.error) {
          setUrlError(result.error);
        }
      } catch (err) {
        if (!cancelled) {
          setUrlError(err instanceof Error ? err.message : "No se pudo abrir el chat.");
        }
      } finally {
        if (!cancelled) setUrlHandled(true);
      }
    }

    void openProductChat();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- apertura única por URL
  }, [sessionLoading, userId, convParam, productoParam, urlHandled, inbox.length]);

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  );

  useEffect(() => {
    if (!convParam || !isUuid(convParam)) return;
    const conv = conversations.find((c) => c.id === convParam);
    if (!conv) return;
    if (!tabParam) {
      setInboxTab(inboxTabForConversation(conv));
    }
  }, [convParam, tabParam, conversations]);

  useEffect(() => {
    if (!activeId) return;
    const visible = filteredConversations.some((c) => c.id === activeId);
    if (!visible && filteredConversations.length > 0) {
      setActiveId(filteredConversations[0]!.id);
    }
  }, [inboxTab, filteredConversations, activeId]);

  const onSelectTab = useCallback((tab: MessagesInboxTab) => {
    setInboxTab(tab);
    setUrlError(null);
    const tabbed = filterConversationsByTab(conversations, tab);
    if (tabbed.length > 0) {
      setActiveId(tabbed[0]!.id);
    } else {
      setActiveId(null);
      setMobileView("list");
    }
  }, [conversations]);

  const onSelect = useCallback((id: string) => {
    setActiveId(id);
    setMobileView("chat");
    setUrlError(null);
    setPendingImageUrl(null);
    setPendingImageName(null);
    setAttachError(null);
    const conv = conversations.find((c) => c.id === id);
    if (conv) {
      setInboxTab(inboxTabForConversation(conv));
    }
  }, [conversations]);

  const onBack = useCallback(() => {
    setMobileView("list");
  }, []);

  useEffect(() => {
    const el = messagesScrollRef.current;
    if (!el || !active) return;
    el.scrollTop = el.scrollHeight;
  }, [active?.id, active?.messages.length, threadLoading]);

  const attachImage = useCallback(
    async (file: File) => {
      if (!activeId || !userId || imageUploading) return;
      setAttachError(null);
      setImageUploading(true);
      const { url, error } = await uploadChatImage(activeId, userId, file);
      setImageUploading(false);
      if (error || !url) {
        setAttachError(error ?? "No se pudo subir la imagen.");
        return;
      }
      setPendingImageUrl(url);
      setPendingImageName(file.name);
    },
    [activeId, userId, imageUploading],
  );

  const send = useCallback(() => {
    const t = draft.trim();
    if ((!t && !pendingImageUrl) || !activeId || !userId || sendMessageMutation.isPending || imageUploading) {
      return;
    }
    sendMessageMutation.mutate(
      {
        conversationId: activeId,
        content: t || undefined,
        imageUrl: pendingImageUrl,
      },
      {
        onSuccess: () => {
          setDraft("");
          setPendingImageUrl(null);
          setPendingImageName(null);
          setAttachError(null);
        },
        onError: () => {},
      },
    );
  }, [draft, pendingImageUrl, activeId, userId, sendMessageMutation, imageUploading]);

  const loading = sessionLoading || (Boolean(userId) && inboxLoading && !urlHandled);

  if (loading) {
    return (
      <div className="colex-messages-inbox flex items-center justify-center px-4" role="status">
        <p className="text-base text-zinc-500">Cargando mensajes…</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="colex-messages-inbox flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <p className="text-base text-zinc-600">Iniciá sesión para ver tus conversaciones.</p>
          <Link
            href={`/login?next=${encodeURIComponent("/mensajes")}`}
            className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-[#822020] px-6 text-base font-semibold text-white hover:bg-[#6d1b1b]"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="colex-messages-inbox mx-auto w-full max-w-[1240px] min-w-0 px-2 py-2 max-lg:px-2 lg:px-4 lg:py-3">
      {loadError || errorParam ? (
        <p
          role="alert"
          className="mb-2 w-full shrink-0 rounded-xl border border-[#822020]/25 bg-[#822020]/10 px-4 py-2.5 text-sm text-[#6d1b1b]"
        >
          {loadError ??
            (errorParam === "demo-no-chat"
              ? "Este producto de demostración no tiene vendedor con cuenta. Publicá o comprá un producto real para chatear."
              : "No se pudo abrir el chat.")}
        </p>
      ) : null}

      <div className="colex-messages-split">
        <aside
          className={`colex-messages-sidebar ${mobileView === "chat" ? "max-lg:hidden" : "max-lg:flex max-lg:flex-1"}`}
        >
          <div className="shrink-0 border-b border-zinc-100 px-4 py-3 lg:px-5">
            <h2 className="text-lg font-bold text-zinc-900">Mensajes</h2>
            <div
              className="mt-2.5 flex gap-1 rounded-full bg-zinc-100 p-1"
              role="tablist"
              aria-label="Tipo de conversaciones"
            >
              <button
                type="button"
                role="tab"
                aria-selected={inboxTab === "chat"}
                onClick={() => onSelectTab("chat")}
                className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold transition ${
                  inboxTab === "chat"
                    ? "bg-white text-[#822020]"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                Chat
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={inboxTab === "ventas"}
                onClick={() => onSelectTab("ventas")}
                className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold transition ${
                  inboxTab === "ventas"
                    ? "bg-white text-[#822020]"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                Ventas
              </button>
            </div>
          </div>
          <ul className="colex-messages-sidebar-list space-y-1.5 p-2">
            {filteredConversations.length === 0 ? (
              <li className="px-3 py-8 text-center text-sm text-zinc-500">
                {inboxTab === "ventas"
                  ? "No tenés consultas de compradores sobre tus publicaciones."
                  : "Todavía no tenés chats. Comprá o contactá a un vendedor desde un producto."}
              </li>
            ) : (
              filteredConversations.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(c.id)}
                    className={`flex w-full gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                      c.id === activeId
                        ? "border-[#822020]/20 bg-[#822020]/[0.08]"
                        : "border-transparent bg-white hover:bg-zinc-50"
                    }`}
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#822020]/10 text-sm font-semibold text-[#822020]">
                      {c.peerInitials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <VerifiedName verified={c.peerIsVerified} nameClassName="font-medium text-zinc-900">
                        {c.peerName}
                      </VerifiedName>
                      {c.peerEmail ? (
                        <p className="truncate text-xs text-zinc-400">{c.peerEmail}</p>
                      ) : null}
                      <p className="truncate text-xs text-zinc-500">{c.productLabel}</p>
                      <p className="line-clamp-1 text-sm text-zinc-600">{c.lastMessage}</p>
                      <p className="text-xs text-zinc-400">{timeLabel(c.lastMessageAt)}</p>
                    </div>
                  </button>
                </li>
              ))
            )}
          </ul>
        </aside>

        <section
          className={`colex-messages-chat-wrap ${mobileView === "list" ? "max-lg:hidden" : "max-lg:flex max-lg:flex-1"}`}
        >
          {active ? (
            <ChatConversationPanel
              conversation={active}
              draft={draft}
              threadLoading={threadLoading}
              sendPending={sendMessageMutation.isPending}
              imageUploading={imageUploading}
              attachError={attachError}
              pendingImageUrl={pendingImageUrl}
              pendingImageName={pendingImageName}
              messagesScrollRef={messagesScrollRef}
              onDraftChange={(value) => {
                setDraft(value);
                setAttachError(null);
              }}
              onSend={send}
              onAttachImage={(file) => void attachImage(file)}
              onClearPendingImage={() => {
                setPendingImageUrl(null);
                setPendingImageName(null);
                setAttachError(null);
              }}
              onBack={onBack}
            />
          ) : (
            <div className="colex-messages-chat-empty text-base">
              Seleccioná una conversación
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
