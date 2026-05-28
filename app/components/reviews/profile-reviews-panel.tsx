"use client";

import { useEffect, useState } from "react";
import { ReviewRatingBadge } from "@/app/components/reviews/review-rating-badge";
import { StarRatingDisplay } from "@/app/components/reviews/star-rating";
import { formatReviewAverage, formatReviewCount } from "@/src/lib/reviews";
import { fetchRecentReviewsForUser, fetchReviewSummaryForUser } from "@/src/services/reviews";
import type { ReviewListItem, ReviewSummary } from "@/src/types/review";

function formatReviewDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

type ProfileReviewsPanelProps = {
  userId: string;
  initialSummary?: ReviewSummary | null;
};

export function ProfileReviewsPanel({ userId, initialSummary }: ProfileReviewsPanelProps) {
  const [summary, setSummary] = useState<ReviewSummary>(
    initialSummary ?? { averageRating: 0, count: 0 },
  );
  const [reviews, setReviews] = useState<ReviewListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [sum, listResult] = await Promise.all([
        initialSummary ? Promise.resolve(initialSummary) : fetchReviewSummaryForUser(userId),
        fetchRecentReviewsForUser(userId, 8),
      ]);
      if (cancelled) return;
      setSummary(sum);
      setReviews(listResult.reviews);
      setError(listResult.error);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, initialSummary]);

  if (loading) {
    return <p className="text-sm text-zinc-500">Cargando reseñas…</p>;
  }

  if (summary.count === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 px-5 py-6 text-center">
        <p className="text-sm font-medium text-zinc-800">Sin reseñas todavía</p>
        <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
          Las calificaciones aparecen cuando otros usuarios completan una compra contigo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-100 bg-white px-4 py-3 sm:px-5 sm:py-4">
        <StarRatingDisplay value={summary.averageRating} showValue size="md" />
        <div className="min-w-0">
          <p className="text-base font-semibold text-zinc-900">
            {formatReviewAverage(summary.averageRating)} de 5
          </p>
          <p className="text-sm text-zinc-600">{formatReviewCount(summary.count)}</p>
        </div>
        <ReviewRatingBadge summary={summary} size="sm" className="ml-auto" />
      </div>

      {error ? (
        <p className="text-sm text-[#822020]" role="alert">
          {error}
        </p>
      ) : null}

      {reviews.length > 0 ? (
        <ul className="space-y-3">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="rounded-xl border border-zinc-100 bg-zinc-50/40 px-4 py-3 sm:px-5 sm:py-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="text-sm font-semibold text-zinc-900">{review.reviewerDisplayName}</p>
                <time className="text-xs text-zinc-500" dateTime={review.created_at}>
                  {formatReviewDate(review.created_at)}
                </time>
              </div>
              <div className="mt-1.5">
                <StarRatingDisplay value={review.rating} size="sm" />
              </div>
              {review.comment ? (
                <p className="mt-2 text-sm leading-relaxed text-zinc-700">&ldquo;{review.comment}&rdquo;</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
