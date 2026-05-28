import Link from "next/link";
import { ReviewRatingBadge } from "@/app/components/reviews/review-rating-badge";
import { VerifiedName } from "@/app/components/verified-badge";
import type { SellerPreview } from "@/src/services/profiles";

type ProductSellerCardProps = {
  seller: SellerPreview;
};

export function ProductSellerCard({ seller }: ProductSellerCardProps) {
  const subtitle = seller.username ? `@${seller.username}` : null;

  return (
    <section
      className="rounded-2xl border border-zinc-200/90 bg-white p-4 sm:p-5"
      aria-labelledby="product-seller-heading"
    >
      <h2 id="product-seller-heading" className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
        Publicado por
      </h2>
      <Link
        href={seller.href}
        className="mt-3 flex items-center gap-3 rounded-xl border border-transparent p-2 -m-2 transition hover:border-[#822020]/20 hover:bg-[#822020]/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#822020]"
      >
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#822020]/10 text-sm font-semibold text-[#822020]"
          aria-hidden
        >
          {seller.displayName
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((p) => p[0])
            .join("")
            .toUpperCase() || "?"}
        </span>
        <span className="min-w-0 flex-1">
          <VerifiedName
            verified={seller.isVerified}
            className="text-base font-semibold text-[#822020] underline-offset-2 group-hover:underline"
            nameClassName="text-base font-semibold text-[#822020]"
          >
            {seller.displayName}
          </VerifiedName>
          {subtitle ? <span className="block truncate text-sm text-zinc-500">{subtitle}</span> : null}
          {seller.reviewSummary ? (
            <ReviewRatingBadge summary={seller.reviewSummary} size="sm" className="mt-1.5" />
          ) : null}
          <span className="mt-0.5 block text-sm font-medium text-zinc-600">Ver perfil del vendedor</span>
        </span>
        <span className="shrink-0 text-zinc-400" aria-hidden>
          →
        </span>
      </Link>
    </section>
  );
}
