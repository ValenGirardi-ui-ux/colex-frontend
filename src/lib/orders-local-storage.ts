import type { Order } from "@/src/types/order";

const STORAGE_KEY = "colex_orders_local_v1";

export function appendLocalOrder(order: Order): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: Order[] = raw ? (JSON.parse(raw) as Order[]) : [];
    list.unshift(order);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 50)));
  } catch {
    /* ignore */
  }
}
