import type { Order } from "@/src/types/order";
import type { ReviewSummary } from "@/src/types/review";

export const REVIEWABLE_ORDER_STATUS = "entregado" as const;

export function isOrderReviewable(status: string): boolean {
  return status === REVIEWABLE_ORDER_STATUS;
}

export function orderReviewCounterparty(
  order: Pick<Order, "buyer_id" | "seller_id">,
  reviewerId: string,
): string | null {
  if (order.buyer_id === reviewerId && order.seller_id) return order.seller_id;
  if (order.seller_id === reviewerId) return order.buyer_id;
  return null;
}

export function computeReviewSummary(ratings: number[]): ReviewSummary {
  if (ratings.length === 0) {
    return { averageRating: 0, count: 0 };
  }
  const sum = ratings.reduce((a, b) => a + b, 0);
  const averageRating = Math.round((sum / ratings.length) * 10) / 10;
  return { averageRating, count: ratings.length };
}

export function formatReviewAverage(avg: number): string {
  if (avg <= 0) return "0";
  return avg % 1 === 0 ? String(avg) : avg.toFixed(1);
}

export function formatReviewCount(count: number): string {
  return count === 1 ? "1 review" : `${count} reviews`;
}

export function formatReviewBadgeLabel(summary: ReviewSummary): string {
  if (summary.count === 0) return "";
  return `${formatReviewAverage(summary.averageRating)} ⭐ (${formatReviewCount(summary.count)})`;
}
