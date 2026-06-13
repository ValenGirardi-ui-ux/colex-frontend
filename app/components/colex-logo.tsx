import Link from "next/link";

type ColexLogoProps = {
  className?: string;
  heightClass?: string;
  /** Fondo del logo: debe coincidir con la sección donde se muestra. */
  surfaceClassName?: string;
};

/** Logo script de Colex (header, footer). */
export function ColexLogo({
  className = "",
  heightClass = "h-11 lg:h-14",
  surfaceClassName = "bg-white",
}: ColexLogoProps) {
  return (
    <Link
      href="/"
      className={`inline-flex shrink-0 items-center -ml-1.5 sm:-ml-2 ${surfaceClassName} ${className}`}
      aria-label="Colex"
    >
      <img
        src="/images/brand/colex-logo.png"
        alt=""
        width={1024}
        height={577}
        className={`${heightClass} w-auto object-contain object-left ${surfaceClassName}`}
      />
    </Link>
  );
}
