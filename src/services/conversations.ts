import { chatMessagePreviewText } from "@/src/lib/chat-message-preview";
import { profileDisplayName, profilePeerSubtitle, initialsFromLabel } from "@/src/lib/chat-display";
import { isProfileVerified } from "@/src/lib/profile-verified";
import { parseConversationType } from "@/src/lib/conversation-inbox";
import { notifyRecipientNewMessage } from "@/src/services/notifications";
import { hasSupabaseEnv, supabase } from "@/src/lib/supabase/client";
import type { DbConversation, DbMessage } from "@/src/types/conversation";
import type { ChatMessage, Conversation, ConversationType } from "@/src/types/messages";
import type { ProfileRow } from "@/src/types/profile";

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function rowToConversation(row: Record<string, unknown>): DbConversation {
  return {
    id: String(row.id),
    product_id: String(row.product_id),
    product_title: String(row.product_title ?? ""),
    buyer_id: String(row.buyer_id),
    seller_id: String(row.seller_id),
    conversation_type: parseConversationType(row.conversation_type),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

function parseMessageType(raw: unknown): "text" | "image" {
  return raw === "image" ? "image" : "text";
}

function rowToMessage(row: Record<string, unknown>): DbMessage {
  const imageUrl =
    typeof row.image_url === "string" && row.image_url.trim() ? row.image_url.trim() : null;
  const messageType = parseMessageType(row.message_type);
  return {
    id: String(row.id),
    conversation_id: String(row.conversation_id),
    sender_id: String(row.sender_id),
    content: typeof row.content === "string" ? row.content : "",
    image_url: imageUrl,
    message_type: imageUrl ? "image" : messageType,
    created_at: String(row.created_at),
    read_at: row.read_at != null ? String(row.read_at) : null,
  };
}

export function formatConversationErrorForUser(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("row-level security") || m.includes("policy")) {
    return "No tenés permiso para esta conversación. Revisá las políticas de chat en Supabase.";
  }
  if (m.includes("schema cache") || m.includes("could not find the table")) {
    return "Faltan las tablas de chat. Ejecutá supabase/messages-setup.sql en Supabase.";
  }
  if (m.includes("duplicate key") || m.includes("unique")) {
    return "La conversación ya existe.";
  }
  if (m.includes("message_type") || m.includes("image_url")) {
    return "Falta la migración de imágenes en chat. Ejecutá supabase/migrations/20260517000000_chat_images.sql.";
  }
  return message || "No se pudo completar la operación de chat.";
}

export type EnsureProductConversationInput = {
  productId: string;
  productTitle: string;
  buyerId: string;
  sellerId: string;
  conversationType: ConversationType;
  /** Mensaje inicial opcional. */
  initialMessage?: string;
  /** Si true, envía el mensaje aunque la conversación ya exista (p. ej. nueva compra). */
  postInitialMessage?: boolean;
};

export type EnsureProductConversationResult = {
  conversationId: string | null;
  conversationType: ConversationType | null;
  error: string | null;
};

export async function ensureProductConversation(
  input: EnsureProductConversationInput,
): Promise<EnsureProductConversationResult> {
  if (!hasSupabaseEnv) {
    return { conversationId: null, conversationType: null, error: "Supabase no está configurado." };
  }
  if (!isUuid(input.buyerId) || !isUuid(input.sellerId)) {
    return {
      conversationId: null,
      conversationType: null,
      error: "El vendedor o comprador no tiene cuenta válida para chatear.",
    };
  }
  if (input.buyerId === input.sellerId) {
    return {
      conversationId: null,
      conversationType: null,
      error: "No podés iniciar un chat sobre tu propia publicación.",
    };
  }

  const productId = input.productId.trim();
  const productTitle = input.productTitle.trim() || "Producto";
  const requestedType = input.conversationType;

  const { data: existing, error: findError } = await supabase
    .from("conversations")
    .select("id, conversation_type")
    .eq("product_id", productId)
    .eq("buyer_id", input.buyerId)
    .eq("seller_id", input.sellerId)
    .maybeSingle();

  if (findError) {
    return {
      conversationId: null,
      conversationType: null,
      error: formatConversationErrorForUser(findError.message),
    };
  }

  let conversationId = existing?.id != null ? String(existing.id) : null;
  let resolvedType = parseConversationType(existing?.conversation_type);
  let isNew = false;
  let upgradedToSale = false;

  if (!conversationId) {
    const { data: inserted, error: insertError } = await supabase
      .from("conversations")
      .insert({
        product_id: productId,
        product_title: productTitle,
        buyer_id: input.buyerId,
        seller_id: input.sellerId,
        conversation_type: requestedType,
      })
      .select("id, conversation_type")
      .single();

    if (insertError) {
      const { data: retry } = await supabase
        .from("conversations")
        .select("id, conversation_type")
        .eq("product_id", productId)
        .eq("buyer_id", input.buyerId)
        .eq("seller_id", input.sellerId)
        .maybeSingle();
      if (retry?.id) {
        conversationId = String(retry.id);
        resolvedType = parseConversationType(retry.conversation_type);
      } else {
        return {
          conversationId: null,
          conversationType: null,
          error: formatConversationErrorForUser(insertError.message),
        };
      }
    } else if (inserted?.id) {
      conversationId = String(inserted.id);
      resolvedType = parseConversationType(inserted.conversation_type);
      isNew = true;
    }
  } else if (requestedType === "sale" && resolvedType === "chat") {
    const { error: upgradeError } = await supabase
      .from("conversations")
      .update({
        conversation_type: "sale",
        product_title: productTitle,
      })
      .eq("id", conversationId);

    if (upgradeError) {
      return {
        conversationId: null,
        conversationType: null,
        error: formatConversationErrorForUser(upgradeError.message),
      };
    }
    resolvedType = "sale";
    upgradedToSale = true;
  } else if (productTitle) {
    await supabase.from("conversations").update({ product_title: productTitle }).eq("id", conversationId);
  }

  if (!conversationId) {
    return {
      conversationId: null,
      conversationType: null,
      error: "No se pudo crear la conversación.",
    };
  }

  const initial = input.initialMessage?.trim();
  const shouldPostMessage = Boolean(
    initial && (isNew || upgradedToSale || (input.postInitialMessage && !existing)),
  );
  if (shouldPostMessage && initial) {
    await sendMessage({ conversationId, senderId: input.buyerId, content: initial });
  }

  return { conversationId, conversationType: resolvedType, error: null };
}

/** @deprecated Usar `ensureProductConversation`. */
export type EnsureConversationInput = Omit<EnsureProductConversationInput, "conversationType" | "postInitialMessage"> & {
  conversationType?: ConversationType;
};

export async function ensureConversationForProduct(
  input: EnsureConversationInput,
): Promise<{ conversationId: string | null; error: string | null }> {
  const result = await ensureProductConversation({
    productId: input.productId,
    productTitle: input.productTitle,
    buyerId: input.buyerId,
    sellerId: input.sellerId,
    conversationType: input.conversationType ?? "chat",
    initialMessage: input.initialMessage,
    postInitialMessage: false,
  });
  return { conversationId: result.conversationId, error: result.error };
}

/** Id sintético para chats iniciados desde el perfil (sin producto específico). */
export const DIRECT_CONVERSATION_PRODUCT_ID = "__colex_direct__";

export type EnsureConversationWithPeerInput = {
  currentUserId: string;
  peerUserId: string;
  peerDisplayName?: string;
};

/** Última conversación entre dos usuarios (cualquier producto o chat directo). */
export async function findLatestConversationBetweenUsers(
  userA: string,
  userB: string,
): Promise<{ conversationId: string | null; error: string | null }> {
  if (!hasSupabaseEnv) {
    return { conversationId: null, error: "Supabase no está configurado." };
  }

  const { data, error } = await supabase
    .from("conversations")
    .select("id")
    .or(`and(buyer_id.eq.${userA},seller_id.eq.${userB}),and(buyer_id.eq.${userB},seller_id.eq.${userA})`)
    .order("updated_at", { ascending: false })
    .limit(1);

  if (error) {
    return { conversationId: null, error: formatConversationErrorForUser(error.message) };
  }

  const id = data?.[0]?.id;
  return { conversationId: id != null ? String(id) : null, error: null };
}

/**
 * Abre o crea chat con otro usuario (desde perfil público).
 * Reutiliza la conversación más reciente entre ambos; si no hay ninguna, crea una directa.
 */
export async function ensureConversationWithPeer(
  input: EnsureConversationWithPeerInput,
): Promise<{ conversationId: string | null; error: string | null }> {
  if (!hasSupabaseEnv) {
    return { conversationId: null, error: "Supabase no está configurado." };
  }
  if (!isUuid(input.currentUserId) || !isUuid(input.peerUserId)) {
    return { conversationId: null, error: "Este perfil no tiene cuenta válida para chatear." };
  }
  if (input.currentUserId === input.peerUserId) {
    return { conversationId: null, error: "No podés enviarte mensajes a vos mismo." };
  }

  const existing = await findLatestConversationBetweenUsers(input.currentUserId, input.peerUserId);
  if (existing.error) {
    return { conversationId: null, error: existing.error };
  }
  if (existing.conversationId) {
    return { conversationId: existing.conversationId, error: null };
  }

  const label = input.peerDisplayName?.trim() || "Usuario";
  const result = await ensureProductConversation({
    productId: DIRECT_CONVERSATION_PRODUCT_ID,
    productTitle: `Chat con ${label}`,
    buyerId: input.currentUserId,
    sellerId: input.peerUserId,
    conversationType: "chat",
  });
  return { conversationId: result.conversationId, error: result.error };
}

function orderConversationKey(productId: string, buyerId: string): string {
  return `${productId}:${buyerId}`;
}

/** Conversaciones de venta (o chat) por producto + comprador, para el panel de ventas. */
export async function findSaleConversationIdsForSeller(
  sellerId: string,
  pairs: Array<{ productId: string; buyerId: string }>,
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (!hasSupabaseEnv || !isUuid(sellerId) || pairs.length === 0) return map;

  const productIds = [...new Set(pairs.map((p) => p.productId))];
  const buyerIds = [...new Set(pairs.map((p) => p.buyerId).filter(isUuid))];
  if (productIds.length === 0 || buyerIds.length === 0) return map;

  const { data, error } = await supabase
    .from("conversations")
    .select("id, product_id, buyer_id, conversation_type")
    .eq("seller_id", sellerId)
    .in("product_id", productIds)
    .in("buyer_id", buyerIds);

  if (error || !data) return map;

  for (const raw of data) {
    const row = raw as { id: string; product_id: string; buyer_id: string; conversation_type: string };
    const key = orderConversationKey(row.product_id, row.buyer_id);
    const id = String(row.id);
    const type = parseConversationType(row.conversation_type);
    if (type === "sale") {
      map.set(key, id);
    } else if (!map.has(key)) {
      map.set(key, id);
    }
  }
  return map;
}

async function fetchProfilesMap(userIds: string[]): Promise<Map<string, ProfileRow>> {
  const map = new Map<string, ProfileRow>();
  const unique = [...new Set(userIds.filter(isUuid))];
  if (unique.length === 0) return map;

  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,username,full_name,phone,institution,bio,location,created_at,updated_at")
    .in("id", unique);

  if (error || !data) return map;

  for (const row of data) {
    const id = String((row as { id: string }).id);
    map.set(id, row as ProfileRow);
  }
  return map;
}

function mapMessagesToUi(messages: DbMessage[], currentUserId: string): ChatMessage[] {
  return messages.map((m) => ({
    id: m.id,
    sender: m.sender_id === currentUserId ? "me" : "peer",
    text: m.content,
    imageUrl: m.image_url,
    messageType: m.message_type,
    createdAt: m.created_at,
  }));
}

function buildUiConversation(
  row: DbConversation,
  currentUserId: string,
  peerProfile: ProfileRow | null,
  messages: ChatMessage[],
  lastPreview: { preview: string; createdAt: string } | null,
): Conversation {
  const peerId = row.buyer_id === currentUserId ? row.seller_id : row.buyer_id;
  const peerName = profileDisplayName(peerProfile, "Usuario Colex");
  const peerEmail = profilePeerSubtitle(peerProfile);

  const lastMsg = messages.length > 0 ? messages[messages.length - 1]! : null;
  const lastText =
    lastPreview?.preview ??
    (lastMsg
      ? chatMessagePreviewText(lastMsg.text, lastMsg.messageType, lastMsg.imageUrl)
      : null);
  const lastAt = lastPreview?.createdAt ?? lastMsg?.createdAt ?? row.updated_at;

  return {
    id: row.id,
    productId: row.product_id,
    productLabel: row.product_title,
    conversationType: row.conversation_type,
    peerId,
    peerName,
    peerEmail,
    peerInitials: initialsFromLabel(peerName),
    peerIsVerified: isProfileVerified(peerProfile),
    lastMessage: lastText ?? "Sin mensajes aún",
    lastMessageAt: lastAt,
    messages,
  };
}

export async function fetchConversationsForUser(
  userId: string,
): Promise<{ conversations: Conversation[]; error: string | null }> {
  if (!hasSupabaseEnv) {
    return { conversations: [], error: "Supabase no está configurado." };
  }

  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("updated_at", { ascending: false });

  if (error) {
    return { conversations: [], error: formatConversationErrorForUser(error.message) };
  }

  const rows = (data ?? []).map((r) => rowToConversation(r as Record<string, unknown>));
  if (rows.length === 0) {
    return { conversations: [], error: null };
  }

  const peerIds = rows.map((r) => (r.buyer_id === userId ? r.seller_id : r.buyer_id));
  const profiles = await fetchProfilesMap(peerIds);

  const convIds = rows.map((r) => r.id);
  const { data: msgRows } = await supabase
    .from("messages")
    .select("conversation_id, content, message_type, image_url, created_at")
    .in("conversation_id", convIds)
    .order("created_at", { ascending: false });

  const lastByConv = new Map<string, { preview: string; createdAt: string }>();
  for (const raw of msgRows ?? []) {
    const cid = String((raw as { conversation_id: string }).conversation_id);
    if (!lastByConv.has(cid)) {
      const row = raw as {
        content: string;
        message_type?: string;
        image_url?: string | null;
        created_at: string;
      };
      const imageUrl =
        typeof row.image_url === "string" && row.image_url.trim() ? row.image_url.trim() : null;
      const messageType = row.message_type === "image" || imageUrl ? "image" : "text";
      lastByConv.set(cid, {
        preview: chatMessagePreviewText(row.content ?? "", messageType, imageUrl),
        createdAt: String(row.created_at),
      });
    }
  }

  const conversations = rows.map((row) => {
    const peerId = row.buyer_id === userId ? row.seller_id : row.buyer_id;
    return buildUiConversation(row, userId, profiles.get(peerId) ?? null, [], lastByConv.get(row.id) ?? null);
  });

  return { conversations, error: null };
}

export async function fetchConversationMessages(
  conversationId: string,
  userId: string,
): Promise<{ conversation: Conversation | null; error: string | null }> {
  if (!hasSupabaseEnv) {
    return { conversation: null, error: "Supabase no está configurado." };
  }

  const { data: convData, error: convError } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .maybeSingle();

  if (convError) {
    return { conversation: null, error: formatConversationErrorForUser(convError.message) };
  }
  if (!convData) {
    return { conversation: null, error: "Conversación no encontrada." };
  }

  const row = rowToConversation(convData as Record<string, unknown>);
  if (row.buyer_id !== userId && row.seller_id !== userId) {
    return { conversation: null, error: "No tenés acceso a esta conversación." };
  }

  const { data: msgData, error: msgError } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (msgError) {
    return { conversation: null, error: formatConversationErrorForUser(msgError.message) };
  }

  const messages = (msgData ?? []).map((m) => rowToMessage(m as Record<string, unknown>));
  const uiMessages = mapMessagesToUi(messages, userId);
  const peerId = row.buyer_id === userId ? row.seller_id : row.buyer_id;
  const profiles = await fetchProfilesMap([peerId]);
  const lastMsg = uiMessages.length > 0 ? uiMessages[uiMessages.length - 1]! : null;
  const lastPreview = lastMsg
    ? {
        preview: chatMessagePreviewText(lastMsg.text, lastMsg.messageType, lastMsg.imageUrl),
        createdAt: lastMsg.createdAt,
      }
    : null;

  return {
    conversation: buildUiConversation(row, userId, profiles.get(peerId) ?? null, uiMessages, lastPreview),
    error: null,
  };
}

export type SendMessageInput = {
  conversationId: string;
  senderId: string;
  content?: string;
  imageUrl?: string | null;
};

export async function sendMessage(
  input: SendMessageInput,
): Promise<{ message: ChatMessage | null; error: string | null }> {
  const content = input.content?.trim() ?? "";
  const imageUrl = input.imageUrl?.trim() || null;

  if (!content && !imageUrl) {
    return { message: null, error: "Escribí un mensaje o adjuntá una imagen." };
  }

  const messageType = imageUrl ? "image" : "text";

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: input.conversationId,
      sender_id: input.senderId,
      content: content || "",
      image_url: imageUrl,
      message_type: messageType,
    })
    .select("*")
    .single();

  if (error) {
    return { message: null, error: formatConversationErrorForUser(error.message) };
  }

  const row = rowToMessage(data as Record<string, unknown>);

  if (hasSupabaseEnv) {
    const { data: convData } = await supabase
      .from("conversations")
      .select("buyer_id, seller_id, product_title")
      .eq("id", input.conversationId)
      .maybeSingle();

    if (convData) {
      const conv = convData as { buyer_id: string; seller_id: string; product_title: string };
      const recipientId =
        conv.buyer_id === input.senderId ? conv.seller_id : conv.buyer_id;
      if (recipientId && recipientId !== input.senderId) {
        void notifyRecipientNewMessage({
          recipientId,
          productTitle: conv.product_title || "Producto",
          preview: chatMessagePreviewText(row.content, row.message_type, row.image_url),
        });
      }
    }
  }

  return {
    message: {
      id: row.id,
      sender: "me",
      text: row.content,
      imageUrl: row.image_url,
      messageType: row.message_type,
      createdAt: row.created_at,
    },
    error: null,
  };
}
