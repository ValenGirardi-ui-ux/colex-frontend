import Link from "next/link";
import type { ReactNode } from "react";

type HomeSectionHeaderProps = {
  id?: string;
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  size?: "default" | "compact";
};

export function HomeSectionHeader({
  id,
  title,
  subtitle,
  viewAllHref,
  viewAllLabel = "Ver más",
  size = "default",
}: HomeSectionHeaderProps) {
  const compact = size === "compact";
  const TitleTag = compact ? "h3" : "h2";

  return (
    <div className={`flex flex-wrap items-end justify-between gap-3 ${compact ? "mb-4" : "mb-5 sm:mb-6"}`}>
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          {!compact ? (
            <span className="hidden h-8 w-1 shrink-0 rounded-full bg-[#822020] sm:block" aria-hidden />
          ) : null}
          <div>
            <TitleTag
              id={id}
              className={
                compact
                  ? "text-base font-semibold text-zinc-900 sm:text-lg"
                  : "text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl"
              }
            >
              {title}
            </TitleTag>
            {subtitle ? (
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-zinc-500 sm:text-[15px]">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
      </div>
      {viewAllHref ? (
        <Link
          href={viewAllHref}
          className={
            compact
              ? "shrink-0 text-sm font-semibold text-[#822020] hover:underline"
              : "inline-flex h-10 shrink-0 items-center rounded-full border border-zinc-200 bg-white px-4 text-sm font-semibold text-[#822020] transition hover:border-[#822020]/30 hover:bg-[#822020]/[0.04]"
          }
        >
          {viewAllLabel}
        </Link>
      ) : null}
    </div>
  );
}

/** Contenedor blanco unificado para bloques del feed. */
export function HomeFeedPanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-zinc-200/90 bg-white p-4 sm:rounded-3xl sm:p-6 lg:p-7 ${className}`.trim()}
    >
      {children}
    </div>
  );
}
