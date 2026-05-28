"use client";

import { ProductListGrid } from "@/app/components/product-list-grid";
import { HomeFeedPanel, HomeSectionHeader } from "@/app/components/home/home-section-header";
import type { Product } from "@/src/types/product";

type HomeProductRailProps = {
  id: string;
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHref?: string;
  /** Título más chico dentro del bloque "Por categoría". */
  nested?: boolean;
};

export function HomeProductRail({
  id,
  title,
  subtitle,
  products,
  viewAllHref,
  nested = false,
}: HomeProductRailProps) {
  if (products.length === 0) return null;

  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      className={`scroll-mt-24 ${nested ? "" : ""}`}
      aria-labelledby={headingId}
    >
      {nested ? (
        <div className="space-y-4">
          <HomeSectionHeader
            id={headingId}
            title={title}
            subtitle={subtitle}
            viewAllHref={viewAllHref}
            size="compact"
          />
          <ProductRailTrack products={products} />
        </div>
      ) : (
        <HomeFeedPanel>
          <HomeSectionHeader
            id={headingId}
            title={title}
            subtitle={subtitle}
            viewAllHref={viewAllHref}
          />
          <ProductRailTrack products={products} />
        </HomeFeedPanel>
      )}
    </section>
  );
}

function ProductRailTrack({ products }: { products: Product[] }) {
  return (
    <div className="colex-home-rail -mx-1 min-w-0 sm:-mx-0">
      <ProductListGrid
        products={products}
        listClassName="colex-home-rail-track"
        withFavoritesProvider={false}
      />
    </div>
  );
}
