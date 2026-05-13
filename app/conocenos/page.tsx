const BRAND = "#822020";

const steps = ["Publicá", "Encontrá", "Coordiná"] as const;

const reasons = [
  "Comunidad escolar",
  "Productos nuevos y usados",
  "Compra y venta simple",
  "Ahorro y reutilización",
] as const;

export default function ConocenosPage() {
  return (
    <article className="space-y-12 lg:space-y-16">
      <header className="space-y-4 text-center lg:text-left">
        <h1
          className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[40px] lg:leading-tight"
          style={{ color: BRAND }}
        >
          Conocé Colex
        </h1>
        <p className="mx-auto max-w-2xl text-base text-zinc-600 sm:text-lg lg:mx-0">
          Una plataforma para comprar y vender artículos escolares e institucionales,
          nuevos o usados.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-zinc-900 sm:text-2xl">Qué es Colex</h2>
        <p className="max-w-3xl text-base leading-relaxed text-zinc-600 sm:text-[17px]">
          Colex conecta familias, estudiantes e instituciones para darle una segunda vida a
          uniformes, libros, útiles, mochilas y otros artículos escolares. Es un espacio
          donde la comunidad educativa puede circular lo que ya no usa y acceder a lo que
          necesita.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-zinc-900 sm:text-2xl">Nuestra misión</h2>
        <p className="max-w-3xl text-base leading-relaxed text-zinc-600 sm:text-[17px]">
          Hacer más simple, accesible y ordenada la compra y venta de productos escolares,
          para que dedicar menos tiempo a la logística signifique más tiempo para estudiar,
          compartir en familia y cuidar el entorno.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-zinc-900 sm:text-2xl">Cómo funciona</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {steps.map((title) => (
            <div
              key={title}
              className="flex min-h-[100px] items-center justify-center rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm transition hover:border-zinc-300 hover:shadow-md sm:min-h-[120px]"
            >
              <h3 className="text-lg font-semibold sm:text-xl" style={{ color: BRAND }}>
                {title}
              </h3>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-zinc-900 sm:text-2xl">Por qué Colex</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((title) => (
            <div
              key={title}
              className="flex min-h-[96px] items-center justify-center rounded-2xl border border-zinc-200 bg-white p-5 text-center shadow-sm transition hover:border-zinc-300 hover:shadow-md"
            >
              <h3 className="text-base font-semibold text-zinc-900 sm:text-[17px]">{title}</h3>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
