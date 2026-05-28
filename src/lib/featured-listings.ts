import type { Product } from "@/src/types/product";

/** Publicación destacada: vendedor con is_premium o is_featured (ver `seller_verified` en el producto). */
export function isFeaturedListing(product: Product): boolean {
  return product.seller_verified === true;
}

/** Home / catálogo sin búsqueda: vendedores premium primero, sin alterar filtros por categoría con `q`. */
export function sortProductsFeaturedFirst(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    const aFeatured = isFeaturedListing(a) ? 1 : 0;
    const bFeatured = isFeaturedListing(b) ? 1 : 0;
    if (bFeatured !== aFeatured) return bFeatured - aFeatured;
    return b.created_at.localeCompare(a.created_at);
  });
}
