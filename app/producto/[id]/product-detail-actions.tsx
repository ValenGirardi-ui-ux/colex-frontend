"use client";

import { useState } from "react";
import Link from "next/link";
import { formatArsPrice } from "@/src/lib/money";
import { formatProductCondition } from "@/src/lib/product-condition";
import type { ProductDetail } from "@/src/types/product";

type ProductDetailActionsProps = {
  product: ProductDetail;
};

export function ProductDetailActions({ product }: ProductDetailActionsProps) {
  const [fav, setFav] = useState(false);
  const buyHref = `/comprar/${encodeURIComponent(product.id)}`;

  const mensajesHref = `/mensajes?${new URLSearchParams({ producto: product.id })}`;

  return (
    <div className="space-y-5 sm:space-y-6">
      <h1 className="text-2xl font-bold leading-tight text-zinc-900 sm:text-3xl lg:text-4xl">{product.title}</h1>

      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-3xl font-bold text-zinc-900 sm:text-4xl">{formatArsPrice(product.price)}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold sm:text-sm ${
            product.condition === "nuevo" ? "bg-[#822020]/10 text-[#822020]" : "bg-zinc-200 text-zinc-700"
          }`}
        >
          {formatProductCondition(product)}
        </span>
        <span className="text-sm text-zinc-500 sm:text-base">{product.category}</span>
      </div>

      {product.institution ? (
        <p className="text-sm text-zinc-700 sm:text-base">
          <span className="font-medium text-zinc-500">Institución:</span> {product.institution}
        </p>
      ) : null}

      <p className="text-sm text-zinc-700 sm:text-base">
        <span className="font-medium text-zinc-500">Ubicación:</span> {product.location}
      </p>

      <p className="text-sm leading-relaxed text-zinc-600 sm:text-base">
        <span className="font-medium text-zinc-500">Entrega: </span>
        Coordinar con el vendedor.
      </p>

      <div className="flex flex-col gap-3 pt-1 sm:max-w-md">
        <Link
          href={buyHref}
          className="flex h-12 w-full items-center justify-center rounded-full bg-[#822020] text-sm font-semibold text-white transition hover:bg-[#6d1b1b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#822020] sm:h-14 sm:text-base"
        >
          Comprar
        </Link>
        <Link
          href={mensajesHref}
          className="flex h-12 w-full items-center justify-center rounded-full border-2 border-zinc-300 bg-white text-sm font-semibold text-zinc-800 transition hover:border-[#822020]/40 hover:text-[#822020] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#822020] sm:h-14 sm:text-base"
        >
          Enviar mensaje
        </Link>
        <button
          type="button"
          onClick={() => setFav((v) => !v)}
          aria-pressed={fav}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-zinc-300 bg-white text-sm font-semibold text-zinc-800 transition hover:border-[#822020]/40 hover:text-[#822020] sm:h-14 sm:text-base"
        >
          {fav ? (
            <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : (
            <svg
              className="h-6 w-6 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden
            >
              <path
                d="M12 20.25C11.72 20.25 11.45 20.15 11.24 19.96L5.46 14.61C3.98 13.24 3.6 10.99 4.56 9.19C5.29 7.83 6.67 6.96 8.19 6.96C9.28 6.96 10.34 7.42 11.12 8.24L12 9.15L12.88 8.24C13.66 7.42 14.72 6.96 15.81 6.96C17.33 6.96 18.71 7.83 19.44 9.19C20.4 10.99 20.02 13.24 18.54 14.61L12.76 19.96C12.55 20.15 12.28 20.25 12 20.25Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          {fav ? "Guardado en favoritos" : "Guardar en favoritos"}
        </button>
        <p className="pt-1 text-center text-xs text-zinc-400 sm:text-left">
          <Link href="/favoritos" className="font-medium text-[#822020] hover:underline">
            Ver favoritos
          </Link>
        </p>
      </div>
    </div>
  );
}
