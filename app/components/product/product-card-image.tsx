type ProductCardImageProps = {
  src?: string | null;
  compact?: boolean;
  /** Vendedor premium/destacado: muestra etiqueta "Destacado" */
  featured?: boolean;
};

/** Contenedor 1:1 para grillas; la imagen no puede alterar el alto de la card. */
export function ProductCardImage({ src, compact = false, featured = false }: ProductCardImageProps) {
  return (
    <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-zinc-100">
      {featured ? (
        <span className="absolute left-2 top-2 z-10 rounded-full bg-[#822020] px-2 py-0.5 text-[10px] font-semibold leading-none text-white shadow-sm sm:text-[11px]">
          Destacado
        </span>
      ) : null}
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-[#822020]/[0.06] to-zinc-100 px-2 text-center text-[#822020]/35">
          <svg
            viewBox="0 0 24 24"
            className={`shrink-0 ${compact ? "h-9 w-9 sm:h-11 sm:w-11" : "h-12 w-12 sm:h-14 sm:w-14"}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            aria-hidden
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-3.086-3.086a2 2 0 00-2.828 0L6 21" />
          </svg>
          <span className={`text-zinc-400 ${compact ? "text-[11px] sm:text-xs" : "text-xs sm:text-sm"}`}>
            Sin imagen
          </span>
        </div>
      )}
    </div>
  );
}
