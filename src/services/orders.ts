import { profileDisplayName } from "@/src/lib/chat-display";
import { formatOrderStatus } from "@/src/lib/order-status";
import { appendLocalOrder } from "@/src/lib/orders-local-storage";
import { normalizeOrderStatus, resolveInitialOrderStatus } from "@/src/lib/order-status";
import {
  notifyBuyerOrderStatus,
  notifySellerOrderPaid,
  notifySellerPurchaseInterest,
} from "@/src/services/notifications";
import { findSaleConversationIdsForSeller } from "@/src/services/conversations";
import { fetchProfilesByUserIds } from "@/src/services/profiles";
import { hasSupabaseEnv, supabase } from "@/src/lib/supabase/client";
import type { ProfileRow } from "@/src/types/profile";
import { isProfileVerified } from "@/src/lib/profile-verified";
import type { BuyerDeliveryChoice, Order, OrderInsert, OrderStatus, SellerOrderRow } from "@/src/types/order";
import type { Product } from "@/src/types/product";

export type CreateOrderInput = {
  buyerId: string;
  product: Product;
  buyerDelivery: BuyerDeliveryChoice;
  shippingFee: number;
  totalAmount: number;
  buyerLocationLabel?: string | null;
  shippingDistanceKm?: number | null;
  /** Si no se indica, se deduce del método de entrega (inicio de compra o pago). */
  status?: OrderStatus;
  /** `paid` marca la orden como pagada tras checkout con envío. */
  phase?: "start" | "paid";
};

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function rowToOrder(row: Record<string, unknown>): Order {
  return {
    id: String(row.id ?? ""),
    buyer_id: String(row.buyer_id ?? ""),
    product_id: String(row.product_id ?? ""),
    seller_id: row.seller_id != null ? String(row.seller_id) : null,
    product_title: String(row.product_title ?? ""),
    product_price: Number(row.product_price) || 0,
    buyer_delivery_method: row.buyer_delivery_method as BuyerDeliveryChoice,
    shipping_fee: Number(row.shipping_fee) || 0,
    total_amount: Number(row.total_amount) || 0,
    status: normalizeOrderStatus(row.status != null ? String(row.status) : null),
    created_at: String(row.created_at ?? new Date().toISOString()),
    buyer_location_label:
      row.buyer_location_label != null ? String(row.buyer_location_label) : null,
    shipping_distance_km:
      row.shipping_distance_km != null ? Number(row.shipping_distance_km) : null,
  };
}

export function formatOrderErrorForUser(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("row-level security") || m.includes("policy")) {
    return "No se pudo guardar la compra. Revisá las políticas de orders en Supabase.";
  }
  if (m.includes("schema cache") || m.includes("could not find the table")) {
    return "Falta la tabla orders. Ejecutá supabase/orders-setup.sql en Supabase.";
  }
  if (m.includes("orders_status_check") || m.includes("check constraint")) {
    return "Falta la migración de estados de compra. Ejecutá supabase/migrations/20260515930000_order_status_states.sql.";
  }
  return message || "No se pudo registrar la compra.";
}

function resolveStatus(input: CreateOrderInput): OrderStatus {
  if (input.status) return input.status;
  const phase = input.phase ?? "start";
  return resolveInitialOrderStatus(input.buyerDelivery, phase === "paid" ? "paid" : "start");
}

const OPEN_ORDER_STATUSES: OrderStatus[] = ["pendiente", "coordinando"];

/** Evita duplicar órdenes si el comprador vuelve a confirmar el checkout. */
export async function findOpenOrderForProductBuyer(
  buyerId: string,
  productId: string,
): Promise<Order | null> {
  if (!hasSupabaseEnv || !isUuid(buyerId)) return null;

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("buyer_id", buyerId)
    .eq("product_id", productId)
    .in("status", OPEN_ORDER_STATUSES)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return rowToOrder(data as Record<string, unknown>);
}

export async function getOrCreateOrderForCheckout(
  input: CreateOrderInput,
): Promise<{ order: Order | null; error: string | null; savedLocally: boolean; reused: boolean }> {
  const existing = await findOpenOrderForProductBuyer(input.buyerId, input.product.id);
  if (existing) {
    return { order: existing, error: null, savedLocally: false, reused: true };
  }

  const created = await createOrder(input);
  return { ...created, reused: false };
}

export async function createOrder(
  input: CreateOrderInput,
): Promise<{ order: Order | null; error: string | null; savedLocally: boolean }> {
  const status = resolveStatus(input);
  const payload: OrderInsert = {
    buyer_id: input.buyerId,
    product_id: input.product.id,
    seller_id: isUuid(input.product.user_id) ? input.product.user_id : null,
    product_title: input.product.title,
    product_price: input.product.price,
    buyer_delivery_method: input.buyerDelivery,
    shipping_fee: input.shippingFee,
    total_amount: input.totalAmount,
    status,
    buyer_location_label: input.buyerLocationLabel ?? null,
    shipping_distance_km: input.shippingDistanceKm ?? null,
  };

  if (hasSupabaseEnv) {
    const { data, error } = await supabase.from("orders").insert(payload).select("*").single();

    if (!error && data) {
      const order = rowToOrder(data as Record<string, unknown>);
      if (order.seller_id && isUuid(order.seller_id)) {
        void notifySellerPurchaseInterest({
          sellerId: order.seller_id,
          productTitle: order.product_title,
        });
      }
      return { order, error: null, savedLocally: false };
    }

    if (error) {
      const fallback: Order = {
        id: `local-${Date.now()}`,
        created_at: new Date().toISOString(),
        ...payload,
      };
      appendLocalOrder(fallback);
      return {
        order: fallback,
        error: formatOrderErrorForUser(error.message),
        savedLocally: true,
      };
    }
  }

  const localOrder: Order = {
    id: `local-${Date.now()}`,
    created_at: new Date().toISOString(),
    ...payload,
  };
  appendLocalOrder(localOrder);
  return { order: localOrder, error: null, savedLocally: true };
}

