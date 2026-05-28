"use client";

import { useEffect, useState } from "react";
import { OrderReviewForm } from "@/app/components/reviews/order-review-form";
import { isOrderReviewable, orderReviewCounterparty } from "@/src/lib/reviews";
import { fetchReviewsByReviewerForOrders } from "@/src/services/reviews";
import type { Order, SellerOrderRow } from "@/src/types/order";
import type { Review } from "@/src/types/review";

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

type OrderReviewBlockProps = {
  order: Order | SellerOrderRow;
  currentUserId: string;
  counterpartyDisplayName: string;
};

export function OrderReviewBlock({ order, currentUserId, counterpartyDisplayName }: OrderReviewBlockProps) {
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);

  const reviewedUserId = orderReviewCounterparty(order, currentUserId);

  useEffect(() => {
    if (!isUuid(order.id) || !isUuid(currentUserId) || !reviewedUserId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    void fetchReviewsByReviewerForOrders(currentUserId, [order.id]).then((map) => {
      if (!cancelled) {
        setExistingReview(map.get(order.id) ?? null);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [order.id, currentUserId, reviewedUserId]);

  if (!isOrderReviewable(order.status) || !reviewedUserId || !isUuid(order.id)) {
    return null;
  }

  if (loading) {
    return <p className="text-xs text-zinc-500">Cargando calificación…</p>;
  }

  return (
    <OrderReviewForm
      orderId={order.id}
      reviewerId={currentUserId}
      reviewedUserId={reviewedUserId}
      reviewedDisplayName={counterpartyDisplayName}
      existingReview={existingReview}
      onSubmitted={setExistingReview}
    />
  );
}
