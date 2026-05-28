"use client";

import { useMemo } from "react";
import { CatalogProductsSection } from "@/app/components/catalog-products-section";
import { HomeCategoryFeed } from "@/app/components/home/home-category-feed";
import { HomeProductRail } from "@/app/components/home/home-product-rail";
import { HomeFeedPanel } from "@/app/components/home/home-section-header";
import { useFavorites } from "@/src/context/favorites-context";
import { FavoritesProvider } from "@/src/context/favorites-context";
import { useFilteredProducts } from "@/src/hooks/use-catalog-filters";
import { buildHomeFeedSections } from "@/src/lib/home-feed";
import type { Product } from "@/src/types/product";

const MIN_BOTTOM_GRID = 2;

type HomeFeedProps = {
  allProducts: Product[];
};

function HomeFeedInner({ allProducts }: HomeFeedProps) {
  const { hasActiveFilters, filters } = useFilteredProducts(allProducts);
  const { favoriteIds, ready: favReady } = useFavorites();

  const { sections, usedProductIds } = useMemo(() => {
    if (hasActiveFilters) {
      return { sections: [], usedProductIds: new Set<string>() };
    }
    return buildHomeFeedSections(allProducts, {
      favoriteIds: favReady ? favoriteIds : new Set(),
    });
  }, [allProducts, hasActiveFilters, favoriteIds, favReady]);

  const { primarySections, categorySections } = useMemo(() => {
    const primary: typeof sections = [];
    const categories: typeof sections = [];
    for (const s of sections) {
      if (s.id.startsWith("categoria-")) categories.push(s);
      else primary.push(s);
    }
    return { primarySections: primary, categorySections: categories };
  }, [sections]);

  const moreProducts = useMemo(() => {
    if (hasActiveFilters) return [];
    const pool = usedProductIds.size
      ? allProducts.filter((p) => !usedProductIds.has(p.id))
      : allProducts;
    return pool.slice(0, 12);
  }, [allProducts, usedProductIds, hasActiveFilters]);

  if (hasActiveFilters) {
    const title = filters.query.trim() ? "Resultados de búsqueda" : "Productos filtrados";
    return (
      <div className="bg-[#F6F6F6] py-8 sm:py-10">
        <div className="mx-auto w-full min-w-0 max-w-[1240px] px-3 sm:px-4 lg:px-6">
          <HomeFeedPanel>
            <CatalogProductsSection allProducts={allProducts} title={title} featuredLimit={24} />
          </HomeFeedPanel>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F6F6F6] pb-10 sm:pb-14">
      <div className="mx-auto w-full min-w-0 max-w-[1240px] space-y-6 px-3 py-8 sm:space-y-8 sm:px-4 sm:py-10 lg:px-6">
        {primarySections.map((section) => (
          <HomeProductRail
            key={section.id}
            id={section.id}
            title={section.title}
            subtitle={section.subtitle}
            products={section.products}
            viewAllHref={section.viewAllHref}
          />
        ))}

        <HomeCategoryFeed sections={categorySections} />

        {moreProducts.length >= MIN_BOTTOM_GRID ? (
          <section id="productos-destacados" className="scroll-mt-24">
            <HomeFeedPanel>
              <CatalogProductsSection
                allProducts={allProducts}
                title="Más del marketplace"
                featuredLimit={12}
                excludeProductIds={usedProductIds}
              />
            </HomeFeedPanel>
          </section>
        ) : null}
      </div>
    </div>
  );
}

export function HomeFeed(props: HomeFeedProps) {
  return (
    <FavoritesProvider>
      <HomeFeedInner {...props} />
    </FavoritesProvider>
  );
}
