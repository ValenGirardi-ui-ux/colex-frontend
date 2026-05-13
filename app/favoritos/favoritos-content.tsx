"use client";

import { useState } from "react";
import Link from "next/link";
import { FavoriteProductCard } from "../components/favorite-product-card";
import { mockFavoriteProducts } from "@/src/data/mockProducts";
import type { Product } from "@/src/types/product";

function EmptyFavorites() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/80 px-6 py-16 text-center sm:py-20">
      <div
        className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#822020]/10 text-[#822020]"
        aria-hidden
      >
        <svg viewBox="0 0 24 24" className="h-10 w-10" fill="currentColor" aria-hidden>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-zinc-900 sm:text-2xl">Todavía no guardaste productos</h2>
      <p className="mt-2 max-w-md text-sm text-zinc-600 sm:text-base">
        Cuando encuentres algo que te interese, guardalo para volver a verlo después.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center justify-center rounded-full bg-[#822020] px-8 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#6d1b1b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#822020] sm:text-base"
      >
        Explorar productos
      </Link>
    </div>
  );
}

export function FavoritosContent() {
  const [favorites, setFavorites] = useState<Product[]>(mockFavoriteProducts);

  const remove = (id: string) => {
    setFavorites((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#822020] sm:text-3xl">Favoritos</h1>
        <p className="mt-1 text-sm text-zinc-600 sm:text-base">
          Tus productos guardados para verlos más tarde.
        </p>
      </div>

      {favorites.length === 0 ? (
        <EmptyFavorites />
      ) : (
        <>
          <p className="text-sm text-zinc-500">
            {favorites.length} {favorites.length === 1 ? "producto" : "productos"} en tu lista
          </p>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favorites.map((product) => (
              <li key={product.id} className="min-w-0">
                <FavoriteProductCard product={product} onRemoveFavorite={remove} />
              </li>
            ))}
          </ul>
          <div className="flex justify-center pt-2 sm:pt-4">
            <Link
              href="/"
              className="text-sm font-medium text-[#822020] underline decoration-[#822020]/30 decoration-2 underline-offset-4 transition hover:decoration-[#822020] sm:text-base"
            >
              Explorar más productos
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
