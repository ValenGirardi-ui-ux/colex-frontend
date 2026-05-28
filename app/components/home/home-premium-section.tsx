import Link from "next/link";
import { PREMIUM_BENEFIT_SHORT } from "@/src/lib/premium-plan";

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function PremiumBadgeIcon() {
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

export function HomePremiumSection() {
  return (
    <section
      id="colex-premium"
      className="scroll-mt-4 bg-[#F6F6F6] py-6 sm:py-8"
      aria-labelledby="colex-premium-heading"
    >
      <div className="mx-auto w-full min-w-0 max-w-[1240px] px-3 sm:px-4 lg:px-6">
        <div className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white sm:rounded-3xl">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            {/* Oferta y CTA */}
            <div className="flex flex-col justify-between gap-6 border-b border-zinc-200/80 p-5 sm:p-7 lg:border-b-0 lg:border-r lg:p-8">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#822020]/20 bg-[#822020]/[0.08] px-3 py-1 text-xs font-semibold text-[#822020] sm:text-sm">
                  <PremiumBadgeIcon />
                  Recomendado para negocios
                </span>
                <div>
                  <h2
                    id="colex-premium-heading"
                    className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl"
                  >
                    Colex Premium
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600 sm:text-base">
                    Más visibilidad, menos comisiones y herramientas para vender más en el marketplace escolar.
                  </p>
                </div>
                <div className="flex flex-wrap items-baseline gap-2">
                  <p className="text-3xl font-bold text-[#822020] sm:text-4xl">$25.000</p>
                  <p className="text-base font-medium text-zinc-500">/ mes</p>
                </div>
              </div>
              <div>
                <Link
                  href="/premium"
                  className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#822020] px-8 text-sm font-semibold text-white transition hover:bg-[#6d1b1b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#822020] sm:w-auto sm:min-w-[220px] sm:text-base"
                >
                  Quiero ser Premium
                </Link>
                <p className="mt-3 text-center text-xs text-zinc-500 sm:text-left">
                  <Link href="/premium" className="font-medium text-[#822020] hover:underline">
                    Ver plan completo
                  </Link>
                </p>
              </div>
            </div>

            {/* Beneficios */}
            <div className="bg-zinc-50/60 p-5 sm:p-7 lg:p-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Incluye</p>
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-1 sm:gap-3">
                {PREMIUM_BENEFIT_SHORT.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex gap-3 rounded-xl border border-zinc-200/70 bg-white px-3.5 py-3 sm:px-4"
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#822020]/10 text-[#822020]">
                      <CheckIcon />
                    </span>
                    <span className="text-sm leading-snug text-zinc-800 sm:text-[15px]">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
