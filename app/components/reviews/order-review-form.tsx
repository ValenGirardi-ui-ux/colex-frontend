"use client";

import { useState } from "react";
import { StarRatingDisplay, StarRatingInput } from "@/app/components/reviews/star-rating";
import { createReview } from "@/src/services/reviews";
import type { Review } from "@/src/types/review";

const inputClass =
  "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#822020] focus:ring-2 focus:ring-[#822020]/15";

type OrderReviewFormProps = {
  orderId: string;
  reviewerId: string;
  reviewedUserId: string;
  reviewedDisplayName: string;
  existingReview?: Review | null;
  onSubmitted?: (review: Review) => void;
};

export function OrderReviewForm({
  orderId,
  reviewerId,
  reviewedUserId,
  reviewedDisplayName,
  existingReview,
  onSubmitted,
}: OrderReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<Review | null>(existingReview ?? null);

  if (saved) {
    return (
      <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/60 px-4 py-3">
        <p className="text-sm font-medium text-emerald-900">Tu calificación para {reviewedDisplayName}</p>
        <div className="mt-2">
          <StarRatingDisplay value={saved.rating} size="sm" showValue />
        </div>
        {saved.comment ? (
          <p className="mt-2 text-sm leading-relaxed text-zinc-700">&ldquo;{saved.comment}&rdquo;</p>
        ) : null}
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (rating < 1) {
      setError("Elegí de 1 a 5 estrellas.");
      return;
    }
    setBusy(true);
    setError(null);
    const { review, error: err } = await createReview({
      orderId,
      reviewerId,
      reviewedUserId,
      rating,
      comment,
    });
    setBusy(false);
    if (err || !review) {
      setError(err ?? "No se pudo guardar.");
      return;
    }
    setSaved(review);
    onSubmitted?.(review);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-[#822020]/15 bg-[#822020]/[0.04] px-4 py-3.5 sm:px-5 sm:py-4"
    >
      <p className="text-sm font-semibold text-zinc-900">Calificá a {reviewedDisplayName}</p>
      <p className="mt-0.5 text-xs text-zinc-600">Tu opinión ayuda a otros en Colex.</p>
      <div className="mt-3 space-y-3">
        <StarRatingInput value={rating} onChange={setRating} disabled={busy} />
        <div>
          <label htmlFor={`review-comment-${orderId}`} className="text-sm font-medium text-zinc-800">
            Comentario <span className="font-normal text-zinc-500">(opcional)</span>
          </label>
          <textarea
            id={`review-comment-${orderId}`}
            rows={2}
            maxLength={500}
            disabled={busy}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Contá cómo fue la experiencia…"
            className={`${inputClass} mt-1.5 resize-y`}
          />
        </div>
        {error ? (
          <p className="text-sm text-[#822020]" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-[#822020] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#6d1b1b] disabled:opacity-60"
        >
          {busy ? "Enviando…" : "Enviar calificación"}
        </button>
      </div>
    </form>
  );
}
