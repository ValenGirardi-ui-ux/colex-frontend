import { Suspense } from "react";
import { SiteHeader } from "@/app/components/site-header";
import { EditListingClient } from "./edit-listing-client";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditarPublicacionPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-[#F6F6F6] text-zinc-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1240px] min-w-0 px-4 py-4 max-lg:px-3 lg:px-6 lg:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-[#822020] sm:text-4xl">
            Editar publicación
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600 sm:text-lg">
            Actualizá título, fotos, precio, categoría, talle, estado y método de entrega.
          </p>
        </div>
        <Suspense
          fallback={
            <p className="rounded-2xl border border-zinc-200 bg-white px-4 py-8 text-center text-sm text-zinc-600">
              Cargando…
            </p>
          }
        >
          <EditListingClient productId={id} />
        </Suspense>
      </main>
    </div>
  );
}
