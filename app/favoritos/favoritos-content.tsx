"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { HomeProductCard } from "@/app/components/home/home-product-card";
import { useFavorites } from "@/src/context/favorites-context";
import { fetchFavoriteProducts } from "@/src/services/favorites";
import type { Product } from "@/src/types/product";

const FAVORITES_GRID =
  "grid grid-cols-2 items-stretch gap-2.5 max-lg:gap-2.5 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4";

function FavoritesSkeleton() {
  return (
    <ul className={FAVORITES_GRID} aria-hidden>
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i} className="min-h-0 min-w-0">
          <div className="flex h-full min-h-[220px] animate-pulse flex-col overflow-hidden rounded-xl border border-zinc-200/80 bg-white sm:rounded-2xl sm:min-h-[240px]">
            <div className="aspect-square w-full bg-zinc-200/80" />
            <div className="space-y-2 p-2.5 sm:p-3">
              <div className="h-3.5 w-full rounded bg-zinc-200/80" />
              <div className="h-3 w-2/3 rounded bg-zinc-100" />
              <div className="mt-auto h-4 w-1/2 rounded bg-zinc-200/80" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyFavorites() {
  return (
    <div className="colex-card flex flex-col items-center justify-center px-5 py-14 text-center sm:py-20">
      <div
        className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#822020]/10 text-[#822020] sm:h-20 sm:w-20"
        aria-hidden
      >
        <svg viewBox="0 0 24 24" className="h-8 w-8 sm:h-10 sm:w-10" fill="currentColor" aria-hidden>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-zinc-900 sm:text-2xl">Todavía no guardaste productos</h2>
      <p className="mt-2 max-w-sm text-sm text-zinc-600 sm:text-base">
        Tocá el corazón en cualquier publicación para agregarla acá y retomarla cuando quieras.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-11 w-full max-w-xs items-center justify-center rounded-full bg-[#822020] px-6 text-sm font-semibold text-white transition hover:bg-[#6d1b1b] sm:mt-8 sm:h-12 sm:text-base"
      >
        Explorar productos
      </Link>
    </div>
  );
}

function FavoritesHeader({ count }: { count?: number }) {
  return (
    <header className="colex-card px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-[#822020] sm:text-3xl">Favoritos</h1>
          <p className="mt-1 text-sm text-zinc-600 sm:text-base">
            {count != null && count > 0
              ? `${count} ${count === 1 ? "producto guardado" : "productos guardados"}`
              : "Tus publicaciones guardadas para verlas más tarde."}
          </p>
        </div>
        {count != null && count > 0 ? (
          <Link
            href="/buscar"
            className="shrink-0 text-sm font-semibold text-[#822020] hover:underline"
          >
            Buscar más
          </Link>
        ) : null}
      </div>
    </header>
  );
}

export function FavoritosContent() {
  const { userId, ready, favoriteIds } = useFavorites();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const favoriteIdsKey = useMemo(() => [...favoriteIds].sort().join(","), [favoriteIds]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!ready) return;
      if (!userId) {
        setFavorites([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { products, error } = await fetchFavoriteProducts(userId);
      if (cancelled) return;
      if (error) console.error("[Colex favoritos] cargar", error);
      setFavorites(products);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [ready, userId, favoriteIdsKey]);

  if (!ready || loading) {
    return (
      <div className="space-y-4 sm:space-y-5">
        <FavoritesHeader />
        <FavoritesSkeleton />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="space-y-4 sm:space-y-5">
        <FavoritesHeader />
        <div className="colex-card px-5 py-10 text-center sm:px-8 sm:py-12">
          <p className="text-sm text-zinc-600 sm:text-base">
            Iniciá sesión para guardar productos y verlos en cualquier dispositivo.
          </p>
          <Link
            href="/login?next=%2Ffavoritos"
            className="mt-5 inline-flex h-11 w-full max-w-xs items-center justify-center rounded-full bg-[#822020] px-6 text-sm font-semibold text-white transition hover:bg-[#6d1b1b] sm:h-12"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <FavoritesHeader count={favorites.length} />

      {favorites.length === 0 ? (
        <EmptyFavorites />
      ) : (
        <>
          <ul className={FAVORITES_GRID}>
            {favorites.map((product) => (
              <li key={product.id} className="h-full min-h-0 min-w-0">
                <HomeProductCard product={product} variant="compact" />
              </li>
            ))}
          </ul>
          <p className="text-center text-xs text-zinc-500 sm:text-sm">
            Tocá el corazón en una card para quitarla de favoritos.
          </p>
        </>
      )}
    </div>
  );
}
