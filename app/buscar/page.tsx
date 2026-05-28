import Link from "next/link";
import { Suspense } from "react";
import { FilteredProductsSection } from "@/app/components/filtered-products-section";
import { SiteHeader } from "@/app/components/site-header";
import { getProducts } from "@/src/services/products";

type PageProps = {
  searchParams: Promise<{ q?: string; cat?: string; sub?: string }>;
};

export default async function BuscarPage({ searchParams }: PageProps) {
  const { q, cat, sub } = await searchParams;
  const query = (q ?? "").trim();
  const allProducts = await getProducts();
  const showSearchHint =
    !query && (!cat || cat === "todo") && (!sub || sub === "todo");

  return (
    <div className="min-h-screen bg-[#F6F6F6] text-zinc-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1240px] min-w-0 px-4 py-4 max-lg:px-3 lg:px-6 lg:py-8">
        {showSearchHint ? (
          <section
            className="mb-6 rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-10 text-center"
            aria-live="polite"
          >
            <p className="text-base font-medium text-zinc-800">Escribí algo en el buscador del encabezado</p>
            <p className="mt-2 text-sm text-zinc-600">
              También podés explorar por categoría en la{" "}
              <Link href="/#productos-destacados" className="font-medium text-[#822020] hover:underline">
                página principal
              </Link>
              .
            </p>
          </section>
        ) : (
          <Suspense
            fallback={
              <p className="rounded-2xl border border-zinc-200 bg-white px-4 py-10 text-center text-sm text-zinc-500">
                Cargando…
              </p>
            }
          >
            <FilteredProductsSection base="buscar" allProducts={allProducts} />
          </Suspense>
        )}
      </main>
    </div>
  );
}
