"use client";

import { useEffect, useRef } from "react";
import { subscribePostgresChanges } from "@/src/lib/supabase/realtime-subscribe";
import {
  fetchOrdersForBuyer,
  fetchSellerSalesPanel,
} from "@/src/services/orders";

type OrdersRealtimeOptions = {
  enabled?: boolean;
  onBuyerOrders?: (orders: Awaited<ReturnType<typeof fetchOrdersForBuyer>>["orders"]) => void;
  onSellerRows?: (rows: Awaited<ReturnType<typeof fetchSellerSalesPanel>>["rows"]) => void;
  onError?: (message: string | null) => void;
};

/**
 * Sincroniza compras y ventas del perfil cuando cambia el estado de una orden.
 */
export function useOrdersRealtime(userId: string | null | undefined, options: OrdersRealtimeOptions) {
  const { enabled = true, onBuyerOrders, onSellerRows, onError } = options;
  const refreshRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    refreshRef.current = async () => {
      if (!userId) return;
      const [buyer, seller] = await Promise.all([
        fetchOrdersForBuyer(userId),
        fetchSellerSalesPanel(userId),
      ]);
      if (!buyer.error) onBuyerOrders?.(buyer.orders);
      if (!seller.error) onSellerRows?.(seller.rows);
      onError?.(buyer.error ?? seller.error);
    };
  }, [userId, onBuyerOrders, onSellerRows, onError]);

  useEffect(() => {
    if (!enabled || !userId) return;

    let debounce: ReturnType<typeof setTimeout> | null = null;
    const scheduleRefresh = () => {
      if (debounce) clearTimeout(debounce);
      debounce = setTimeout(() => {
        void refreshRef.current?.();
      }, 300);
    };

    const unsub = subscribePostgresChanges(
      `orders:${userId}`,
      [
        { event: "INSERT", table: "orders" },
        { event: "UPDATE", table: "orders" },
      ],
      scheduleRefresh,
    );

    return () => {
      unsub();
      if (debounce) clearTimeout(debounce);
    };
  }, [enabled, userId]);
}
