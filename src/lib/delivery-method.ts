import type { SellDeliveryMethod } from "@/src/types/product";

export const SELL_DELIVERY_OPTIONS: ReadonlyArray<{
  value: SellDeliveryMethod;
  label: string;
  sub: string;
  recommended?: boolean;
}> = [
  { value: "retiro", label: "Retiro en persona", sub: "Coordinás punto de encuentro" },
  {
    value: "envio_domicilio",
    label: "Envío a domicilio",
    sub: "Colex hace el envío, se le cobrará un poco más al comprador.",
  },
  {
    value: "ambos",
    label: "Ambos",
    sub: "Retiro en persona + envío a domicilio",
    recommended: true,
  },
];

const FORM_DELIVERY_VALUES = new Set<string>(SELL_DELIVERY_OPTIONS.map((o) => o.value));

const STORED_DELIVERY_VALUES = new Set<string>([
  "retiro",
  "envio",
  "envio_domicilio",
  "ambos",
]);

export type SellFormDeliveryMethod = Exclude<SellDeliveryMethod, "envio">;

export function isSellFormDeliveryMethod(
  value: string | null | undefined,
): value is SellFormDeliveryMethod {
  return value != null && FORM_DELIVERY_VALUES.has(value);
}

/** Valores persistidos en DB (incluye `envio` legacy). */
export function isSellDeliveryMethod(value: string | null | undefined): value is SellDeliveryMethod {
  return value != null && STORED_DELIVERY_VALUES.has(value);
}

/** Normaliza valor guardado para el formulario de venta (sin opción `envio`). */
export function normalizeSellDeliveryForForm(
  value: string | null | undefined,
): SellFormDeliveryMethod | "" {
  if (!value) return "";
  if (value === "envio") return "ambos";
  return isSellFormDeliveryMethod(value) ? value : "";
}

export function parseDeliveryMethodForPublish(value: string): SellDeliveryMethod {
  if (value === "envio") return "ambos";
  return isSellFormDeliveryMethod(value) ? value : "ambos";
}

export function getDeliveryMethodDisplay(
  method: SellDeliveryMethod | null | undefined,
): { label: string; description?: string } {
  if (method === "envio") {
    return { label: "Envío", description: "Acordás envío con el comprador" };
  }
  const found = SELL_DELIVERY_OPTIONS.find((o) => o.value === method);
  if (found) return { label: found.label, description: found.sub };
  return { label: "A coordinar con el vendedor" };
}
