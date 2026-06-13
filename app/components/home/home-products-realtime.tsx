"use client";

import { useCatalogProductsRealtime } from "@/src/hooks/use-catalog-products-realtime";

/** Sin UI: mantiene el feed del home actualizado vía Realtime. */
export function HomeProductsRealtime() {
  useCatalogProductsRealtime(true);
  return null;
}
