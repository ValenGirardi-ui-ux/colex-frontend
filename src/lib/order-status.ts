import type { BuyerDeliveryChoice, OrderStatus } from "@/src/types/order";

export const ORDER_STATUSES: OrderStatus[] = [
  "pendiente",
  "coordinando",
  "pagado",
  "enviado",
  "entregado",
  "cancelado",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pendiente: "Pendiente",
  coordinando: "Coordinando",
  pagado: "Pagado",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

const LEGACY_STATUS_MAP: Record<string, OrderStatus> = {
  pending: "pendiente",
  completed: "pagado",
  cancelled: "cancelado",
};

export function normalizeOrderStatus(raw: string | null | undefined): OrderStatus {
  if (!raw) return "pendiente";
  if (LEGACY_STATUS_MAP[raw]) return LEGACY_STATUS_MAP[raw];
  if ((ORDER_STATUSES as string[]).includes(raw)) return raw as OrderStatus;
  return "pendiente";
}

export function formatOrderStatus(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}

export function orderStatusBadgeClass(status: OrderStatus): string {
  switch (status) {
    case "pendiente":
      return "bg-amber-50 text-amber-900 ring-amber-200/80";
    case "coordinando":
      return "bg-sky-50 text-sky-900 ring-sky-200/80";
    case "pagado":
      return "bg-emerald-50 text-emerald-900 ring-emerald-200/80";
    case "enviado":
      return "bg-indigo-50 text-indigo-900 ring-indigo-200/80";
    case "entregado":
      return "bg-zinc-100 text-zinc-800 ring-zinc-200/80";
    case "cancelado":
      return "bg-red-50 text-red-800 ring-red-200/80";
    default:
      return "bg-zinc-100 text-zinc-800 ring-zinc-200/80";
  }
}

/** Estado al crear la orden según método de entrega y momento del flujo. */
export function resolveInitialOrderStatus(
  delivery: BuyerDeliveryChoice,
  phase: "start" | "paid",
): OrderStatus {
  if (phase === "paid") return "pagado";
  return delivery === "coordinar_vendedor" ? "coordinando" : "pendiente";
}
