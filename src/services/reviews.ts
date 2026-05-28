import { profileDisplayName } from "@/src/lib/chat-display";
import {
  computeReviewSummary,
  isOrderReviewable,
  orderReviewCounterparty,
} from "@/src/lib/reviews";
import { fetchProfilesByUserIds } from "@/src/services/profiles";
import { hasSupabaseEnv, supabase } from "@/src/lib/supabase/client";
import type { Order } from "@/src/types/order";
import type { Product } from "@/src/types/product";
import type { Review, ReviewListItem, ReviewSummary } from "@/src/types/review";

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function rowToReview(row: Record<string, unknown>): Review | null {
  const id = typeof row.id === "string" ? row.id : null;
  const order_id = typeof row.order_id === "string" ? row.order_id : null;
  const reviewer_id = typeof row.reviewer_id === "string" ? row.reviewer_id : null;
  const reviewed_user_id = typeof row.reviewed_user_id === "string" ? row.reviewed_user_id : null;
  if (!id || !order_id || !reviewer_id || !reviewed_user_id) return null;
  const rating = Number(row.rating);
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) return null;
  return {
    id,
    order_id,
    reviewer_id,
    reviewed_user_id,
    rating: Math.round(rating),
    comment: typeof row.comment === "string" && row.comment.trim() ? row.comment.trim() : null,
    created_at: typeof row.created_at === "string" ? row.created_at : new Date().toISOString(),
  };
}

const REVIEW_SELECT =
  "id,order_id,reviewer_id,reviewed_user_id,rating,comment,created_at" as const;

export function formatReviewErrorForUser(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("reviews_one_per_order_reviewer") || m.includes("duplicate key")) {
    return "Ya dejaste una calificación para esta compra.";
  }
  if (m.includes("reviews") && (m.includes("schema cache") || m.includes("does not exist"))) {
    return "Falta la tabla reviews en Supabase. Ejecutá supabase/migrations/20260516300000_reviews.sql.";
  }
  if (m.includes("row-level security") || m.includes("policy")) {
    return "No se pudo guardar la calificación. Verificá que la compra esté entregada.";
  }
  return message || "No se pudo guardar la calificación.";
}

export async function fetchReviewSummaryForUser(userId: string): Promise<ReviewSummary> {
  if (!hasSupabaseEnv || !isUuid(userId)) {
    return { averageRating: 0, count: 0 };
  }

  const { data, error } = await supabase.from("reviews").select("rating").eq("reviewed_user_id", userId);

  if (error || !data) {
    console.warn("[Colex reviews] summary", userId, error?.message);
    return { averageRating: 0, count: 0 };
  }

  const ratings = data
    .map((r) => Number((r as { rating?: unknown }).rating))
    .filter((n) => Number.isFinite(n) && n >= 1 && n <= 5);

  return computeReviewSummary(ratings);
}

export async function fetchReviewSummariesByUserIds(
  userIds: string[],
): Promise<Map<string, ReviewSummary>> {
  const map = new Map<string, ReviewSummary>();
  const unique = [...new Set(userIds.filter(isUuid))];
  if (!hasSupabaseEnv || unique.length === 0) return map;

  const { data, error } = await supabase
    .from("reviews")
    .select("reviewed_user_id,rating")
    .in("reviewed_user_id", unique);

  if (error || !data) return map;

  const buckets = new Map<string, number[]>();
  for (const raw of data) {
    const r = raw as { reviewed_user_id?: string; rating?: number };
    const uid = r.reviewed_user_id;
    const rating = Number(r.rating);
    if (!uid || !Number.isFinite(rating)) continue;
    const list = buckets.get(uid) ?? [];
    list.push(rating);
    buckets.set(uid, list);
  }

  for (const uid of unique) {
    map.set(uid, computeReviewSummary(buckets.get(uid) ?? []));
  }

  return map;
}

