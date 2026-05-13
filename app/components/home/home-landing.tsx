import Link from "next/link";
import { getProducts } from "@/src/services/products";
import { HomeProductCard } from "./home-product-card";

const CATEGORIES: { id: string; label: string; hint: string }[] = [
  { id: "uniformes", label: "Uniformes", hint: "Gorro, camisas" },
  { id: "guardapolvos", label: "Guardapolvos", hint: "Blanco, azul" },
  { id: "libros", label: "Libros", hint: "Materia y curso" },
  { id: "utiles", label: "Útiles", hint: "Lápices, mochi" },
  { id: "mochilas", label: "Mochilas", hint: "Tamaños varios" },
  { id: "calzado", label: "Calzado", hint: "Talle y colegio" },
  { id: "institucional", label: "Institucional", hint: "Buzos, ropa" },
  { id: "otros", label: "Otros", hint: "Accesorios" },
];

function CategoryIcon({ id }: { id: string }) {
  const c = "h-6 w-6 sm:h-7 sm:w-7";
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
    case "calzado":
      return (
        <svg className={c} fill="none" stroke="currentColor" strokeWidth={stroke} viewBox="0 0 24 24" aria-hidden>
          <path d="M2 12c3-1 5-1 6 0s2 1 2 0 3-1 4 0-2 0-1 0 2 0 3-1" />
        </svg>
      );
    case "institucional":
      return (
        <svg className={c} fill="none" stroke="currentColor" strokeWidth={stroke} viewBox="0 0 24 24" aria-hidden>
          <path d="M4 20V10l8-4 8 4v10M4 20h16M4 20v-2h3v-4h4v4h3v-4h3v-4" />
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

function Hero() {
  return (
    <section className="border-b border-[#822020]/10 bg-gradient-to-b from-white via-zinc-50/80 to-[#F6F6F6]">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-8 px-4 py-8 sm:py-10 lg:flex-row lg:items-center lg:gap-10 lg:px-6 lg:py-14">
        <div className="min-w-0 flex-1 space-y-5 sm:space-y-6">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
            Comprá y vendé artículos escolares en un solo lugar
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-zinc-600 sm:text-lg">
            Uniformes, libros, mochilas, útiles y productos institucionales, nuevos o usados, cerca tuyo.
          </p>
          <div className="space-y-2">
            <label htmlFor="colex-home-hero-search" className="sr-only">
              Buscar en Colex
            </label>
            <input
              id="colex-home-hero-search"
              name="q"
              type="text"
              inputMode="search"
              autoComplete="off"
              placeholder="Buscá por producto, colegio o barrio…"
              className="h-14 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-base text-zinc-900 shadow-sm outline-none ring-[#822020]/0 transition focus:border-[#822020] focus:ring-4 focus:ring-[#822020]/15 sm:h-16 sm:px-5 sm:text-lg"
            />
            <p className="text-xs text-zinc-500 sm:text-sm">Tip: probá &quot;guardapolvo&quot;, &quot;Nike talle 38&quot; o &quot;CABA&quot;.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href="#productos-destacados"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#822020] px-8 text-sm font-semibold text-white shadow-md transition hover:bg-[#6d1b1b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#822020] sm:h-14 sm:text-base"
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
        <div className="w-full shrink-0 lg:max-w-md xl:max-w-lg">
          <div className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-100 shadow-inner sm:aspect-[4/3] lg:min-h-[280px]">
            <p className="px-4 text-center text-sm text-zinc-400">Espacio reservado para ilustración o foto del marketplace</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryStrip() {
  return (
    <section className="border-b border-zinc-200/80 bg-white/90 py-6 sm:py-8" aria-label="Categorías destacadas">
      <div className="mx-auto w-full max-w-[1240px] px-4 lg:px-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500 sm:mb-5">Buscá por categoría</h2>
        <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:thin] sm:grid sm:grid-cols-2 sm:overflow-visible md:grid-cols-4 lg:grid-cols-8">
          {CATEGORIES.map((cat) => (
            <a
              key={cat.id}
              href="#productos-destacados"
              className="group flex min-w-[128px] shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border border-zinc-200/90 bg-zinc-50/80 px-3 py-4 text-center shadow-sm transition hover:border-[#822020]/30 hover:bg-[#822020]/[0.04] hover:shadow sm:min-w-0 sm:py-5"
            >
              <span className="text-[#822020]">
                <CategoryIcon id={cat.id} />
              </span>
              <span className="text-xs font-semibold text-zinc-800 sm:text-sm">{cat.label}</span>
              <span className="line-clamp-1 text-[10px] text-zinc-400 sm:text-xs">{cat.hint}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function PromotionalBlock() {
  return (
    <section
      className="mx-auto w-full max-w-[1240px] px-4 py-6 sm:py-8 lg:px-6"
      aria-label="Llamada a vender"
    >
      {/*
       * IMAGEN PROMO: reemplazar el bloque gris (columna izquierda en desktop) por imagen de campaña.
       * Tamaño sugerido: 1200×500 o recorte a la mitad (columna 50% en lg:grid-cols-2).
       */}
      <div className="grid overflow-hidden rounded-3xl border border-zinc-200/90 bg-zinc-100/90 shadow-sm lg:grid-cols-2">
        <div className="flex min-h-[200px] items-center justify-center border-b border-zinc-200/80 bg-gradient-to-br from-zinc-100 to-zinc-200/80 lg:min-h-[260px] lg:border-b-0 lg:border-r">
          <p className="px-4 text-center text-sm text-zinc-400">Placeholder imagen promocional</p>
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
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      t: "Publicá tu producto",
      d: "Subí fotos, el precio y a qué colegio aplica. En minutos queda en Colex.",
    },
    {
      t: "Coordiná con el comprador",
      d: "Acordá pago, retiro o envío. Todo conversando desde el marketplace.",
    },
    {
      t: "Vendé de forma simple",
      d: "Sin trámites raros. Lo escolar se renueva y la comunidad ahorra.",
    },
  ];
  return (
    <section className="bg-white py-10 sm:py-12" id="como-funciona">
      <div className="mx-auto w-full max-w-[1240px] px-4 lg:px-6">
        <h2 className="text-center text-2xl font-bold text-zinc-900 sm:text-3xl">Cómo funciona</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-zinc-600 sm:text-base">Tres pasos, pensado para familias y estudiantes</p>
        <ol className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-3 sm:gap-5">
          {steps.map((s, i) => (
            <li
              key={s.t}
              className="relative flex flex-col rounded-2xl border border-zinc-200/90 bg-zinc-50/60 p-5 shadow-sm sm:p-6"
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
      <div className="mx-auto w-full max-w-[1240px] px-4 lg:px-6">
        <h2 className="text-center text-xl font-bold text-zinc-900 sm:text-2xl">Colex, de la comunidad educativa</h2>
        <ul className="mx-auto mt-8 grid max-w-4xl gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4">
          {items.map((text) => (
            <li
              key={text}
              className="flex gap-3 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm sm:items-start sm:p-5"
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

export async function HomeLanding() {
  const homeFeaturedProducts = (await getProducts()).slice(0, 8);

  return (
    <>
      <Hero />
      <CategoryStrip />
      <section id="productos-destacados" className="scroll-mt-4 py-8 sm:py-10">
        <div className="mx-auto w-full max-w-[1240px] px-4 lg:px-6">
          <div className="mb-6 flex flex-col gap-1 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl">Productos destacados</h2>
              <p className="mt-1 text-sm text-zinc-600 sm:text-base">Ejemplos reales de publicaciones. Pronto filtrarás por colegio y barrio.</p>
            </div>
            <Link href="/#productos-destacados" className="text-sm font-medium text-[#822020] hover:underline">
              Ver catálogo completo
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {homeFeaturedProducts.map((p) => (
              <HomeProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>
      <PromotionalBlock />
      <HowItWorks />
      <Trust />
    </>
  );
}
