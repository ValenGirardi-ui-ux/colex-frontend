"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { subscribePostgresChanges } from "@/src/lib/supabase/realtime-subscribe";

/** Refresca el catálogo del home cuando hay publicaciones nuevas o editadas (SSR + datos iniciales). */
export function useCatalogProductsRealtime(enabled = true) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;

    let debounce: ReturnType<typeof setTimeout> | null = null;
    const scheduleRefresh = () => {
      if (debounce) clearTimeout(debounce);
      debounce = setTimeout(() => {
        router.refresh();
      }, 900);
    };

    const unsub = subscribePostgresChanges(
      "catalog-products",
      [
        { event: "INSERT", table: "products" },
        { event: "UPDATE", table: "products" },
        { event: "DELETE", table: "products" },
      ],
      scheduleRefresh,
    );

    return () => {
      unsub();
      if (debounce) clearTimeout(debounce);
    };
  }, [enabled, router]);
}
