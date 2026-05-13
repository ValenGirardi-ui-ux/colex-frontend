"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";
import { SiteHeader } from "@/app/components/site-header";
import { getProductDetailById } from "@/src/data/mockProducts";
import { formatArsPrice } from "@/src/lib/money";
import { formatProductCondition } from "@/src/lib/product-condition";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function ComprarProductoPage({ params }: PageProps) {
  const { id } = use(params);
  const product = getProductDetailById(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#F6F6F6] text-zinc-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1240px] px-4 py-6 lg:px-6 lg:py-8">
        <div className="mb-5 flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/" className="transition hover:text-[#822020]">
            Inicio
          </Link>
          <span>/</span>
          <Link href={`/producto/${encodeURIComponent(product.id)}`} className="transition hover:text-[#822020]">
            Producto
          </Link>
          <span>/</span>
          <span className="text-zinc-700">Compra</span>
        </div>

        <section className="grid gap-6 rounded-3xl border border-zinc-200/90 bg-white p-5 shadow-sm sm:p-6 lg:grid-cols-[1fr_420px]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-100">
              {product.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.images[0]} alt="" className="aspect-square w-full object-cover" />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center bg-gradient-to-br from-[#822020]/[0.08] to-zinc-100 text-[#822020]/35">
                  <svg viewBox="0 0 24 24" className="h-16 w-16" fill="none" stroke="currentColor" strokeWidth="1.3">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-3.086-3.086a2 2 0 00-2.828 0L6 21" />
                  </svg>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">{product.title}</h1>
              <p className="text-3xl font-bold text-zinc-900">{formatArsPrice(product.price)}</p>
              <p className="text-sm text-zinc-600 sm:text-base">
                <span className="font-medium text-zinc-500">Estado:</span> {formatProductCondition(product)}
              </p>
              {product.institution ? (
                <p className="text-sm text-zinc-600 sm:text-base">
                  <span className="font-medium text-zinc-500">Institución:</span> {product.institution}
                </p>
              ) : null}
              <p className="text-sm text-zinc-600 sm:text-base">
                <span className="font-medium text-zinc-500">Ubicación:</span> {product.location}
              </p>
            </div>
          </div>

          <aside className="rounded-2xl border border-zinc-200/90 bg-zinc-50/70 p-5">
            <h2 className="text-lg font-semibold text-zinc-900">Resumen de compra</h2>
            <div className="mt-4 space-y-2 text-sm text-zinc-700">
              <p className="flex items-center justify-between gap-3">
                <span>Producto</span>
                <span className="text-right font-medium text-zinc-900">{product.title}</span>
              </p>
              <p className="flex items-center justify-between gap-3">
                <span>Precio</span>
                <span className="font-semibold text-zinc-900">{formatArsPrice(product.price)}</span>
              </p>
              <p className="flex items-center justify-between gap-3">
                <span>Estado</span>
                <span>{formatProductCondition(product)}</span>
              </p>
              <p className="flex items-center justify-between gap-3">
                <span>Ubicación</span>
                <span className="text-right">{product.location}</span>
              </p>
            </div>

            <Link
              href={`/comprar/${encodeURIComponent(product.id)}/pago`}
              className="mt-5 flex h-12 w-full items-center justify-center rounded-full bg-[#822020] text-sm font-semibold text-white transition hover:bg-[#6d1b1b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#822020]"
            >
              Confirmar compra
            </Link>

            <Link
              href={`/producto/${encodeURIComponent(product.id)}`}
              className="mt-3 flex h-12 w-full items-center justify-center rounded-full border border-[#822020]/30 bg-white text-sm font-semibold text-[#822020] transition hover:bg-[#822020]/[0.05]"
            >
              Volver al producto
            </Link>
          </aside>
        </section>
      </main>
    </div>
  );
}
