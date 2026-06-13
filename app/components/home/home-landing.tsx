import Link from "next/link";
import { FeaturedBusinessesCarousel } from "@/app/components/home/featured-businesses-carousel";
import { HomeFeed } from "@/app/components/home/home-feed";
import { HomeProductsRealtime } from "@/app/components/home/home-products-realtime";
import { HomePremiumSection } from "@/app/components/home/home-premium-section";
import type { FeaturedBusiness } from "@/src/types/featured-business";
import { ProductSearchForm } from "@/app/components/product-search-form";
import { HOME_CATEGORY_STRIP } from "@/src/data/home-category-strip";
import { buildBrowseHref } from "@/src/lib/product-filters";
import type { Product } from "@/src/types/product";

function CategoryIcon({ id, compact = false }: { id: string; compact?: boolean }) {
  const c = compact ? "h-5 w-5" : "h-6 w-6 sm:h-7 sm:w-7";
  const stroke = "1.4";
  switch (id) {
    case "uniformes":
      return (
        <svg className={c} fill="none" stroke="currentColor" strokeWidth={stroke} viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" d="M6 4l-2 4v2h4M18 4l2 4v2h-4M8 8h8" />
          <path strokeLinejoin="round" d="M8 8v10l4 3 4-3V8" />
        </svg>
      );
    case "guardapolvos":
      return (
        <svg className={c} fill="none" stroke="currentColor" strokeWidth={stroke} viewBox="0 0 24 24" aria-hidden>
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <path d="M9 8h6M9 12h4" />
        </svg>
      );
    case "libros":
      return (
        <svg className={c} fill="none" stroke="currentColor" strokeWidth={stroke} viewBox="0 0 24 24" aria-hidden>
          <path d="M4 5h4a2 2 0 0 1 2 2v12M4 19h4a2 2 0 0 0 2-2V5" />
          <path d="M20 5h-4a2 2 0 0 0-2 2v12M20 19h-4a2 2 0 0 1-2-2V5" />
        </svg>
      );
    case "utiles":
      return (
        <svg className={c} fill="none" stroke="currentColor" strokeWidth={stroke} viewBox="0 0 24 24" aria-hidden>
          <rect x="4" y="4" width="16" height="6" rx="1" />
          <rect x="7" y="12" width="6" height="8" />
          <path d="M15 12v8h2V12" />
        </svg>
      );
    case "mochilas":
      return (
        <svg className={c} fill="none" stroke="currentColor" strokeWidth={stroke} viewBox="0 0 24 24" aria-hidden>
          <rect x="6" y="7" width="12" height="13" rx="2" />
          <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
        </svg>
      );
    case "arte":
      return (
        <svg className={c} fill="none" stroke="currentColor" strokeWidth={stroke} viewBox="0 0 24 24" aria-hidden>
          <path d="M12 3c-4.5 0-8 3-8 7a6 6 0 0 0 6 6h1.5a2.5 2.5 0 0 0 0-5H10a2 2 0 0 1 0-4h.5" />
        </svg>
      );
    case "tecnologia":
      return (
        <svg className={c} fill="none" stroke="currentColor" strokeWidth={stroke} viewBox="0 0 24 24" aria-hidden>
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <path d="M10 17h4" />
        </svg>
      );
    default:
      return (
        <svg className={c} fill="none" stroke="currentColor" strokeWidth={stroke} viewBox="0 0 24 24" aria-hidden>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M8 8h8M8 12h4" />
        </svg>
      );
  }
}

function categoryHref(cat: (typeof HOME_CATEGORY_STRIP)[number]) {
  return buildBrowseHref("home", {
    main: cat.cat,
    sub: cat.sub ?? "todo",
    query: "",
  });
}

