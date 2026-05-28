import type { BuyerDeliveryChoice } from "@/src/types/order";

export type CheckoutSession = {
  productId: string;
  buyerDelivery: BuyerDeliveryChoice;
  subtotal: number;
  shippingFee: number;
  total: number;
  buyerLocalityId: string | null;
  buyerLocationLabel: string | null;
  shippingDistanceKm: number | null;
  shippingNote: string | null;
  /** Orden en Supabase creada al confirmar checkout. */
  orderId?: string | null;
  /** Conversación de venta tras confirmar checkout. */
  conversationId?: string | null;
};

const STORAGE_KEY = "colex_checkout_v2";

function readAll(): Record<string, CheckoutSession> {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, CheckoutSession>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, CheckoutSession>): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* quota / private mode */
  }
}

export function saveCheckoutSession(session: CheckoutSession): void {
  const all = readAll();
  all[session.productId] = session;
  writeAll(all);
}

export function getCheckoutSession(productId: string): CheckoutSession | null {
  const session = readAll()[productId];
  if (!session || session.productId !== productId) return null;
  return session;
}

export function clearCheckoutSession(productId: string): void {
  const all = readAll();
  delete all[productId];
  writeAll(all);
}
