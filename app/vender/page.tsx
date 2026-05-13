import { SiteHeader } from "../components/site-header";
import { SellForm } from "../components/sell/sell-form";

export default function VenderPage() {
  return (
    <div className="min-h-screen bg-[#F6F6F6] text-zinc-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1240px] px-4 py-6 lg:px-6 lg:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-[#822020] sm:text-4xl">Vender en Colex</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600 sm:text-lg">
            Publicá artículos escolares o institucionales en pocos pasos.
          </p>
        </div>
        <SellForm />
      </main>
    </div>
  );
}