function CategoryStrip() {
  return (
    <section className="border-b border-zinc-200/80 bg-white py-5 sm:py-7" aria-label="Categorías destacadas">
      <div className="mx-auto w-full min-w-0 max-w-[1240px] px-3 sm:px-4 lg:px-6">
        <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5">
          <h2 className="text-lg font-bold text-zinc-900 sm:text-xl">
            <span className="lg:hidden">Categorías</span>
            <span className="hidden lg:inline">Buscá por categoría</span>
          </h2>
          <Link
            href="/buscar"
            className="shrink-0 text-xs font-semibold text-[#822020] hover:underline lg:hidden"
          >
            Ver todas
          </Link>
        </div>

        {/* Mobile / tablet: grilla compacta sin scroll horizontal */}
        <ul className="grid grid-cols-4 gap-2 sm:grid-cols-4 sm:gap-2.5 lg:hidden">
          {HOME_CATEGORY_STRIP.map((cat) => (
            <li key={cat.id} className="min-w-0">
              <Link
                href={categoryHref(cat)}
                className="group flex h-full min-h-[5.5rem] flex-col items-center justify-center gap-1.5 rounded-2xl border border-zinc-200/90 bg-zinc-50/80 px-1 py-3 text-center transition active:scale-[0.98] active:bg-[#822020]/[0.06] hover:border-[#822020]/30"
              >
                <span className="text-[#822020]">
                  <CategoryIcon id={cat.id} compact />
                </span>
                <span className="line-clamp-2 text-[10px] font-semibold leading-tight text-zinc-800 sm:text-[11px]">
                  {cat.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop: tarjetas con descripción */}
        <ul className="hidden gap-3 lg:grid lg:grid-cols-8">
          {HOME_CATEGORY_STRIP.map((cat) => (
            <li key={cat.id} className="min-w-0">
              <Link
                href={categoryHref(cat)}
                className="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-zinc-200/90 bg-zinc-50/80 px-3 py-5 text-center transition hover:border-[#822020]/30 hover:bg-[#822020]/[0.04]"
              >
                <span className="text-[#822020]">
                  <CategoryIcon id={cat.id} />
                </span>
                <span className="text-sm font-semibold text-zinc-800">{cat.label}</span>
                <span className="line-clamp-1 text-xs text-zinc-400">{cat.hint}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

type HomeLandingProps = {
  allProducts: Product[];
  featuredBusinesses?: FeaturedBusiness[];
  filterQuery?: string;
  /** Oculta negocios destacados cuando hay búsqueda o filtros en la URL. */
  showPremiumBusinesses?: boolean;
};

function Hero({ defaultSearchQuery = "" }: { defaultSearchQuery?: string }) {
  return (
    <section className="border-b border-[#822020]/10 bg-gradient-to-b from-white via-zinc-50/80 to-[#F6F6F6]">
      <div className="mx-auto flex w-full min-w-0 max-w-[1240px] flex-col gap-6 px-3 py-6 max-lg:gap-5 max-lg:py-6 sm:px-4 sm:py-10 lg:flex-row lg:items-center lg:gap-10 lg:px-6 lg:py-14">
        <div className="min-w-0 flex-1 space-y-5 sm:space-y-6">
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-zinc-900 max-lg:text-[1.65rem] sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
            Comprá y vendé artículos escolares en un solo lugar
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-zinc-600 sm:text-lg">
            Uniformes, libros, mochilas, útiles y productos institucionales, nuevos o usados, cerca tuyo.
          </p>
          <ProductSearchForm
            id="colex-home-hero-search"
            placeholder="Buscá por producto, colegio o barrio…"
            defaultQuery={defaultSearchQuery}
            className="space-y-2"
            inputClassName="h-14 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-base text-zinc-900 outline-none ring-[#822020]/0 transition focus:border-[#822020] focus:ring-4 focus:ring-[#822020]/15 sm:h-16 sm:px-5 sm:text-lg"
            hint={
              <p className="text-xs text-zinc-500 sm:text-sm">
                Tip: probá &quot;libro&quot;, &quot;guardapolvo&quot; o &quot;Nike talle 38&quot;.
              </p>
            }
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href="#productos-destacados"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#822020] px-8 text-sm font-semibold text-white transition hover:bg-[#6d1b1b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#822020] sm:h-14 sm:text-base"
            >
              Explorar productos
            </a>
            <Link
              href="/vender"
              className="inline-flex h-12 items-center justify-center rounded-full border-2 border-[#822020]/30 bg-white px-8 text-sm font-semibold text-[#822020] transition hover:border-[#822020] hover:bg-[#822020]/[0.05] sm:h-14 sm:text-base"
            >
              Vender ahora
            </Link>
          </div>
        </div>
        {/*
         * IMAGEN HERO: reemplazar este bloque por <Image /> o <img> cuando tengas el asset.
         * Ruta sugerida: /images/home/hero-illustration.webp
         * Mantener relación de aspecto ~4:3 o 1:1 en mobile.
         */}
        <div className="hidden w-full shrink-0 lg:block lg:max-w-md xl:max-w-lg">
          <div className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-100 sm:aspect-[4/3] lg:min-h-[280px]">
            <p className="px-4 text-center text-sm text-zinc-400">Espacio reservado para ilustración o foto del marketplace</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function PromotionalBlock() {
  return (
    <section
      className="bg-[#F6F6F6] py-6 sm:py-8"
      aria-label="Llamada a vender"
    >
      <div className="mx-auto w-full max-w-[1240px] px-3 sm:px-4 lg:px-6">
      {/*
       * Imagen promo: /public/images/home/promo-circulando.png (1024×577)
       */}
      <div className="grid overflow-hidden rounded-3xl border border-zinc-200/90 bg-zinc-100/90 lg:grid-cols-2 lg:items-stretch">
        <div className="relative aspect-[1024/577] overflow-hidden border-b border-zinc-200/80 bg-[#822020] lg:aspect-auto lg:min-h-[300px] lg:border-b-0 lg:border-r">
          <img
            src="/images/home/promo-circulando.png"
            alt="Sacá fotos, publicá, vendé y cobrá: ciclo para vender artículos escolares"
            width={1024}
            height={577}
            className="absolute inset-0 h-full w-full object-cover object-center"
            decoding="async"
          />
        </div>
        <div className="flex flex-col justify-center gap-4 p-6 sm:gap-5 sm:p-8 lg:p-10">
          <h2 className="text-2xl font-bold leading-tight text-zinc-900 sm:text-3xl">Dejá tus artículos escolares circulando</h2>
          <p className="text-base leading-relaxed text-zinc-600 sm:text-lg">
            Vendé lo que ya no usás y ayudá a otra familia a ahorrar.
          </p>
          <div>
            <Link
              href="/vender"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#822020] px-8 text-sm font-semibold text-white transition hover:bg-[#6d1b1b] sm:h-12 sm:px-10 sm:text-base"
            >
              Publicar producto
            </Link>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      t: "Convertí lo que no usás en plata",
      d: "Publicá en menos de un minuto.",
    },
    {
      t: "Vendé sin complicarte",
      d: "Hablá con compradores y coordiná fácil.",
    },
    {
      t: "Todo escolar, en un solo lugar",
      d: "Uniformes, libros, útiles y más.",
    },
  ];
  return (
    <section className="bg-white py-10 sm:py-12" id="como-funciona">
      <div className="mx-auto w-full min-w-0 max-w-[1240px] px-3 sm:px-4 lg:px-6">
        <h2 className="text-center text-2xl font-bold text-zinc-900 sm:text-3xl">Cómo funciona</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-zinc-600 sm:text-base">Tres pasos, pensado para familias y estudiantes</p>
        <ol className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-3 sm:gap-5">
          {steps.map((s, i) => (
            <li
              key={s.t}
              className="relative flex flex-col rounded-2xl border border-zinc-200/90 bg-zinc-50/60 p-5 sm:p-6"
            >
              <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#822020] text-sm font-bold text-white">
                {i + 1}
              </span>
              <h3 className="text-lg font-semibold text-zinc-900">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 sm:text-base">{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Trust() {
  const items = [
    "Productos nuevos y usados, siempre con claridad de estado",
    "Enfocado en colegios e instituciones: encontrá artículo por contexto",
    "Comprá o vendé con conversación y acuerdo simple",
    "Comunidad local: menos vueltas, más ahorro para las familias",
  ];
  return (
    <section className="border-t border-zinc-200/80 py-10 sm:py-12" aria-label="Confianza">
      <div className="mx-auto w-full min-w-0 max-w-[1240px] px-3 sm:px-4 lg:px-6">
        <h2 className="text-center text-xl font-bold text-zinc-900 sm:text-2xl">Colex, de la comunidad educativa</h2>
        <ul className="mx-auto mt-8 grid max-w-4xl gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4">
          {items.map((text) => (
            <li
              key={text}
              className="flex gap-3 rounded-2xl border border-zinc-200/80 bg-white p-4 sm:items-start sm:p-5"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#822020]/10 text-[#822020]">
                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <span className="text-sm leading-relaxed text-zinc-700 sm:text-base">{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function HomeLanding({
  allProducts,
  featuredBusinesses = [],
  filterQuery = "",
  showPremiumBusinesses = true,
}: HomeLandingProps) {
  const premiumBusinesses = featuredBusinesses.filter((b) => b.hasPremiumShop);

  return (
    <>
      <HomeProductsRealtime />
      <Hero defaultSearchQuery={filterQuery} />
      <CategoryStrip />
      {showPremiumBusinesses ? <FeaturedBusinessesCarousel businesses={premiumBusinesses} /> : null}
      <HomeFeed allProducts={allProducts} />
      <HomePremiumSection />
      <PromotionalBlock />
      <HowItWorks />
      <Trust />
    </>
  );
}
