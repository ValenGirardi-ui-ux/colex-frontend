import Link from "next/link";
import { ProductListGrid } from "@/app/components/product-list-grid";
import { FollowStoreButton } from "@/app/components/shop/follow-store-button";
import { ProfileReviewsPanel } from "@/app/components/reviews/profile-reviews-panel";
import { ReviewRatingBadge } from "@/app/components/reviews/review-rating-badge";
import { StarRatingDisplay } from "@/app/components/reviews/star-rating";
import { VerifiedName } from "@/app/components/verified-badge";
import { initialsFromName } from "@/src/data/mockProfiles";
import { hasAnySocialLink } from "@/src/lib/premium-shop";
import { sellerProfilePath } from "@/src/services/profiles";
import type { Product } from "@/src/types/product";
import type { ReviewSummary } from "@/src/types/review";
import type { PremiumShop } from "@/src/types/shop";
import type { ReactNode } from "react";

type PremiumShopPageProps = {
  shop: PremiumShop;
  products: Product[];
  featuredProducts: Product[];
  reviewSummary: ReviewSummary | null;
};

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:border-[#822020]/25 hover:text-[#822020]"
      aria-label={label}
    >
      {children}
    </a>
  );
}

function normalizeExternalUrl(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  return `https://${t}`;
}

function whatsappHref(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return `https://wa.me/${digits}`;
}

export function PremiumShopPage({ shop, products, featuredProducts, reviewSummary }: PremiumShopPageProps) {
  const initials = initialsFromName(shop.businessName);
  const profileHref = sellerProfilePath(shop.userId);
  const showSocials = hasAnySocialLink(shop.socialLinks);
  const summary = reviewSummary && reviewSummary.count > 0 ? reviewSummary : null;

  return (
    <div className="min-h-screen bg-[#F6F6F6] text-zinc-900">
      {/* Cover */}
      <div className="relative h-36 bg-gradient-to-br from-[#822020]/20 via-[#822020]/8 to-zinc-100 sm:h-44 md:h-52 lg:h-56">
        {shop.bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shop.bannerUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
      </div>

      <div className="mx-auto w-full max-w-[1240px] px-3 sm:px-4 lg:px-6">
        <div className="-mt-14 relative z-10 sm:-mt-16 md:-mt-20">
          <article className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm sm:rounded-3xl">
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:gap-6">
                {shop.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={shop.avatarUrl}
                    alt=""
                    className="h-20 w-20 shrink-0 rounded-2xl border-4 border-white bg-zinc-100 object-cover shadow-md sm:h-24 sm:w-24 lg:h-28 lg:w-28"
                  />
                ) : (
                  <div
                    className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-[#822020]/10 text-2xl font-semibold text-[#822020] shadow-md sm:h-24 sm:w-24 lg:h-28 lg:w-28"
                    aria-hidden
                  >
                    {initials}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#822020]">Tienda Premium</p>
                  <h1 className="mt-1">
                    <VerifiedName
                      verified={shop.isVerified}
                      nameClassName="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl lg:text-4xl"
                      badgeSize="md"
                    >
                      {shop.businessName}
                    </VerifiedName>
                  </h1>
                  {shop.shortDescription ? (
                    <p className="mt-2 text-sm text-zinc-600 sm:text-base">{shop.shortDescription}</p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {summary ? (
                      <>
                        <StarRatingDisplay value={summary.averageRating} size="sm" showValue />
                        <ReviewRatingBadge summary={summary} size="sm" />
                      </>
                    ) : null}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-3 sm:items-end">
                  <FollowStoreButton
                    storeUserId={shop.userId}
                    storeDisplayName={shop.businessName}
                    layout="stack"
                    className="w-full sm:w-auto sm:min-w-[12rem]"
                  />
                  <Link
                    href={profileHref}
                    className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-zinc-200 px-5 text-sm font-semibold text-zinc-800 transition hover:border-[#822020]/30 hover:text-[#822020] sm:h-12 sm:w-auto"
                  >
                    Ver perfil
                  </Link>
                </div>
              </div>

              {(shop.description || shop.location || shop.institution) && (
                <div className="mt-6 space-y-2 border-t border-zinc-100 pt-5 text-sm leading-relaxed text-zinc-700 sm:text-base">
                  {shop.description ? <p>{shop.description}</p> : null}
                  {shop.location ? (
                    <p>
                      <span className="font-semibold text-zinc-500">Ubicación · </span>
                      {shop.location}
                    </p>
                  ) : null}
                  {shop.institution ? (
                    <p>
                      <span className="font-semibold text-zinc-500">Rubro · </span>
                      {shop.institution}
                    </p>
                  ) : null}
                </div>
              )}

              {showSocials ? (
                <div className="mt-5 flex flex-wrap gap-2 border-t border-zinc-100 pt-5">
                  {shop.socialLinks.website ? (
                    <SocialLink href={normalizeExternalUrl(shop.socialLinks.website)} label="Sitio web">
                      Sitio web
                    </SocialLink>
                  ) : null}
                  {shop.socialLinks.instagram ? (
                    <SocialLink
                      href={normalizeExternalUrl(shop.socialLinks.instagram)}
                      label="Instagram"
                    >
                      Instagram
                    </SocialLink>
                  ) : null}
                  {shop.socialLinks.facebook ? (
                    <SocialLink href={normalizeExternalUrl(shop.socialLinks.facebook)} label="Facebook">
                      Facebook
                    </SocialLink>
                  ) : null}
                  {shop.socialLinks.tiktok ? (
                    <SocialLink href={normalizeExternalUrl(shop.socialLinks.tiktok)} label="TikTok">
                      TikTok
                    </SocialLink>
                  ) : null}
                  {shop.socialLinks.whatsapp ? (
                    <SocialLink href={whatsappHref(shop.socialLinks.whatsapp)} label="WhatsApp">
                      WhatsApp
                    </SocialLink>
                  ) : null}
                </div>
              ) : null}
            </div>
          </article>
        </div>

        {featuredProducts.length > 0 ? (
          <section className="mt-8 sm:mt-10" aria-labelledby="shop-featured-heading">
            <h2 id="shop-featured-heading" className="text-lg font-bold text-zinc-900 sm:text-xl">
              Destacados
            </h2>
            <p className="mt-1 text-sm text-zinc-600">Publicaciones premium de esta tienda</p>
            <div className="mt-4">
              <ProductListGrid products={featuredProducts} cardVariant="compact" />
            </div>
          </section>
        ) : null}

        <section className="mt-8 sm:mt-10" aria-labelledby="shop-products-heading">
          <h2 id="shop-products-heading" className="text-lg font-bold text-zinc-900 sm:text-xl">
            Productos
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            {products.length === 0
              ? "Todavía no hay publicaciones activas."
              : `${products.length} publicación${products.length === 1 ? "" : "es"} activa${products.length === 1 ? "" : "s"}`}
          </p>
          <div className="mt-4">
            {products.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-200 bg-white px-5 py-10 text-center">
                <p className="text-sm text-zinc-600">Volvé pronto para ver novedades.</p>
              </div>
            ) : (
              <ProductListGrid products={products} cardVariant="default" />
            )}
          </div>
        </section>

        {summary ? (
          <section className="mt-8 rounded-2xl border border-zinc-200/90 bg-white p-5 sm:mt-10 sm:p-6 lg:p-8">
            <h2 className="text-lg font-bold text-zinc-900 sm:text-xl">Reseñas</h2>
            <div className="mt-4">
              <ProfileReviewsPanel userId={shop.userId} initialSummary={summary} />
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
