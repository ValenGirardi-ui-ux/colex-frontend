"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { OrderReviewBlock } from "@/app/components/reviews/order-review-block";
import { profileDisplayName } from "@/src/lib/chat-display";
import { fetchProfilesByUserIds } from "@/src/services/profiles";
import {
  ORDER_STATUSES,
  formatOrderStatus,
  orderStatusBadgeClass,
} from "@/src/lib/order-status";
import { formatArsPrice } from "@/src/lib/money";
import { updateOrderStatusBySeller } from "@/src/services/orders";
import type { Order, OrderStatus } from "@/src/types/order";

type ProfileOrdersListProps = {
  orders: Order[];
  mode: "buyer" | "seller";
  sellerId?: string | null;
  currentUserId?: string | null;
  onOrderUpdated?: (order: Order) => void;
  loadError?: string | null;
};

function formatOrderDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("es-AR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function deliveryShort(method: Order["buyer_delivery_method"]): string {
  return method === "envio_domicilio" ? "Envío a domicilio" : "Retiro en persona";
}

export function ProfileOrdersList({
  orders,
  mode,
  sellerId,
  currentUserId,
  onOrderUpdated,
  loadError,
}: ProfileOrdersListProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [sellerNames, setSellerNames] = useState<Map<string, string>>(new Map());

  const sellerIds = useMemo(() => {
    if (mode !== "buyer") return [];
    return [...new Set(orders.map((o) => o.seller_id).filter((id): id is string => Boolean(id)))];
  }, [orders, mode]);

  useEffect(() => {
    if (sellerIds.length === 0) {
      setSellerNames(new Map());
      return;
    }
    let cancelled = false;
    void fetchProfilesByUserIds(sellerIds).then((profiles) => {
      if (cancelled) return;
      const map = new Map<string, string>();
      for (const id of sellerIds) {
        map.set(id, profileDisplayName(profiles.get(id) ?? null, "Vendedor"));
      }
      setSellerNames(map);
    });
    return () => {
      cancelled = true;
    };
  }, [sellerIds]);

  async function handleStatusChange(orderId: string, status: OrderStatus) {
    if (!sellerId) return;
    setUpdatingId(orderId);
    setUpdateError(null);
    const { order, error } = await updateOrderStatusBySeller(orderId, sellerId, status);
    setUpdatingId(null);
    if (error) {
      setUpdateError(error);
      return;
    }
    if (order) onOrderUpdated?.(order);
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-6 text-sm text-amber-900">
        {loadError}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-200 bg-[#FFFFFF] px-5 py-8 text-center sm:px-6">
        <p className="text-base font-medium text-zinc-900">
          {mode === "buyer" ? "Todavía no tenés compras" : "Todavía no tenés ventas"}
        </p>
        <p className="mt-1.5 text-sm text-zinc-600">
          {mode === "buyer"
            ? "Cuando compres un artículo, aparecerá acá con su estado."
            : "Cuando alguien compre tus publicaciones, las verás acá."}
        </p>
        {mode === "buyer" ? (
          <Link
            href="/"
            className="mt-4 inline-block text-sm font-medium text-[#822020] underline-offset-2 hover:underline"
          >
            Explorar catálogo
          </Link>
        ) : (
          <Link
            href="/vender"
            className="mt-4 inline-flex rounded-full bg-[#822020] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#6d1b1b]"
          >
            Publicar artículo
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {updateError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800" role="alert">
          {updateError}
        </p>
      ) : null}
      <ul className="space-y-3">
        {orders.map((order) => (
          <li
            key={order.id}
            className="min-w-0 rounded-xl border border-zinc-100 bg-zinc-50/30 p-4 sm:p-5"
          >
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/producto/${encodeURIComponent(order.product_id)}`}
                  className="break-words text-base font-semibold text-zinc-900 hover:text-[#822020]"
                >
                  {order.product_title}
                </Link>
                <p className="mt-1 text-sm text-zinc-600">{deliveryShort(order.buyer_delivery_method)}</p>
                <p className="mt-1 text-sm text-zinc-500">{formatOrderDate(order.created_at)}</p>
                <p className="mt-2 text-base font-semibold text-zinc-900">
                  {formatArsPrice(order.total_amount)}
                </p>
              </div>
              <div className="flex w-full min-w-0 shrink-0 flex-col items-stretch gap-2 sm:w-auto sm:items-end">
                {mode === "seller" && sellerId ? (
                  <label className="flex w-full flex-col gap-1 sm:w-auto sm:items-end">
                    <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Estado
                    </span>
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) =>
                        void handleStatusChange(order.id, e.target.value as OrderStatus)
                      }
                      className="min-h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 sm:min-w-[11rem] disabled:opacity-60"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {formatOrderStatus(s)}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${orderStatusBadgeClass(order.status)}`}
                  >
                    {formatOrderStatus(order.status)}
                  </span>
                )}
              </div>
            </div>
            {mode === "buyer" && currentUserId && order.seller_id ? (
              <div className="mt-3 border-t border-zinc-100 pt-3">
                <OrderReviewBlock
                  order={order}
                  currentUserId={currentUserId}
                  counterpartyDisplayName={sellerNames.get(order.seller_id) ?? "el vendedor"}
                />
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
