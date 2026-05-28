import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SiteHeader } from "@/app/components/site-header";
import { ProductListGrid } from "@/app/components/product-list-grid";
import { getDeliveryMethodDisplay } from "@/src/lib/delivery-method";
import { formatProductCondition } from "@/src/lib/product-condition";
import { getSellerPreview } from "@/src/services/profiles";
import { getProducts, getProductById } from "@/src/services/products";
import { ProductSellerCard } from "@/app/components/product/product-seller-card";
import { ProductDetailActions } from "./product-detail-actions";
import { ProductPublishBanner } from "./product-publish-banner";

type PageProps = { params: Promise<{ id: string }> };

function formatPublished(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default async function ProductoPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) {
    notFound();
  }
  const primaryImage = product.images?.[0];
  const related = (await getProducts()).filter((p) => p.id !== product.id).slice(0, 4);
  const delivery = getDeliveryMethodDisplay(product.delivery_method);
  const seller = await getSellerPreview(product.user_id);

  return (
    <div className="min-h-screen bg-[#F6F6F6] text-zinc-900">
      <SiteHeader />
      <Suspense fallback={null}>
        <ProductPublishBanner />
      </Suspense>
      <main className="min-w-0 overflow-x-hidden pb-12 max-lg:pb-20">
        <div className="border-b border-zinc-200/90 bg-white">
          <div className="mx-auto w-full max-w-[1240px] px-4 py-3 lg:px-6">
            <nav className="text-sm text-zinc-500" aria-label="Migas de pan">
              <Link href="/" className="transition hover:text-[#822020]">
                Inicio
              </Link>
              <span className="mx-2 text-zinc-300">/</span>
              <span className="line-clamp-2 text-zinc-700 max-lg:text-sm">{product.title}</span>
            </nav>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[1240px] min-w-0 px-4 py-4 max-lg:px-3 lg:flex lg:gap-10 lg:px-6 lg:py-10">
          {/*
            IMAGEN FICHA: reemplazar el placeholder por galería real (Next Image + thumbs).
            Conservar relación 1:1 o 4:5 en mobile.
          */}
          <div className="w-full shrink-0 lg:max-w-[min(100%,480px)] lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-zinc-100">
              {primaryImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={primaryImage}
                  alt=""
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#822020]/[0.08] to-zinc-100 px-4 text-center text-[#822020]/30">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-16 w-16 shrink-0 sm:h-20 sm:w-20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    aria-hidden
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 15l-3.086-3.086a2 2 0 00-2.828 0L6 21"
                    />
                  </svg>
                  <p className="text-sm text-zinc-400">Sin imagen</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 min-w-0 flex-1 space-y-5 lg:mt-0">
            {seller ? <ProductSellerCard seller={seller} /> : null}
            <ProductDetailActions product={product} />
          </div>
        </div>

        <div className="mx-auto w-full max-w-[1240px] space-y-8 px-4 lg:space-y-10 lg:px-6">
          <section
            className="rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-7"
            aria-labelledby="sec-desc"
          >
            <h2 id="sec-desc" className="text-lg font-bold text-zinc-900 sm:text-xl">
              Descripción
            </h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-600 sm:text-base">
              {product.description}
            </p>
          </section>

          <section
            className="rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-7"
            aria-labelledby="sec-details"
          >
            <h2 id="sec-details" className="text-lg font-bold text-zinc-900 sm:text-xl">
              Detalles del artículo
            </h2>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 sm:gap-4 sm:text-base">
              <div className="flex flex-col border-b border-zinc-100 pb-3 sm:border-0 sm:pb-0">
                <dt className="font-medium text-zinc-500">Categoría</dt>
                <dd className="text-zinc-900">{product.category}</dd>
              </div>
              <div className="flex flex-col border-b border-zinc-100 pb-3 sm:border-0 sm:pb-0">
                <dt className="font-medium text-zinc-500">Estado</dt>
                <dd className="text-zinc-900">{formatProductCondition(product)}</dd>
              </div>
              <div className="flex flex-col border-b border-zinc-100 pb-3 sm:border-0 sm:pb-0">
                <dt className="font-medium text-zinc-500">Talle / medida</dt>
                <dd className="text-zinc-900">{product.size ?? "—"}</dd>
              </div>
              <div className="flex flex-col border-b border-zinc-100 pb-3 sm:border-0 sm:pb-0">
                <dt className="font-medium text-zinc-500">Marca</dt>
                <dd className="text-zinc-900">{product.brand ?? "—"}</dd>
              </div>
              <div className="flex flex-col border-b border-zinc-100 pb-3 sm:border-0 sm:pb-0">
                <dt className="font-medium text-zinc-500">Institución</dt>
                <dd className="text-zinc-900">{product.institution ?? "—"}</dd>
              </div>
              <div className="flex flex-col border-b border-zinc-100 pb-3 sm:border-0 sm:pb-0">
                <dt className="font-medium text-zinc-500">Ubicación</dt>
                <dd className="text-zinc-900">{product.location}</dd>
              </div>
              <div className="flex flex-col border-b border-zinc-100 pb-3 sm:border-0 sm:pb-0">
                <dt className="font-medium text-zinc-500">Método de entrega</dt>
                <dd className="text-zinc-900">
                  <span className="block">{delivery.label}</span>
                  {delivery.description ? (
                    <span className="mt-0.5 block text-xs text-zinc-500 sm:text-sm">{delivery.description}</span>
                  ) : null}
                </dd>
              </div>
              <div className="flex flex-col sm:col-span-2">
                <dt className="font-medium text-zinc-500">Fecha de publicación</dt>
                <dd className="text-zinc-900">{formatPublished(product.created_at)}</dd>
              </div>
            </dl>
          </section>

          <section className="pb-4" aria-labelledby="sec-related">
            <h2 id="sec-related" className="text-xl font-bold text-zinc-900 sm:text-2xl">
              Quizás te interese
            </h2>
            <p className="mt-1 text-sm text-zinc-500 sm:text-base">
              Más publicaciones con enfoque similar en Colex.
            </p>
            <div className="mt-5">
              <ProductListGrid
                products={related}
                listClassName="grid grid-cols-2 gap-3 max-lg:gap-3 lg:grid-cols-4 lg:gap-4"
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
