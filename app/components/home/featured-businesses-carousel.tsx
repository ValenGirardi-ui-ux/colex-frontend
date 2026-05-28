import Link from "next/link";
import { HomeFeedPanel, HomeSectionHeader } from "@/app/components/home/home-section-header";
import { VerifiedBadge } from "@/app/components/verified-badge";
import type { FeaturedBusiness } from "@/src/types/featured-business";

function buildMarqueeSequence(businesses: FeaturedBusiness[]): FeaturedBusiness[] {
  if (businesses.length === 0) return [];
  const minTiles = 8;
  const expanded: FeaturedBusiness[] = [];
  while (expanded.length < minTiles) {
    expanded.push(...businesses);
  }
  return [...expanded, ...expanded];
}

function BusinessAvatar({ business }: { business: FeaturedBusiness }) {
  if (business.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={business.avatarUrl}
        alt=""
        className="h-14 w-14 shrink-0 rounded-2xl border border-zinc-200/90 bg-zinc-100 object-cover sm:h-[4.25rem] sm:w-[4.25rem]"
      />
    );
  }

  return (
    <div
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#822020]/15 bg-[#822020]/10 text-base font-semibold text-[#822020] sm:h-[4.25rem] sm:w-[4.25rem] sm:text-lg"
      aria-hidden
    >
      {business.initials}
    </div>
  );
}

function BusinessCard({ business }: { business: FeaturedBusiness }) {
  return (
    <Link
      href={business.href}
      className="group flex w-[14.5rem] shrink-0 items-center gap-3.5 rounded-2xl border border-zinc-200/90 bg-zinc-50/50 px-4 py-3.5 transition hover:border-[#822020]/25 hover:bg-white sm:w-[15.5rem]"
    >
      <BusinessAvatar business={business} />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5">
          <span className="truncate text-sm font-semibold text-zinc-900 group-hover:text-[#822020] sm:text-[15px]">
            {business.displayName}
          </span>
          <VerifiedBadge verified={business.isVerified} size="sm" />
        </p>
        {business.subtitle ? (
          <p className="mt-1 line-clamp-2 text-xs leading-snug text-zinc-500">{business.subtitle}</p>
        ) : (
          <p className="mt-1 text-xs text-zinc-400">Ver tienda</p>
        )}
      </div>
    </Link>
  );
}

type FeaturedBusinessesCarouselProps = {
  businesses: FeaturedBusiness[];
};

export function FeaturedBusinessesCarousel({ businesses }: FeaturedBusinessesCarouselProps) {
  if (businesses.length === 0) return null;

  const marqueeItems = buildMarqueeSequence(businesses);

  return (
    <section
      className="bg-[#F6F6F6] pt-2 sm:pt-4"
      aria-labelledby="negocios-destacados-heading"
    >
      <div className="mx-auto w-full min-w-0 max-w-[1240px] px-3 sm:px-4 lg:px-6">
        <HomeFeedPanel>
          <HomeSectionHeader
            id="negocios-destacados-heading"
            title="Negocios destacados"
            subtitle="Librerías y negocios Premium en Colex"
          />
          <div className="colex-featured-marquee -mx-1 min-w-0 py-0.5 sm:mx-0">
            <div className="colex-featured-marquee-track" role="list">
              {marqueeItems.map((business, index) => (
                <div key={`${business.id}-${index}`} role="listitem">
                  <BusinessCard business={business} />
                </div>
              ))}
            </div>
          </div>
        </HomeFeedPanel>
      </div>
    </section>
  );
}
