import Link from "next/link";

const quickLinks = [
  { href: "/", label: "Inicio" },
  { href: "/perfil", label: "Cuenta" },
  { href: "/favoritos", label: "Favoritos" },
  { href: "/vender", label: "Vender" },
  { href: "/mensajes", label: "Mensajes" },
];

const helpLinks = [
  { href: "/ajustes?tab=ayuda", label: "Centro de ayuda" },
  { href: "/ajustes?tab=soporte", label: "Contactar soporte" },
  { href: "/ajustes", label: "Ajustes" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-200/80 bg-zinc-50/80">
      <div className="mx-auto hidden w-full max-w-[1240px] gap-8 px-4 py-10 sm:px-6 lg:grid lg:grid-cols-[1.25fr_1fr_1fr] lg:gap-10 lg:py-12">
        <section className="space-y-3">
          <Link
            href="/"
            className="inline-block text-3xl font-bold italic leading-none text-[#822020]"
            aria-label="Colex"
          >
            colex
          </Link>
          <p className="max-w-md text-sm leading-relaxed text-zinc-600 sm:text-base">
            Compra y venta de articulos escolares e institucionales, nuevos o usados.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#822020]">Navegacion</h2>
          <ul className="space-y-2">
            {quickLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-zinc-700 transition hover:text-[#822020]">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#822020]">Ayuda</h2>
          <ul className="space-y-2">
            {helpLinks.map((item) => (
              <li key={`${item.href}-${item.label}`}>
                <Link href={item.href} className="text-sm text-zinc-700 transition hover:text-[#822020]">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <div className="border-t border-zinc-200/80 px-4 py-3 text-center text-xs text-zinc-500 max-lg:pb-2 sm:text-sm lg:py-4">
        © 2026 Colex. Todos los derechos reservados.
      </div>
    </footer>
  );
}
