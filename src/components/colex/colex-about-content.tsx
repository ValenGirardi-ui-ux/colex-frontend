const STEPS = ["Publicá", "Encontrá", "Coordiná"] as const;

const REASONS = [
  "Comunidad escolar",
  "Productos nuevos y usados",
  "Compra y venta simple",
  "Ahorro y reutilización",
] as const;

type ColexAboutContentProps = {
  /** En Ajustes: títulos más compactos, sin hero duplicado. */
  variant?: "page" | "settings";
};

export function ColexAboutContent({ variant = "page" }: ColexAboutContentProps) {
  const compact = variant === "settings";

  return (
    <div className={compact ? "space-y-8" : "space-y-12 lg:space-y-16"}>
      {!compact ? (
        <header className="space-y-4 text-center lg:text-left">
          <h1 className="text-3xl font-semibold tracking-tight text-[#822020] sm:text-4xl lg:text-[40px] lg:leading-tight">
            Conocé Colex
          </h1>
          <p className="mx-auto max-w-2xl text-base text-zinc-600 sm:text-lg lg:mx-0">
            Una plataforma para comprar y vender artículos escolares e institucionales, nuevos o usados.
          </p>
        </header>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-zinc-900 sm:text-2xl">Qué es Colex</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-zinc-600 sm:text-base">
          Colex conecta familias, estudiantes e instituciones para darle una segunda vida a uniformes,
          libros, útiles, mochilas y otros artículos escolares. Es un espacio donde la comunidad
          educativa puede circular lo que ya no usa y acceder a lo que necesita.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-zinc-900 sm:text-2xl">Nuestra misión</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-zinc-600 sm:text-base">
          Hacer más simple, accesible y ordenada la compra y venta de productos escolares, para que
          dedicar menos tiempo a la logística signifique más tiempo para estudiar, compartir en familia
          y cuidar el entorno.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-zinc-900 sm:text-2xl">Cómo funciona</h2>
        <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
          {STEPS.map((title) => (
            <div
              key={title}
              className="flex min-h-[88px] items-center justify-center rounded-2xl border border-zinc-200 bg-white p-5 text-center sm:min-h-[100px]"
            >
              <h3 className="text-base font-semibold text-[#822020] sm:text-lg">{title}</h3>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-zinc-900 sm:text-2xl">Por qué Colex</h2>
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {REASONS.map((title) => (
            <div
              key={title}
              className="flex min-h-[80px] items-center justify-center rounded-2xl border border-zinc-200 bg-white p-4 text-center sm:min-h-[88px]"
            >
              <h3 className="text-sm font-semibold text-zinc-900 sm:text-base">{title}</h3>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
