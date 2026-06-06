"use client";

import Link from "next/link";
import { FavoriteToggleButton } from "@/app/components/favorite-toggle-button";
import { ProductReportMenu } from "@/app/components/product/product-report-menu";
import { StartProductConversationButton } from "@/app/components/start-product-conversation-button";
import { formatArsPrice } from "@/src/lib/money";
import { getDeliveryMethodDisplay } from "@/src/lib/delivery-method";
import { formatProductCondition } from "@/src/lib/product-condition";
import type { ProductDetail } from "@/src/types/product";

type ProductDetailActionsProps = {
  product: ProductDetail;
};

export function ProductDetailActions({ product }: ProductDetailActionsProps) {
  const buyHref = `/comprar/${encodeURIComponent(product.id)}`;
  const delivery = getDeliveryMethodDisplay(product.delivery_method);

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex items-start justify-between gap-3">
        <h1 className="min-w-0 flex-1 text-xl font-bold leading-tight text-zinc-900 max-lg:break-words sm:text-3xl lg:text-4xl">
          {product.title}
        </h1>
        <ProductReportMenu productId={product.id} />
      </div>

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

      <div className="text-sm leading-relaxed sm:text-base">
        <p className="text-zinc-700">
          <span className="font-medium text-zinc-500">Entrega: </span>
          {delivery.label}
        </p>
        {delivery.description ? (
          <p className="mt-0.5 text-xs text-zinc-500 sm:text-sm">{delivery.description}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 pt-1 sm:max-w-md">
        <Link
          href={buyHref}
          className="flex h-12 w-full items-center justify-center rounded-full bg-[#822020] text-sm font-semibold text-white transition hover:bg-[#6d1b1b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#822020] sm:h-14 sm:text-base"
        >
          Comprar
        </Link>
        <StartProductConversationButton
          productId={product.id}
          className="flex h-12 w-full items-center justify-center rounded-full border-2 border-zinc-300 bg-white text-sm font-semibold text-zinc-800 transition hover:border-[#822020]/40 hover:text-[#822020] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#822020] disabled:opacity-60 sm:h-14 sm:text-base"
        >
          Enviar mensaje
        </StartProductConversationButton>
        <FavoriteToggleButton productId={product.id} variant="detail" />
        <p className="pt-1 text-center text-xs text-zinc-400 sm:text-left">
          <Link href="/favoritos" className="font-medium text-[#822020] hover:underline">
            Ver favoritos
          </Link>
        </p>
      </div>
    </div>
  );
}
