import type { ReactNode } from "react";
import { isProfileVerified, type ProfileVerifiedFields } from "@/src/lib/profile-verified";

/**
 * Único badge visual de cuenta premium/verificada en Colex.
 * Usar VerifiedBadge o VerifiedName — no crear íconos ni badges alternativos.
 * Visible cuando profiles.is_premium o profiles.is_featured es true.
 */
export { isProfileVerified, type ProfileVerifiedFields };

/** Label accesible del Badge verificado */
export const VERIFIED_BADGE_LABEL = "Verificado";

type VerifiedBadgeProps = {
  verified?: boolean;
  /** Tamaño del Badge verificado (VerifiedBadge) */
  size?: "sm" | "md";
  className?: string;
  /** Texto para title y aria-label; por defecto "Verificado" */
  label?: string;
};

const sizeClasses = {
  sm: "h-[1.125rem] w-[1.125rem] [&_svg]:h-2.5 [&_svg]:w-2.5",
  md: "h-5 w-5 [&_svg]:h-3 [&_svg]:w-3",
} as const;

/** Badge verificado: círculo Colex + tilde (check) blanco, sin íconos extra. */
export function VerifiedBadge({
  verified = false,
  size = "sm",
  className = "",
  label = VERIFIED_BADGE_LABEL,
}: VerifiedBadgeProps) {
  if (!verified) return null;

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-[#822020]/20 bg-[#822020] text-white ${sizeClasses[size]} ${className}`.trim()}
      title={label}
      aria-label={label}
    >
      <svg viewBox="0 0 12 12" fill="none" aria-hidden>
        <path
          d="M9.2 3.8 5.1 8.9 2.8 6.6"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

type VerifiedNameProps = {
  verified?: boolean;
  children: ReactNode;
  className?: string;
  nameClassName?: string;
  badgeSize?: "sm" | "md";
  badgeLabel?: string;
};

/** Nombre + Badge verificado (VerifiedBadge) alineados. */
export function VerifiedName({
  verified = false,
  children,
  className = "",
  nameClassName = "",
  badgeSize = "sm",
  badgeLabel = VERIFIED_BADGE_LABEL,
}: VerifiedNameProps) {
  return (
    <span className={`inline-flex max-w-full min-w-0 items-center gap-1.5 ${className}`.trim()}>
      <span className={`min-w-0 truncate ${nameClassName}`.trim()}>{children}</span>
      <VerifiedBadge verified={verified} size={badgeSize} label={badgeLabel} />
    </span>
  );
}
