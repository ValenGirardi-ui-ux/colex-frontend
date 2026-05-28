"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import {
  applyCatalogFilters,
  catalogHasActiveFilters,
  parseCatalogFilterParams,
  type CatalogFilterParams,
} from "@/src/lib/product-filters";
import type { Product } from "@/src/types/product";

export function useCatalogFiltersFromUrl(): CatalogFilterParams & {
  main: ReturnType<typeof parseCatalogFilterParams>["main"];
  sub: string;
  query: string;
} {
  const searchParams = useSearchParams();

  return useMemo(() => {
    const parsed = parseCatalogFilterParams({
      main: searchParams.get("cat"),
      sub: searchParams.get("sub"),
      query: searchParams.get("q"),
    });
    return {
      main: parsed.main,
      sub: parsed.sub,
      query: parsed.query,
    };
  }, [searchParams]);
}

export function useFilteredProducts(
  allProducts: Product[],
  override?: CatalogFilterParams,
): {
  products: Product[];
  hasActiveFilters: boolean;
  filters: ReturnType<typeof parseCatalogFilterParams>;
} {
  const fromUrl = useCatalogFiltersFromUrl();

  const filters = useMemo(() => {
    if (override) return parseCatalogFilterParams(override);
    return fromUrl;
  }, [override, fromUrl]);

  const products = useMemo(
    () => applyCatalogFilters(allProducts, filters),
    [allProducts, filters],
  );

  const hasActiveFilters = useMemo(() => catalogHasActiveFilters(filters), [filters]);

  return { products, hasActiveFilters, filters };
}
