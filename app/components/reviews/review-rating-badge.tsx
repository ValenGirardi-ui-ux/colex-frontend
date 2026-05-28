import { formatReviewAverage, formatReviewBadgeLabel, formatReviewCount } from "@/src/lib/reviews";
import type { ReviewSummary } from "@/src/types/review";

type ReviewRatingBadgeProps = {
  summary: ReviewSummary;
  size?: "sm" | "md";
  className?: string;
};

export function ReviewRatingBadge({ summary, size = "md", className = "" }: ReviewRatingBadgeProps) {
  if (summary.count === 0) return null;

  const textClass = size === "sm" ? "text-xs" : "text-sm";
  const label = formatReviewBadgeLabel(summary);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-amber-200/90 bg-amber-50/90 px-2.5 py-0.5 font-medium text-amber-950 ${textClass} ${className}`}
      title={`Promedio ${formatReviewAverage(summary.averageRating)} · ${formatReviewCount(summary.count)}`}
    >
      {label}
    </span>
  );
}
