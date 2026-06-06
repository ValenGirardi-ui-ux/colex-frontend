import { buildSaleCoordinationMessage } from "@/src/lib/sale-conversation";
import { createServiceRoleClient } from "@/src/lib/supabase/admin-service";
import type { BuyerDeliveryChoice, OrderStatus } from "@/src/types/order";

type OrderRow = {
  id: string;
  buyer_id: string;
  seller_id: string | null;
  product_id: string;
  product_title: string;
  buyer_delivery_method: BuyerDeliveryChoice;
  status: string;
  mp_payment_id: string | null;
};

const OPEN_STATUSES: OrderStatus[] = ["pendiente", "coordinando"];

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function rowToOrder(raw: Record<string, unknown>): OrderRow | null {
  const id = typeof raw.id === "string" ? raw.id : null;
  if (!id) return null;
  return {
    id,
    buyer_id: typeof raw.buyer_id === "string" ? raw.buyer_id : "",
    seller_id: typeof raw.seller_id === "string" ? raw.seller_id : null,
    product_id: typeof raw.product_id === "string" ? raw.product_id : "",
    product_title: typeof raw.product_title === "string" ? raw.product_title : "Producto",
    buyer_delivery_method:
      raw.buyer_delivery_method === "envio_domicilio"
        ? "envio_domicilio"
        : "coordinar_vendedor",
    status: typeof raw.status === "string" ? raw.status : "pendiente",
    mp_payment_id: typeof raw.mp_payment_id === "string" ? raw.mp_payment_id : null,
  };
}

async function insertNotification(
  db: ReturnType<typeof createServiceRoleClient>,
  userId: string,
  type: "purchase_interest" | "new_message" | "order_status",
  title: string,
  message: string,
): Promise<void> {
  if (!isUuid(userId)) return;
  await db.from("notifications").insert({
    user_id: userId,
    type,
    title: title.slice(0, 200),
    message: message.slice(0, 500),
  });
}

async function ensureSaleConversationServer(
  db: ReturnType<typeof createServiceRoleClient>,
  order: OrderRow,
): Promise<string | null> {
  if (!isUuid(order.buyer_id) || !order.seller_id || !isUuid(order.seller_id)) {
    return null;
  }

  const { data: existing } = await db
    .from("conversations")
    .select("id, conversation_type")
    .eq("product_id", order.product_id)
    .eq("buyer_id", order.buyer_id)
    .eq("seller_id", order.seller_id)
    .maybeSingle();

  let conversationId = existing?.id != null ? String(existing.id) : null;
  let isNew = false;
  let upgradedToSale = false;

  if (!conversationId) {
    const { data: inserted, error } = await db
      .from("conversations")
      .insert({
        product_id: order.product_id,
        product_title: order.product_title,
        buyer_id: order.buyer_id,
        seller_id: order.seller_id,
        conversation_type: "sale",
      })
      .select("id")
      .maybeSingle();

    if (error) {
      const { data: retry } = await db
        .from("conversations")
        .select("id, conversation_type")
        .eq("product_id", order.product_id)
        .eq("buyer_id", order.buyer_id)
        .eq("seller_id", order.seller_id)
        .maybeSingle();
      conversationId = retry?.id != null ? String(retry.id) : null;
    } else if (inserted?.id) {
      conversationId = String(inserted.id);
      isNew = true;
    }
  } else if (existing?.conversation_type === "chat") {
    await db
      .from("conversations")
      .update({ conversation_type: "sale", product_title: order.product_title })
      .eq("id", conversationId);
    upgradedToSale = true;
  }

  if (!conversationId) return null;

  const initialMessage = buildSaleCoordinationMessage(order.buyer_delivery_method);
  if (isNew || upgradedToSale) {
    await db.from("messages").insert({
      conversation_id: conversationId,
      sender_id: order.buyer_id,
      content: initialMessage,
    });
    if (order.seller_id) {
      await insertNotification(
        db,
        order.seller_id,
        "new_message",
        "Nuevo mensaje",
        `Sobre «${order.product_title}»: ${initialMessage.slice(0, 100)}`,
      );
    }
  }

  return conversationId;
}

