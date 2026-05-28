"use client";

import Link from "next/link";
import { FavoriteToggleButton } from "@/app/components/favorite-toggle-button";
import { ReviewRatingBadge } from "@/app/components/reviews/review-rating-badge";
import { VerifiedBadge } from "@/app/components/verified-badge";
import { ProductCardImage } from "@/app/components/product/product-card-image";
import { isFeaturedListing } from "@/src/lib/featured-listings";
import { formatArsPrice } from "@/src/lib/money";
import { formatProductCondition } from "@/src/lib/product-condition";
import type { Product } from "@/src/types/product";

type HomeProductCardProps = {
  product: Product;
  /** Versión más compacta para grillas densas (p. ej. perfil). */
  variant?: "default" | "compact";
};

export function HomeProductCard({ product, variant = "default" }: HomeProductCardProps) {
  const href = `/producto/${encodeURIComponent(product.id)}`;
  const compact = variant === "compact";
  const primaryImage = product.images?.[0];
  const featured = isFeaturedListing(product);
  const sellerReviews =
    product.seller_review_count && product.seller_review_count > 0 && product.seller_rating_avg
      ? { averageRating: product.seller_rating_avg, count: product.seller_review_count }
      : null;

  return (
    <article
      className={`group relative flex h-full w-full min-h-0 flex-col overflow-hidden border border-zinc-200/90 bg-white transition hover:border-[#822020]/20 ${
        compact ? "rounded-xl max-lg:rounded-lg" : "rounded-2xl max-lg:rounded-xl"
      }`}
    >
      <Link
        href={href}
        className="flex min-h-0 flex-1 flex-col focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#822020]"
        aria-label={`Ver publicación: ${product.title}`}
      >
        <ProductCardImage src={primaryImage} compact={compact} featured={featured} />

        <div className={`flex min-h-0 flex-1 flex-col ${compact ? "gap-1.5 p-2.5 max-lg:p-2 sm:p-3.5" : "gap-2 p-2.5 max-lg:p-2.5 sm:p-4"}`}>
          <h3
            className={`line-clamp-2 font-semibold leading-snug text-zinc-900 max-lg:min-h-[2.25rem] ${
              compact ? "text-xs max-lg:text-[13px] sm:text-[15px]" : "text-sm max-lg:text-[13px] sm:text-base"
            }`}
          >
            {product.title}
          </h3>
          {product.institution ? (
            <p className={`line-clamp-1 text-zinc-500 ${compact ? "text-xs sm:text-sm" : "text-xs sm:text-sm"}`}>
              {product.institution}
            </p>
          ) : (
            <p className={compact ? "text-xs text-zinc-400 sm:text-sm" : "text-xs text-zinc-400 sm:text-sm"}>
              Varias instituciones
            </p>
          )}
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`rounded-full font-medium ${
                compact ? "px-2 py-0.5 text-[11px] sm:text-xs" : "px-2 py-0.5 text-xs"
              } ${
                product.condition === "nuevo" ? "bg-[#822020]/10 text-[#822020]" : "bg-zinc-100 text-zinc-600"
              }`}
            >
              {formatProductCondition(product)}
            </span>
            {featured ? <VerifiedBadge verified size="sm" /> : null}
            {sellerReviews ? <ReviewRatingBadge summary={sellerReviews} size="sm" /> : null}
          </div>
          <div className={`mt-auto space-y-0.5 border-t border-zinc-100 ${compact ? "pt-2" : "pt-2"}`}>
            <div className="flex flex-wrap items-baseline gap-2">
              <span className={`font-bold text-zinc-900 ${compact ? "text-base sm:text-lg" : "text-lg sm:text-xl"}`}>
                {formatArsPrice(product.price)}
              </span>
            </div>
            <p className={compact ? "line-clamp-1 text-xs text-zinc-500 sm:text-sm" : "text-xs text-zinc-500 sm:text-sm"}>
              {product.location}
            </p>
          </div>
          <span
            className={`mt-1 w-full rounded-full border border-[#822020]/30 text-center font-medium text-[#822020] max-lg:hidden ${
              compact ? "py-2 text-sm sm:py-2.5" : "py-2 text-sm sm:py-2.5"
            }`}
          >
            Ver publicación
          </span>
        </div>
      </Link>

      <FavoriteToggleButton productId={product.id} variant="card" />
    </article>
  );
}
