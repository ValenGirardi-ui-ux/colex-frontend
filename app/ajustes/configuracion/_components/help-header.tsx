"use client";

type HelpHeaderProps = {
  query: string;
  onQueryChange: (value: string) => void;
  totalMatches: number;
};

function SearchIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="M20 20L16.65 16.65" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function HelpHeader({ query, onQueryChange, totalMatches }: HelpHeaderProps) {
  return (
    <header className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 shadow-sm sm:p-6">
      <div className="space-y-5">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
            ¿En qué podemos ayudarte?
          </h2>
          <p className="text-sm text-zinc-600 sm:text-base">
            Encontrá respuestas sobre compras, ventas, publicaciones y tu cuenta en Colex.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="colex-help-search" className="sr-only">
            Buscar ayuda
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
              <SearchIcon />
            </span>
            <input
              id="colex-help-search"
              name="help-search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              type="text"
              inputMode="search"
              autoComplete="off"
              placeholder="Buscar por tema, problema o palabra clave..."
              className="h-12 w-full rounded-xl border border-zinc-200 bg-white py-2 pl-12 pr-4 text-sm text-zinc-900 outline-none transition focus:border-[#0A8FA1] focus:ring-2 focus:ring-[#0A8FA1]/20 sm:h-14 sm:text-base"
            />
          </div>
          <p className="text-xs text-zinc-500 sm:text-sm">
            {totalMatches} resultados disponibles para tu búsqueda y categoría.
          </p>
        </div>
      </div>
    </header>
  );
}