export async function fetchOrdersForBuyer(buyerId: string): Promise<{
  orders: Order[];
  error: string | null;
}> {
  if (!hasSupabaseEnv || !isUuid(buyerId)) {
    return { orders: [], error: null };
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false });

  if (error) {
    return { orders: [], error: formatOrderErrorForUser(error.message) };
  }

  return {
    orders: (data ?? []).map((row) => rowToOrder(row as Record<string, unknown>)),
    error: null,
  };
}

export async function fetchOrdersForSeller(sellerId: string): Promise<{
  orders: Order[];
  error: string | null;
}> {
  if (!hasSupabaseEnv || !isUuid(sellerId)) {
    return { orders: [], error: null };
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });

  if (error) {
    return { orders: [], error: formatOrderErrorForUser(error.message) };
  }

  return {
    orders: (data ?? []).map((row) => rowToOrder(row as Record<string, unknown>)),
    error: null,
  };
}

function enrichOrdersForSellerPanel(
  orders: Order[],
  profiles: Map<string, ProfileRow>,
  conversations: Map<string, string>,
): SellerOrderRow[] {
  return orders.map((order) => {
    const convKey = `${order.product_id}:${order.buyer_id}`;
    const buyerProfile = profiles.get(order.buyer_id) ?? null;
    return {
      ...order,
      buyerDisplayName: profileDisplayName(buyerProfile, "Comprador"),
      buyerIsVerified: isProfileVerified(buyerProfile),
      saleConversationId: conversations.get(convKey) ?? null,
    };
  });
}

/** Órdenes del vendedor con nombre del comprador y enlace al chat de venta. */
export async function fetchSellerSalesPanel(sellerId: string): Promise<{
  rows: SellerOrderRow[];
  error: string | null;
}> {
  const { orders, error } = await fetchOrdersForSeller(sellerId);
  if (error) return { rows: [], error };
  if (orders.length === 0) return { rows: [], error: null };

  const buyerIds = orders.map((o) => o.buyer_id);
  const pairs = orders.map((o) => ({ productId: o.product_id, buyerId: o.buyer_id }));

  const [profiles, conversations] = await Promise.all([
    fetchProfilesByUserIds(buyerIds),
    findSaleConversationIdsForSeller(
      sellerId,
      pairs.filter((p) => isUuid(p.buyerId)),
    ),
  ]);

  return {
    rows: enrichOrdersForSellerPanel(orders, profiles, conversations),
    error: null,
  };
}

/** Comprador: pasa de pendiente a pagado tras pago simulado. */
export async function markOrderPaidByBuyer(
  orderId: string,
  buyerId: string,
): Promise<{ order: Order | null; error: string | null }> {
  if (!hasSupabaseEnv || !isUuid(orderId) || !isUuid(buyerId)) {
    return { order: null, error: "No se pudo actualizar el estado de la compra." };
  }

  const { data, error } = await supabase
    .from("orders")
    .update({ status: "pagado" })
    .eq("id", orderId)
    .eq("buyer_id", buyerId)
    .select("*")
    .maybeSingle();

  if (error) {
    return { order: null, error: formatOrderErrorForUser(error.message) };
  }
  if (!data) {
    return { order: null, error: "No se encontró la compra o no se pudo marcar como pagada." };
  }

  const order = rowToOrder(data as Record<string, unknown>);
  if (order.seller_id && isUuid(order.seller_id)) {
    void notifySellerOrderPaid({
      sellerId: order.seller_id,
      productTitle: order.product_title,
    });
  }

  return { order, error: null };
}

/** Vendedor: actualiza el estado de una venta. */
export async function updateOrderStatusBySeller(
  orderId: string,
  sellerId: string,
  status: OrderStatus,
): Promise<{ order: Order | null; error: string | null }> {
  if (!hasSupabaseEnv || !isUuid(orderId) || !isUuid(sellerId)) {
    return { order: null, error: "No se pudo actualizar el estado." };
  }

  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .eq("seller_id", sellerId)
    .select("*")
    .maybeSingle();

  if (error) {
    return { order: null, error: formatOrderErrorForUser(error.message) };
  }
  if (!data) {
    return { order: null, error: "No se encontró la venta." };
  }

  const order = rowToOrder(data as Record<string, unknown>);
  if (isUuid(order.buyer_id)) {
    void notifyBuyerOrderStatus({
      buyerId: order.buyer_id,
      productTitle: order.product_title,
      statusLabel: formatOrderStatus(status),
    });
  }

  return { order, error: null };
}