export type FulfillOrderPaymentResult = {
  ok: boolean;
  alreadyPaid: boolean;
  conversationId: string | null;
  error: string | null;
};

/** Marca la orden como pagada tras confirmación de Mercado Pago (idempotente). */
export async function fulfillOrderAfterMercadoPagoPayment(
  orderId: string,
  mpPaymentId: string,
): Promise<FulfillOrderPaymentResult> {
  if (!isUuid(orderId)) {
    return { ok: false, alreadyPaid: false, conversationId: null, error: "Orden inválida." };
  }

  const db = createServiceRoleClient();

  const { data: raw, error: fetchError } = await db
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (fetchError || !raw) {
    return { ok: false, alreadyPaid: false, conversationId: null, error: "Orden no encontrada." };
  }

  const order = rowToOrder(raw as Record<string, unknown>);
  if (!order) {
    return { ok: false, alreadyPaid: false, conversationId: null, error: "Orden inválida." };
  }

  if (order.status === "pagado") {
    const { data: conv } = await db
      .from("conversations")
      .select("id")
      .eq("product_id", order.product_id)
      .eq("buyer_id", order.buyer_id)
      .eq("seller_id", order.seller_id ?? "")
      .maybeSingle();
    return {
      ok: true,
      alreadyPaid: true,
      conversationId: conv?.id != null ? String(conv.id) : null,
      error: null,
    };
  }

  if (!OPEN_STATUSES.includes(order.status as OrderStatus)) {
    return {
      ok: false,
      alreadyPaid: false,
      conversationId: null,
      error: `La orden no puede marcarse como pagada (estado: ${order.status}).`,
    };
  }

  const { data: updated, error: updateError } = await db
    .from("orders")
    .update({
      status: "pagado",
      mp_payment_id: mpPaymentId,
    })
    .eq("id", orderId)
    .in("status", OPEN_STATUSES)
    .select("*")
    .maybeSingle();

  if (updateError || !updated) {
    return {
      ok: false,
      alreadyPaid: false,
      conversationId: null,
      error: updateError?.message ?? "No se pudo actualizar la orden.",
    };
  }

  const paidOrder = rowToOrder(updated as Record<string, unknown>);
  if (!paidOrder) {
    return { ok: false, alreadyPaid: false, conversationId: null, error: "Error al leer la orden." };
  }

  await insertNotification(
    db,
    paidOrder.buyer_id,
    "order_status",
    "Pago confirmado",
    `Tu compra de «${paidOrder.product_title}» fue acreditada. Coordiná la entrega en Ventas.`,
  );

  if (paidOrder.seller_id && isUuid(paidOrder.seller_id)) {
    await insertNotification(
      db,
      paidOrder.seller_id,
      "order_status",
      "Compra pagada",
      `El comprador pagó «${paidOrder.product_title}».`,
    );
  }

  const conversationId = await ensureSaleConversationServer(db, paidOrder);

  return { ok: true, alreadyPaid: false, conversationId, error: null };
}

/** Rechazo o cancelación de pago: deja la orden cancelada si aún estaba abierta. */
export async function cancelOrderAfterMercadoPagoPayment(
  orderId: string,
  mpPaymentId: string,
): Promise<{ ok: boolean; error: string | null }> {
  if (!isUuid(orderId)) {
    return { ok: false, error: "Orden inválida." };
  }

  const db = createServiceRoleClient();

  const { error } = await db
    .from("orders")
    .update({
      status: "cancelado",
      mp_payment_id: mpPaymentId,
    })
    .eq("id", orderId)
    .in("status", OPEN_STATUSES);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, error: null };
}
