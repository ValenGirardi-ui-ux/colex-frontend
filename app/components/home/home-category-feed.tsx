"use client";

import { HomeFeedPanel, HomeSectionHeader } from "@/app/components/home/home-section-header";
import { HomeProductRail } from "@/app/components/home/home-product-rail";
import type { HomeFeedSection } from "@/src/lib/home-feed";

type HomeCategoryFeedProps = {
  sections: HomeFeedSection[];
};

/** Agrupa rails por categoría bajo un solo bloque visual. */
export function HomeCategoryFeed({ sections }: HomeCategoryFeedProps) {
  if (sections.length === 0) return null;

  return (
    <section id="feed-categorias" className="scroll-mt-24" aria-labelledby="feed-categorias-heading">
      <HomeFeedPanel>
        <HomeSectionHeader
          id="feed-categorias-heading"
          title="Explorá por categoría"
          subtitle="Lo más reciente en cada rubro escolar"
          viewAllHref="/buscar"
          viewAllLabel="Ver catálogo"
        />
        <div className="space-y-8 border-t border-zinc-100 pt-6 sm:space-y-10 sm:pt-7">
          {sections.map((section) => (
            <HomeProductRail
              key={section.id}
              id={section.id}
              title={section.title}
              subtitle={section.subtitle}
              products={section.products}
              viewAllHref={section.viewAllHref}
              nested
            />
          ))}
        </div>
      </HomeFeedPanel>
    </section>
  );
}
