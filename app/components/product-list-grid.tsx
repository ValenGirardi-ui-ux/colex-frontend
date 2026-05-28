"use client";

import { HomeProductCard } from "@/app/components/home/home-product-card";
import { FavoritesProvider } from "@/src/context/favorites-context";
import type { Product } from "@/src/types/product";

type ProductListGridProps = {
  products: Product[];
  listClassName?: string;
  itemClassName?: string;
  cardVariant?: "default" | "compact";
  /** false si un padre ya envolvió con FavoritesProvider (p. ej. feed home). */
  withFavoritesProvider?: boolean;
};

/**
 * Grilla de productos en árbol cliente para que favoritos (context) funcione
 * desde páginas servidor (p. ej. /buscar, /categoria).
 */
export function ProductListGrid({
  products,
  listClassName = "grid grid-cols-2 items-stretch gap-3 max-lg:gap-3 lg:grid-cols-3 lg:gap-4 xl:grid-cols-4",
  itemClassName = "h-full min-h-0",
  cardVariant = "default",
  withFavoritesProvider = true,
}: ProductListGridProps) {
  const list = (
    <ul className={listClassName}>
      {products.map((product) => (
        <li key={product.id} className={itemClassName}>
          <HomeProductCard product={product} variant={cardVariant} />
        </li>
      ))}
    </ul>
  );
  return withFavoritesProvider ? <FavoritesProvider>{list}</FavoritesProvider> : list;
}
