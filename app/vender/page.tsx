import { Suspense } from "react";
import { SiteHeader } from "../components/site-header";
import { SellForm } from "../components/sell/sell-form";

export default function VenderPage() {
  return (
    <div className="min-h-screen bg-[#F6F6F6] text-zinc-900">
      <SiteHeader />
      <main className="colex-page min-w-0 max-lg:pb-2">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-[#822020] sm:text-4xl">Vender en Colex</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600 sm:text-lg">
            Publicá artículos escolares o institucionales en pocos pasos.
          </p>
        </div>
        <Suspense
          fallback={
            <p className="rounded-2xl border border-zinc-200 bg-white px-4 py-8 text-center text-sm text-zinc-600">
              Cargando formulario…
            </p>
          }
        >
          <SellForm />
        </Suspense>
      </main>
    </div>
  );
}