export async function fetchRecentReviewsForUser(
  userId: string,
  limit = 8,
): Promise<{ reviews: ReviewListItem[]; error: string | null }> {
  if (!hasSupabaseEnv || !isUuid(userId)) {
    return { reviews: [], error: null };
  }

  const { data, error } = await supabase
    .from("reviews")
    .select(REVIEW_SELECT)
    .eq("reviewed_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { reviews: [], error: formatReviewErrorForUser(error.message) };
  }

  const rows = (data ?? [])
    .map((r) => rowToReview(r as Record<string, unknown>))
    .filter((r): r is Review => r != null);

  const reviewerIds = [...new Set(rows.map((r) => r.reviewer_id))];
  const profiles = await fetchProfilesByUserIds(reviewerIds);

  const reviews: ReviewListItem[] = rows.map((r) => ({
    ...r,
    reviewerDisplayName: profileDisplayName(profiles.get(r.reviewer_id) ?? null, "Usuario"),
  }));

  return { reviews, error: null };
}

export async function fetchReviewsByReviewerForOrders(
  reviewerId: string,
  orderIds: string[],
): Promise<Map<string, Review>> {
  const map = new Map<string, Review>();
  const ids = orderIds.filter(isUuid);
  if (!hasSupabaseEnv || !isUuid(reviewerId) || ids.length === 0) return map;

  const { data, error } = await supabase
    .from("reviews")
    .select(REVIEW_SELECT)
    .eq("reviewer_id", reviewerId)
    .in("order_id", ids);

  if (error || !data) return map;

  for (const raw of data) {
    const review = rowToReview(raw as Record<string, unknown>);
    if (review) map.set(review.order_id, review);
  }

  return map;
}

export type CreateReviewInput = {
  orderId: string;
  reviewerId: string;
  reviewedUserId: string;
  rating: number;
  comment?: string;
};

export async function createReview(
  input: CreateReviewInput,
): Promise<{ review: Review | null; error: string | null }> {
  const { orderId, reviewerId, reviewedUserId, rating, comment } = input;

  if (!hasSupabaseEnv || !isUuid(orderId) || !isUuid(reviewerId) || !isUuid(reviewedUserId)) {
    return { review: null, error: "No se pudo guardar la calificación." };
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { review: null, error: "Elegí una calificación de 1 a 5 estrellas." };
  }

  const { data: orderRow, error: orderErr } = await supabase
    .from("orders")
    .select("id,buyer_id,seller_id,status")
    .eq("id", orderId)
    .maybeSingle();

  if (orderErr) {
    return { review: null, error: formatReviewErrorForUser(orderErr.message) };
  }

  if (!orderRow) {
    return { review: null, error: "No se encontró la compra." };
  }

  const order = orderRow as Pick<Order, "buyer_id" | "seller_id" | "status" | "id">;
  if (!isOrderReviewable(order.status)) {
    return { review: null, error: "Solo podés calificar cuando la compra está entregada." };
  }

  const expectedReviewed = orderReviewCounterparty(order, reviewerId);
  if (!expectedReviewed || expectedReviewed !== reviewedUserId) {
    return { review: null, error: "No podés calificar a este usuario en esta compra." };
  }

  const trimmedComment = comment?.trim() || null;

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      order_id: orderId,
      reviewer_id: reviewerId,
      reviewed_user_id: reviewedUserId,
      rating,
      comment: trimmedComment,
    })
    .select(REVIEW_SELECT)
    .single();

  if (error) {
    return { review: null, error: formatReviewErrorForUser(error.message) };
  }

  const review = rowToReview(data as Record<string, unknown>);
  if (!review) {
    return { review: null, error: "No se pudo leer la calificación guardada." };
  }

  return { review, error: null };
}

/** Añade promedio y cantidad de reviews del vendedor en cards de producto. */
export async function enrichProductsWithSellerReviews(products: Product[]): Promise<Product[]> {
  if (products.length === 0) return products;
  const summaries = await fetchReviewSummariesByUserIds(products.map((p) => p.user_id));
  return products.map((p) => {
    const summary = summaries.get(p.user_id);
    if (!summary || summary.count === 0) return p;
    return {
      ...p,
      seller_rating_avg: summary.averageRating,
      seller_review_count: summary.count,
    };
  });
}
