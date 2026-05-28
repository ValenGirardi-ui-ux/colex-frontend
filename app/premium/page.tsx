import Link from "next/link";
import { SiteHeader } from "../components/site-header";
import { PremiumActivateButton } from "./premium-activate-button";
import { PremiumShopSection } from "./premium-shop-section";
import {
  PLAN_COMPARISON,
  PREMIUM_BENEFITS,
  PREMIUM_PRICE_LABEL,
  PREMIUM_PRICE_PERIOD,
} from "@/src/lib/premium-plan";

function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function PremiumStarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3l2.2 4.5 5 .7-3.6 3.5.9 5L12 14.8 7.5 16.7l.9-5L4.8 8.2l5-.7L12 3z"
      />
    </svg>
  );
}

export default function PremiumPage() {
  return (
    <div className="min-h-screen bg-[#F6F6F6] text-zinc-900">
      <SiteHeader />
      <main className="colex-page min-w-0">
        {/* Hero */}
        <header className="rounded-2xl border border-[#822020]/15 bg-gradient-to-b from-[#822020]/[0.06] via-white to-white p-6 sm:rounded-3xl sm:p-8 lg:p-10">
          <Link
            href="/"
            className="inline-flex text-sm font-medium text-zinc-500 transition hover:text-[#822020]"
          >
            ← Volver al inicio
          </Link>
          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#822020]/20 bg-[#822020]/[0.08] px-3 py-1 text-xs font-semibold text-[#822020] sm:text-sm">
                <PremiumStarIcon />
                Recomendado para negocios
              </span>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl lg:text-[2.75rem]">
                Colex Premium
              </h1>
              <p className="text-base leading-relaxed text-zinc-600 sm:text-lg">
                Potenciá tu librería, uniformería o negocio escolar con más visibilidad, cero comisión y
                herramientas pensadas para vender más en Colex.
              </p>
            </div>
            <div className="shrink-0 rounded-2xl border border-zinc-200/90 bg-white px-6 py-5 sm:px-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Desde</p>
              <p className="mt-1 flex flex-wrap items-baseline gap-2">
                <span className="text-4xl font-bold text-[#822020]">{PREMIUM_PRICE_LABEL}</span>
                <span className="text-lg font-medium text-zinc-500">{PREMIUM_PRICE_PERIOD}</span>
              </p>
              <p className="mt-2 text-sm text-zinc-500">Facturación mensual · Cancelás cuando quieras</p>
            </div>
          </div>
        </header>

        {/* Beneficios detallados */}
        <section className="mt-10 sm:mt-12" aria-labelledby="premium-benefits-heading">
          <h2 id="premium-benefits-heading" className="text-2xl font-bold text-zinc-900 sm:text-3xl">
            Todo lo que incluye
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600 sm:text-base">
            Diseñado para negocios que publican con frecuencia y buscan destacarse frente a familias y
            estudiantes.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-2">
            {PREMIUM_BENEFITS.map((benefit) => (
              <li
                key={benefit.title}
                className="flex gap-4 rounded-2xl border border-zinc-200/90 bg-white p-4 sm:p-5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#822020]/10 text-[#822020]">
                  <CheckIcon />
                </span>
                <div className="min-w-0">
                  <h3 className="font-semibold text-zinc-900">{benefit.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-600">{benefit.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Comparación */}
        <section className="mt-10 sm:mt-14" aria-labelledby="premium-compare-heading">
          <h2 id="premium-compare-heading" className="text-2xl font-bold text-zinc-900 sm:text-3xl">
            Gratis vs Premium
          </h2>
          <p className="mt-2 text-sm text-zinc-600 sm:text-base">
            Compará el plan gratuito con Premium y elegí el que mejor se adapte a tu negocio.
          </p>

          {/* Mobile: cards */}
          <div className="mt-6 space-y-3 lg:hidden">
            {PLAN_COMPARISON.map((row) => (
              <div key={row.feature} className="rounded-2xl border border-zinc-200/90 bg-white p-4">
                <p className="text-sm font-semibold text-zinc-900">{row.feature}</p>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Gratis</p>
                    <p className="mt-1 text-zinc-700">{row.free}</p>
                  </div>
                  <div className="rounded-xl border border-[#822020]/15 bg-[#822020]/[0.04] px-3 py-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-[#822020]">Premium</p>
                    <p className={`mt-1 font-medium ${row.premiumHighlight ? "text-[#822020]" : "text-zinc-800"}`}>
                      {row.premium}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: tabla */}
          <div className="mt-6 hidden overflow-hidden rounded-2xl border border-zinc-200/90 bg-white lg:block">
            <table className="w-full min-w-0 text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200/90 bg-zinc-50/80">
                  <th className="px-6 py-4 font-semibold text-zinc-900">Beneficio</th>
                  <th className="px-6 py-4 font-semibold text-zinc-500">Gratis</th>
                  <th className="bg-[#822020]/[0.04] px-6 py-4 font-semibold text-[#822020]">Premium</th>
                </tr>
              </thead>
              <tbody>
                {PLAN_COMPARISON.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={i < PLAN_COMPARISON.length - 1 ? "border-b border-zinc-100" : undefined}
                  >
                    <td className="px-6 py-4 font-medium text-zinc-900">{row.feature}</td>
                    <td className="px-6 py-4 text-zinc-600">{row.free}</td>
                    <td
                      className={`bg-[#822020]/[0.03] px-6 py-4 font-medium ${
                        row.premiumHighlight ? "text-[#822020]" : "text-zinc-800"
                      }`}
                    >
                      {row.premium}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <PremiumShopSection />

        {/* CTA final */}
        <section
          className="mt-10 rounded-2xl border border-[#822020]/15 bg-white p-6 sm:mt-14 sm:rounded-3xl sm:p-8"
          aria-label="Activar plan Premium"
        >
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 sm:text-2xl">¿Listo para crecer en Colex?</h2>
              <p className="mt-2 max-w-xl text-sm text-zinc-600 sm:text-base">
                Activá Premium en un paso. El pago online llegará pronto; por ahora registramos tu interés de
                forma inmediata.
              </p>
            </div>
            <PremiumActivateButton />
          </div>
        </section>
      </main>
    </div>
  );
}
