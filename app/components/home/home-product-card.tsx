"use client";

import Link from "next/link";
import { useState } from "react";
import { formatArsPrice } from "@/src/lib/money";
import { formatProductCondition } from "@/src/lib/product-condition";
import type { Product } from "@/src/types/product";

type HomeProductCardProps = {
  product: Product;
  /** Versión más compacta para grillas densas (p. ej. perfil). */
  variant?: "default" | "compact";
};

export function HomeProductCard({ product, variant = "default" }: HomeProductCardProps) {
  const [fav, setFav] = useState(false);
  const href = `/producto/${encodeURIComponent(product.id)}`;
  const compact = variant === "compact";

  return (
    <article
      className={`group relative flex h-full min-h-0 flex-col overflow-hidden border border-zinc-200/90 bg-white shadow-sm transition hover:border-[#822020]/20 hover:shadow-md ${
        compact
          ? "w-full rounded-xl"
          : "rounded-2xl"
      }`}
    >
      <Link
        href={href}
        className="flex min-h-0 flex-1 flex-col focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#822020]"
        aria-label={`Ver publicación: ${product.title}`}
      >
        <div
          className={`relative w-full bg-zinc-100 ${
            compact
              ? "aspect-[5/4] max-h-[10.5rem] sm:max-h-[11.5rem] lg:max-h-[12.5rem]"
              : "aspect-[4/3] sm:aspect-square"
          }`}
        >
          {product.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#822020]/[0.06] to-zinc-100 text-[#822020]/35"
              aria-hidden
            >
              <svg viewBox="0 0 24 24" className={compact ? "h-11 w-11 sm:h-12 sm:w-12" : "h-14 w-14"} fill="none" stroke="currentColor" strokeWidth="1.3">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-3.086-3.086a2 2 0 00-2.828 0L6 21" />
              </svg>
            </div>
          )}
        </div>

        <div className={`flex flex-1 flex-col ${compact ? "gap-1.5 p-3 sm:p-3.5" : "gap-2 p-3 sm:p-4"}`}>
          <h3
            className={`line-clamp-2 font-semibold leading-snug text-zinc-900 ${compact ? "text-sm sm:text-[15px]" : "text-sm sm:text-base"}`}
          >
            {product.title}
          </h3>
          {product.institution ? (
            <p className={`line-clamp-1 text-zinc-500 ${compact ? "text-xs sm:text-sm" : "text-xs sm:text-sm"}`}>
              {product.institution}
            </p>
          ) : (
            <p className={compact ? "text-xs text-zinc-400 sm:text-sm" : "text-xs text-zinc-400 sm:text-sm"}>
              Varias instituciones
            </p>
          )}
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`rounded-full font-medium ${
                compact ? "px-2 py-0.5 text-[11px] sm:text-xs" : "px-2 py-0.5 text-xs"
              } ${
                product.condition === "nuevo" ? "bg-[#822020]/10 text-[#822020]" : "bg-zinc-100 text-zinc-600"
              }`}
            >
              {formatProductCondition(product)}
            </span>
          </div>
          <div className={`mt-auto space-y-0.5 border-t border-zinc-100 ${compact ? "pt-2" : "pt-2"}`}>
            <div className="flex flex-wrap items-baseline gap-2">
              <span className={`font-bold text-zinc-900 ${compact ? "text-base sm:text-lg" : "text-lg sm:text-xl"}`}>
                {formatArsPrice(product.price)}
              </span>
            </div>
            <p className={compact ? "line-clamp-1 text-xs text-zinc-500 sm:text-sm" : "text-xs text-zinc-500 sm:text-sm"}>
              {product.location}
            </p>
          </div>
          <span
            className={`mt-1 w-full rounded-full border border-[#822020]/30 text-center font-medium text-[#822020] ${
              compact ? "py-2 text-sm sm:py-2.5" : "py-2 text-sm sm:py-2.5"
            }`}
          >
            Ver publicación
          </span>
        </div>
      </Link>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setFav((v) => !v);
        }}
        aria-pressed={fav}
        aria-label={fav ? "Quitar de favoritos" : "Agregar a favoritos"}
        className={`absolute z-20 flex items-center justify-center rounded-full bg-white/95 shadow-md backdrop-blur-sm transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#822020] ${
          compact ? "right-2 top-2 h-9 w-9" : "right-2 top-2 h-9 w-9 sm:h-10 sm:w-10"
        } ${fav ? "text-[#822020]" : "text-zinc-500 hover:text-[#822020]"}`}
      >
        {fav ? (
          <svg viewBox="0 0 24 24" className={compact ? "h-5 w-5" : "h-5 w-5 sm:h-6 sm:w-6"} fill="currentColor" aria-hidden>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            className={compact ? "h-5 w-5" : "h-5 w-5 sm:h-6 sm:w-6"}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            aria-hidden
          >
            <path
              d="M12 20.25C11.72 20.25 11.45 20.15 11.24 19.96L5.46 14.61C3.98 13.24 3.6 10.99 4.56 9.19C5.29 7.83 6.67 6.96 8.19 6.96C9.28 6.96 10.34 7.42 11.12 8.24L12 9.15L12.88 8.24C13.66 7.42 14.72 6.96 15.81 6.96C17.33 6.96 18.71 7.83 19.44 9.19C20.4 10.99 20.02 13.24 18.54 14.61L12.76 19.96C12.55 20.15 12.28 20.25 12 20.25Z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </article>
  );
}
