import { BUYER_DELIVERY_OPTIONS } from "@/src/lib/checkout";
import { ensureProductConversation } from "@/src/services/conversations";
import type { BuyerDeliveryChoice } from "@/src/types/order";

export function buildSaleCoordinationMessage(delivery: BuyerDeliveryChoice): string {
  const label =
    BUYER_DELIVERY_OPTIONS.find((o) => o.value === delivery)?.label ?? "A coordinar con el vendedor";
  return `Hola, confirmé la compra de este producto. Elegí «${label}» y quiero coordinar la entrega.`;
}

export type StartSaleCoordinationInput = {
  productId: string;
  productTitle: string;
  buyerId: string;
  sellerId: string;
  buyerDelivery: BuyerDeliveryChoice;
};

/** Crea o reutiliza conversación de venta y envía mensaje con el método de entrega elegido. */
export async function startSaleCoordinationChat(
  input: StartSaleCoordinationInput,
): Promise<{ conversationId: string | null; error: string | null }> {
  const result = await ensureProductConversation({
    productId: input.productId,
    productTitle: input.productTitle,
    buyerId: input.buyerId,
    sellerId: input.sellerId,
    conversationType: "sale",
    initialMessage: buildSaleCoordinationMessage(input.buyerDelivery),
    postInitialMessage: false,
  });
  return { conversationId: result.conversationId, error: result.error };
}
