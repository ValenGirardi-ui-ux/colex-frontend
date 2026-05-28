import {
  CORDOBA_SHIPPING_DISCLAIMER,
  validateHomeDelivery,
  type HomeDeliveryValidation,
} from "@/src/lib/cordoba-shipping";
import type { BuyerDeliveryChoice } from "@/src/types/order";

export { CORDOBA_SHIPPING_DISCLAIMER };

export const BUYER_DELIVERY_OPTIONS: ReadonlyArray<{
  value: BuyerDeliveryChoice;
  label: string;
  sub: string;
}> = [
  {
    value: "coordinar_vendedor",
    label: "Retiro en persona",
    sub: "Coordinás lugar y horario con el vendedor por chat.",
  },
  {
    value: "envio_domicilio",
    label: "Envío a domicilio",
    sub: "Colex hace el envío y se agregará un costo extra al total.",
  },
];

const BUYER_DELIVERY_VALUES = new Set<string>(BUYER_DELIVERY_OPTIONS.map((o) => o.value));

export function isBuyerDeliveryChoice(value: string | null | undefined): value is BuyerDeliveryChoice {
  return value != null && BUYER_DELIVERY_VALUES.has(value);
}

export type CheckoutTotals = {
  subtotal: number;
  shippingFee: number;
  total: number;
  distanceKm: number | null;
  buyerLocationLabel: string | null;
  shippingError: string | null;
  sellerLocationEstimated: boolean;
};

export type ComputeCheckoutParams = {
  productPrice: number;
  buyerDelivery: BuyerDeliveryChoice;
  sellerLocation: string | null | undefined;
  buyerLocalityId: string | null | undefined;
};

export function computeCheckoutTotals(params: ComputeCheckoutParams): CheckoutTotals {
  const subtotal = Number.isFinite(params.productPrice) && params.productPrice > 0 ? params.productPrice : 0;

  if (params.buyerDelivery !== "envio_domicilio") {
    return {
      subtotal,
      shippingFee: 0,
      total: subtotal,
      distanceKm: null,
      buyerLocationLabel: null,
      shippingError: null,
      sellerLocationEstimated: false,
    };
  }

  const validation = validateHomeDelivery({
    sellerLocation: params.sellerLocation,
    buyerLocalityId: params.buyerLocalityId,
  });

  if (!validation.valid) {
    return {
      subtotal,
      shippingFee: 0,
      total: subtotal,
      distanceKm: validation.distanceKm,
      buyerLocationLabel: validation.buyerLocationLabel || null,
      shippingError: validation.error,
      sellerLocationEstimated: validation.sellerLocationEstimated,
    };
  }

  return {
    subtotal,
    shippingFee: validation.shippingFee,
    total: subtotal + validation.shippingFee,
    distanceKm: validation.distanceKm,
    buyerLocationLabel: validation.buyerLocationLabel,
    shippingError: null,
    sellerLocationEstimated: validation.sellerLocationEstimated,
  };
}

export function resolveBuyerDeliveryChoice(choice: BuyerDeliveryChoice | ""): BuyerDeliveryChoice {
  return choice === "envio_domicilio" ? "envio_domicilio" : "coordinar_vendedor";
}

export function validateCheckoutBeforePayment(params: ComputeCheckoutParams): {
  ok: boolean;
  totals: CheckoutTotals;
  delivery: BuyerDeliveryChoice;
} {
  const delivery = resolveBuyerDeliveryChoice(params.buyerDelivery);
  const totals = computeCheckoutTotals({ ...params, buyerDelivery: delivery });

  if (delivery === "envio_domicilio" && totals.shippingError) {
    return { ok: false, totals, delivery };
  }

  return { ok: true, totals, delivery };
}

export type { HomeDeliveryValidation };
