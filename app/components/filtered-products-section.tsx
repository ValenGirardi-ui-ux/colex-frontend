"use client";

import Link from "next/link";
import { Suspense } from "react";
import { activeFilterLabel } from "@/app/components/category-mega-menu";
import { ProductListGrid } from "@/app/components/product-list-grid";
import { useFilteredProducts } from "@/src/hooks/use-catalog-filters";
import { buildBrowseHref, type BrowseBasePath } from "@/src/lib/product-filters";
import type { Product } from "@/src/types/product";

type FilteredProductsSectionProps = {
  allProducts: Product[];
  base: BrowseBasePath;
  title?: string;
};

function FilteredProductsSectionInner({
  allProducts,
  base,
  title,
}: FilteredProductsSectionProps) {
  const { products: filteredProducts, hasActiveFilters, filters } =
    useFilteredProducts(allProducts);

  const filterLabel = activeFilterLabel(filters.main, filters.sub);
  const clearHref = buildBrowseHref(base, { main: "todo", sub: "todo", query: "" });

  return (
    <>
      {title ? (
        <h2 className="mb-4 text-2xl font-bold text-zinc-900 sm:mb-5 sm:text-3xl">{title}</h2>
      ) : null}

      {hasActiveFilters ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 sm:mb-5">
          <p className="text-sm text-zinc-600">
            {filters.query ? (
              <>
                <span className="font-medium text-zinc-800">{filteredProducts.length}</span> resultados
                {" "}
                para <span className="font-medium text-zinc-800">&quot;{filters.query}&quot;</span>
                {filterLabel ? <span className="text-zinc-500"> · {filterLabel}</span> : null}
              </>
            ) : (
              <>
                <span className="font-medium text-zinc-800">{filteredProducts.length}</span>{" "}
                {filteredProducts.length === 1 ? "artículo" : "artículos"}
                {filterLabel ? (
                  <>
                    {" "}
                    en <span className="font-medium text-zinc-800">{filterLabel}</span>
                  </>
                ) : null}
              </>
            )}
          </p>
          <Link href={clearHref} className="text-sm font-semibold text-[#822020] hover:underline">
            Limpiar filtros
          </Link>
        </div>
      ) : null}

      {filteredProducts.length === 0 ? (
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
        <ProductListGrid products={filteredProducts} />
      )}
    </>
  );
}

export function FilteredProductsSection(props: FilteredProductsSectionProps) {
  return (
    <Suspense
      fallback={
        <p className="rounded-2xl border border-zinc-200 bg-white px-4 py-10 text-center text-sm text-zinc-500">
          Cargando…
        </p>
      }
    >
      <FilteredProductsSectionInner {...props} />
    </Suspense>
  );
}
