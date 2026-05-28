import { startSaleCoordinationChat } from "@/src/lib/sale-conversation";
import { getOrCreateOrderForCheckout, markOrderPaidByBuyer } from "@/src/services/orders";
import type { BuyerDeliveryChoice, Order } from "@/src/types/order";
import type { Product } from "@/src/types/product";

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function saleChatHref(conversationId: string): string {
  return `/mensajes?conv=${encodeURIComponent(conversationId)}&tab=ventas`;
}

export type CompleteCheckoutPurchaseInput = {
  buyerId: string;
  product: Product;
  buyerDelivery: BuyerDeliveryChoice;
  shippingFee: number;
  totalAmount: number;
  buyerLocationLabel?: string | null;
  shippingDistanceKm?: number | null;
  /** Tras pago mock: orden en estado pagado. */
  phase?: "start" | "paid";
};

export type CompleteCheckoutPurchaseResult = {
  order: Order | null;
  conversationId: string | null;
  redirectHref: string | null;
  error: string | null;
};

/**
 * Tras confirmar checkout: reutiliza o crea orden, abre chat de venta, devuelve ruta a Ventas.
 */
export async function completeCheckoutPurchase(
  input: CompleteCheckoutPurchaseInput,
): Promise<CompleteCheckoutPurchaseResult> {
  if (!isUuid(input.product.user_id)) {
    return {
      order: null,
      conversationId: null,
      redirectHref: null,
      error: "Este producto no tiene vendedor con cuenta para completar la compra.",
    };
  }

  const phase = input.phase ?? "paid";

  const { order, error: orderError, savedLocally } = await getOrCreateOrderForCheckout({
    buyerId: input.buyerId,
    product: input.product,
    buyerDelivery: input.buyerDelivery,
    shippingFee: input.shippingFee,
    totalAmount: input.totalAmount,
    buyerLocationLabel: input.buyerLocationLabel,
    shippingDistanceKm: input.shippingDistanceKm,
    phase,
  });

  if (orderError && !order) {
    return {
      order: null,
      conversationId: null,
      redirectHref: null,
      error: orderError,
    };
  }

  if (!order) {
    return {
      order: null,
      conversationId: null,
      redirectHref: null,
      error: "No se pudo registrar la compra.",
    };
  }

  let finalOrder = order;
  if (phase === "paid" && order.status !== "pagado") {
    const { order: paidOrder, error: payError } = await markOrderPaidByBuyer(order.id, input.buyerId);
    if (payError || !paidOrder) {
      return {
        order,
        conversationId: null,
        redirectHref: null,
        error: payError ?? "No se pudo registrar el pago.",
      };
    }
    finalOrder = paidOrder;
  }

  const { conversationId, error: chatError } = await startSaleCoordinationChat({
    productId: input.product.id,
    productTitle: input.product.title,
    buyerId: input.buyerId,
    sellerId: input.product.user_id,
    buyerDelivery: input.buyerDelivery,
  });

  if (chatError || !conversationId) {
    return {
      order,
      conversationId: null,
      redirectHref: null,
      error:
        chatError ??
        (savedLocally
          ? "Compra registrada localmente, pero no se pudo abrir el chat de venta."
          : "No se pudo abrir el chat de venta."),
    };
  }

  return {
    order: finalOrder,
    conversationId,
    redirectHref: saleChatHref(conversationId),
    error: null,
  };
}
