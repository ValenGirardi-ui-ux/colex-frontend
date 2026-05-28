"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { activeFilterLabel } from "@/app/components/category-mega-menu";
import { ProductListGrid } from "@/app/components/product-list-grid";
import { useFilteredProducts } from "@/src/hooks/use-catalog-filters";
import { buildBrowseHref } from "@/src/lib/product-filters";
import type { Product } from "@/src/types/product";

type CatalogProductsSectionProps = {
  allProducts: Product[];
  /** Sin filtros en URL, cuántos destacados mostrar. */
  featuredLimit?: number;
  title?: string;
  showCatalogLink?: boolean;
  /** IDs ya mostrados en rails del feed (evita repetir en la grilla inferior). */
  excludeProductIds?: ReadonlySet<string>;
};

function CatalogProductsSectionInner({
  allProducts,
  featuredLimit = 8,
  title = "Productos destacados",
  showCatalogLink = true,
  excludeProductIds,
}: CatalogProductsSectionProps) {
  const { products, hasActiveFilters, filters } = useFilteredProducts(allProducts);
  const displayProducts = useMemo(() => {
    if (hasActiveFilters) return products;
    const pool = excludeProductIds?.size
      ? allProducts.filter((p) => !excludeProductIds.has(p.id))
      : allProducts;
    return pool.slice(0, featuredLimit);
  }, [hasActiveFilters, products, allProducts, featuredLimit, excludeProductIds]);
  const filterLabel = activeFilterLabel(filters.main, filters.sub);
  const clearHref = buildBrowseHref("home", {
    main: "todo",
    sub: "todo",
    query: filters.query,
  });

  return (
    <>
      <div className="mb-6 flex flex-col gap-1 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl">{title}</h2>
          {hasActiveFilters ? (
            <p className="mt-1 text-sm text-zinc-600">
              {filters.query ? (
                <>
                  <span className="font-medium text-zinc-800">{displayProducts.length}</span> resultados
                  {" "}
                  para &quot;{filters.query}&quot;
                  {filterLabel ? <span className="text-zinc-500"> · {filterLabel}</span> : null}
                </>
              ) : (
                <>
                  <span className="font-medium text-zinc-800">{displayProducts.length}</span>{" "}
                  {displayProducts.length === 1 ? "artículo" : "artículos"}
                  {filterLabel ? (
                    <>
                      {" "}
                      en <span className="font-medium text-zinc-800">{filterLabel}</span>
                    </>
                  ) : null}
                </>
              )}
            </p>
          ) : null}
        </div>
        {hasActiveFilters ? (
          <Link href={clearHref} className="text-sm font-semibold text-[#822020] hover:underline">
            Limpiar filtros
          </Link>
        ) : showCatalogLink ? (
          <Link href="/buscar" className="text-sm font-medium text-[#822020] hover:underline">
            Ver catálogo completo
          </Link>
        ) : null}
      </div>

      {displayProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center">
          <p className="text-base font-medium text-zinc-800">No hay productos con estos filtros</p>
          <p className="mt-2 text-sm text-zinc-600">Probá otra categoría o limpiá los filtros.</p>
          {hasActiveFilters ? (
            <Link
              href={clearHref}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[#822020] px-6 text-sm font-semibold text-white transition hover:bg-[#6d1b1b]"
            >
              Ver todo
            </Link>
          ) : null}
        </div>
      ) : (
        <ProductListGrid products={displayProducts} />
      )}
    </>
  );
}

export function CatalogProductsSection(props: CatalogProductsSectionProps) {
  return (
    <Suspense
      fallback={
        <p className="py-8 text-center text-sm text-zinc-500">Cargando productos…</p>
      }
    >
      <CatalogProductsSectionInner {...props} />
    </Suspense>
  );
}
