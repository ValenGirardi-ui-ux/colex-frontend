"use client";

import Link from "next/link";
import { useState } from "react";
import { BUYER_DELIVERY_OPTIONS } from "@/src/lib/checkout";
import {
  ORDER_STATUSES,
  formatOrderStatus,
  orderStatusBadgeClass,
} from "@/src/lib/order-status";
import { OrderReviewBlock } from "@/app/components/reviews/order-review-block";
import { VerifiedName } from "@/app/components/verified-badge";
import { sellerProfilePath } from "@/src/services/profiles";
import { updateOrderStatusBySeller } from "@/src/services/orders";
import type { BuyerDeliveryChoice, OrderStatus, SellerOrderRow } from "@/src/types/order";

type ProfileSalesPanelProps = {
  rows: SellerOrderRow[];
  sellerId: string | null;
  currentUserId?: string | null;
  loadError?: string | null;
  onOrderUpdated?: (row: SellerOrderRow) => void;
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

function deliveryLabel(method: BuyerDeliveryChoice): string {
  return BUYER_DELIVERY_OPTIONS.find((o) => o.value === method)?.label ?? "A coordinar";
}

function saleChatHref(conversationId: string): string {
  return `/mensajes?conv=${encodeURIComponent(conversationId)}&tab=ventas`;
}

export function ProfileSalesPanel({
  rows,
  sellerId,
  currentUserId,
  loadError,
  onOrderUpdated,
}: ProfileSalesPanelProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

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
    if (!order) return;
    const previous = rows.find((r) => r.id === orderId);
    if (previous) {
      onOrderUpdated?.({
        ...previous,
        ...order,
        buyerDisplayName: previous.buyerDisplayName,
        buyerIsVerified: previous.buyerIsVerified,
        saleConversationId: previous.saleConversationId,
      });
    }
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-6 text-sm text-amber-900">
        {loadError}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-200 bg-[#FFFFFF] px-5 py-8 text-center sm:px-6">
        <p className="text-base font-medium text-zinc-900">Todavía no tenés ventas</p>
        <p className="mt-1.5 text-sm text-zinc-600">
          Cuando alguien compre o coordine un producto tuyo, lo verás acá con el estado y el chat.
        </p>
        <Link
          href="/vender"
          className="mt-4 inline-flex rounded-full bg-[#822020] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#6d1b1b]"
        >
          Publicar artículo
        </Link>
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
        {rows.map((row) => (
          <li
            key={row.id}
            className="min-w-0 rounded-xl border border-zinc-100 bg-zinc-50/30 p-4 sm:p-5"
          >
            <div className="flex min-w-0 flex-col gap-4">
              <div className="grid min-w-0 gap-3 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-[1fr_1fr_auto]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Producto</p>
                  <Link
                    href={`/producto/${encodeURIComponent(row.product_id)}`}
                    className="mt-0.5 block break-words text-base font-semibold text-zinc-900 hover:text-[#822020]"
                  >
                    {row.product_title}
                  </Link>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Comprador</p>
                  <Link
                    href={sellerProfilePath(row.buyer_id)}
                    className="mt-0.5 block text-base font-medium text-zinc-900 hover:text-[#822020]"
                  >
                    <VerifiedName verified={row.buyerIsVerified} nameClassName="font-medium text-zinc-900">
                      {row.buyerDisplayName}
                    </VerifiedName>
                  </Link>
                </div>
                <div className="min-w-0 sm:text-right lg:text-left">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Fecha</p>
                  <p className="mt-0.5 text-sm font-medium text-zinc-800">{formatOrderDate(row.created_at)}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-zinc-100 pt-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <div>
                    <span className="text-zinc-500">Entrega: </span>
                    <span className="font-medium text-zinc-800">
                      {deliveryLabel(row.buyer_delivery_method)}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Estado: </span>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset sm:hidden ${orderStatusBadgeClass(row.status)}`}
                    >
                      {formatOrderStatus(row.status)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 max-sm:[&_a]:w-full max-sm:[&_select]:w-full sm:flex-row sm:items-center sm:gap-3">
                  {sellerId ? (
                    <label className="flex min-w-0 flex-col gap-1 sm:min-w-[11rem]">
                      <span className="sr-only">Estado de la compra</span>
                      <select
                        value={row.status}
                        disabled={updatingId === row.id}
                        onChange={(e) =>
                          void handleStatusChange(row.id, e.target.value as OrderStatus)
                        }
                        className="min-h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 disabled:opacity-60"
                        aria-label={`Estado de ${row.product_title}`}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {formatOrderStatus(s)}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : null}

                  {row.saleConversationId ? (
                    <Link
                      href={saleChatHref(row.saleConversationId)}
                      className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#822020]/30 bg-white px-4 text-sm font-semibold text-[#822020] transition hover:bg-[#822020]/[0.06]"
                    >
                      Ir al chat de venta
                    </Link>
                  ) : (
                    <span className="inline-flex min-h-10 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 px-4 text-sm text-zinc-500">
                      Chat no disponible
                    </span>
                  )}
                </div>
              </div>
            </div>
            {currentUserId && sellerId ? (
              <div className="border-t border-zinc-100 pt-3">
                <OrderReviewBlock
                  order={row}
                  currentUserId={currentUserId}
                  counterpartyDisplayName={row.buyerDisplayName}
                />
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
