"use client";

import Link from "next/link";
import { formatArsPrice } from "@/src/lib/money";
import { formatProductCondition } from "@/src/lib/product-condition";
import type { Product } from "@/src/types/product";

type FavoriteProductCardProps = {
  product: Product;
  onRemoveFavorite: (id: string) => void;
};

export function FavoriteProductCard({ product, onRemoveFavorite }: FavoriteProductCardProps) {
  const href = `/producto/${encodeURIComponent(product.id)}`;

  return (
    <article className="group relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm transition hover:border-[#822020]/25 hover:shadow-md">
      <Link
        href={href}
        className="flex min-h-0 flex-1 flex-col focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#822020]"
        aria-label={`Ver publicación: ${product.title}`}
      >
        <div className="relative aspect-square w-full bg-zinc-100">
          {product.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200/90 text-zinc-400"
              aria-hidden
            >
              <svg
                viewBox="0 0 24 24"
                className="h-14 w-14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-3.086-3.086a2 2 0 00-2.828 0L6 21" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
          <h3 className="line-clamp-2 min-h-10 text-sm font-medium leading-snug text-zinc-900 sm:min-h-0 sm:text-base">
            {product.title}
          </h3>
          {product.institution ? (
            <p className="line-clamp-1 text-xs text-zinc-500 sm:text-sm">{product.institution}</p>
          ) : (
            <p className="text-xs text-zinc-400 sm:text-sm">Institución no indicada</p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                product.condition === "nuevo" ? "bg-[#822020]/10 text-[#822020]" : "bg-zinc-100 text-zinc-600"
              }`}
            >
              {formatProductCondition(product)}
            </span>
          </div>
          <div className="mt-auto flex flex-col gap-1 border-t border-zinc-100 pt-2">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-lg font-semibold text-zinc-900 sm:text-xl">{formatArsPrice(product.price)}</span>
            </div>
            <p className="text-xs text-zinc-500 sm:text-sm">{product.location}</p>
          </div>
          <span className="mt-1 w-full rounded-full border border-[#822020]/30 py-2.5 text-center text-sm font-medium text-[#822020] sm:py-2">
            Ver detalle
          </span>
        </div>
      </Link>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemoveFavorite(product.id);
        }}
        className="absolute right-2 top-2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#822020] shadow-md backdrop-blur-sm transition hover:bg-white hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#822020]"
        aria-label="Quitar de favoritos"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </button>
    </article>
  );
}
