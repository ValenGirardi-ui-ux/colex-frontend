import Link from "next/link";

const TEAL = "#0A8FA1";

type Area = "inicio" | "vender" | "comprar" | "cuenta";

type PageProps = {
  searchParams: Promise<{ area?: string }>;
};

const navItems: Array<{ area: Area; label: string; href: string }> = [
  { area: "inicio", label: "Inicio", href: "/ajustes/configuracion" },
  { area: "vender", label: "Vender", href: "/ajustes/configuracion?area=vender" },
  { area: "comprar", label: "Comprar", href: "/ajustes/configuracion?area=comprar" },
  { area: "cuenta", label: "Cuenta", href: "/ajustes/configuracion?area=cuenta" },
];

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={18}
      height={18}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 2v4M12 18v4M4.5 4.5l2.8 2.8M16.7 16.7l2.8 2.8M2 12h4M18 12h4M4.5 19.5l2.8-2.8M16.7 7.3l2.8-2.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconVender({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M10 14l6-4 4 8-6 4-4-8z"
        stroke={TEAL}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M22 12l14-2 4 10-14 2-4-10z"
        stroke={TEAL}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="14" cy="16" r="1.2" fill={TEAL} />
      <circle cx="30" cy="15" r="1.2" fill={TEAL} />
    </svg>
  );
}

function IconComprar({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M14 18h20l-1.5 16H15.5L14 18z"
        stroke={TEAL}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M18 18V14a6 6 0 0 1 12 0v4"
        stroke={TEAL}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconCuenta({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="24" cy="18" r="7" stroke={TEAL} strokeWidth="2" />
      <path
        d="M12 40c0-8 5.5-12 12-12s12 4 12 12"
        stroke={TEAL}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function normalizeArea(raw: string | undefined): Area {
  if (raw === "vender" || raw === "comprar" || raw === "cuenta") return raw;
  return "inicio";
}

export default async function ConfiguracionCuentaPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeArea = normalizeArea(params.area);

  const topicCards = [
    { key: "vender" as const, label: "Vender", icon: IconVender, href: "?area=vender" },
    { key: "comprar" as const, label: "Comprar", icon: IconComprar, href: "?area=comprar" },
    { key: "cuenta" as const, label: "Cuenta", icon: IconCuenta, href: "?area=cuenta" },
  ];

  return (
    <div className="flex flex-col gap-10 lg:flex-row lg:gap-14">
      <aside className="shrink-0 lg:w-[220px]">
        <h1 className="mb-8 text-xl font-semibold tracking-tight text-zinc-900 lg:text-[22px]">
          Configuración
        </h1>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = item.area === activeArea;
            return (
              <Link
                key={item.area}
                href={item.href}
                className={`rounded-lg px-1 py-2.5 text-[15px] transition lg:py-3 lg:text-base ${
                  active
                    ? "font-semibold text-zinc-900"
                    : "font-normal text-zinc-600 hover:text-zinc-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/conocenos"
            className="rounded-lg px-1 py-2.5 text-[15px] font-normal text-zinc-600 transition hover:text-zinc-900 lg:py-3 lg:text-base"
          >
            Conocenos
          </Link>
          <Link
            href="/aurenza"
            className="rounded-lg px-1 py-2.5 text-[15px] font-normal text-zinc-600 transition hover:text-zinc-900 lg:py-3 lg:text-base"
          >
            Aurenza
          </Link>
        </nav>
      </aside>

      <div className="min-w-0 flex-1 space-y-8">
        <header className="space-y-5">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl lg:text-[32px]">
            ¿Cómo podemos ayudarte?
          </h2>
          <div className="space-y-2">
            <p className="text-sm text-zinc-500">Tengo una pregunta general</p>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                <SparkleIcon />
              </span>
              <input
                id="colex-config-landing-search"
                name="config-landing-search"
                type="text"
                inputMode="search"
                autoComplete="off"
                placeholder="Escribe una pregunta..."
                className="h-12 w-full rounded-xl border border-zinc-200 bg-zinc-100 py-3 pl-12 pr-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-300 focus:bg-white sm:h-14 sm:text-base"
                aria-label="Buscar en configuración"
              />
            </div>
          </div>
        </header>

        <section className="space-y-4">
          <h3 className="text-base font-semibold text-zinc-900 sm:text-lg">
            Temas generales
          </h3>
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
            <div className="grid divide-y divide-zinc-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {topicCards.map(({ key, label, icon: Icon, href }) => (
                <Link
                  key={key}
                  href={`/ajustes/configuracion${href}`}
                  className={`flex flex-col items-center justify-center gap-4 px-6 py-12 transition hover:bg-zinc-50 sm:py-14 ${
                    activeArea === key ? "bg-zinc-50" : ""
                  }`}
                >
                  <Icon className="h-14 w-14 sm:h-16 sm:w-16" />
                  <span className="text-base font-medium text-zinc-900 sm:text-lg">
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
