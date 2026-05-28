const services = [
  "Desarrollo web",
  "Marketplaces",
  "Automatización",
  "Diseño de producto",
  "Integraciones",
  "Inteligencia artificial",
] as const;

export function AurenzaPageContent() {
  return (
    <article className="space-y-16 lg:space-y-24">
      <header className="space-y-5 border-b border-zinc-800/90 pb-14 lg:pb-16">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-zinc-500">
          Estudio digital
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Aurenza
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-zinc-300 sm:text-xl">
          Creamos soluciones digitales para transformar ideas en productos reales.
        </p>
      </header>

      <section className="space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Qué hacemos
        </h2>
        <p className="max-w-3xl text-base leading-relaxed text-zinc-300 sm:text-lg">
          Aurenza desarrolla plataformas digitales, marketplaces, automatizaciones, experiencias web y
          soluciones tecnológicas para negocios. Unimos estrategia, diseño e ingeniería para lanzar
          productos que funcionan en el mundo real: rápidos, seguros y pensados para escalar.
        </p>
      </section>

      <section className="space-y-8">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Nuestros servicios
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((label) => (
            <div
              key={label}
              className="rounded-2xl border border-zinc-800/90 bg-zinc-950/80 px-6 py-7 transition hover:border-zinc-700 hover:bg-zinc-950"
            >
              <p className="text-base font-medium text-white sm:text-lg">{label}</p>
              <div className="mt-4 h-px w-10 bg-zinc-700" aria-hidden />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Nuestra forma de trabajar
        </h2>
        <p className="max-w-3xl text-base leading-relaxed text-zinc-300 sm:text-lg">
          Convertimos ideas en productos simples, escalables y bien diseñados. Priorizamos claridad,
          iteración con feedback real y una base técnica sólida para que cada entrega sume valor desde
          el primer día y pueda crecer con tu negocio.
        </p>
      </section>

      <section
        className="rounded-2xl border border-zinc-800 bg-zinc-950/60 px-8 py-12 text-center sm:px-12 sm:py-16"
        aria-labelledby="aurenza-cta-heading"
      >
        <h2
          id="aurenza-cta-heading"
          className="text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl"
        >
          Construyamos algo juntos
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-zinc-500 sm:text-base">
          Cuando quieras llevar tu próximo producto digital adelante, acá estamos.
        </p>
      </section>
    </article>
  );
}
