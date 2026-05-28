"use client";

import Link from "next/link";

const COPY = {
  informacion: {
    title: "Agregá una dirección para poder comprar con envío a domicilio.",
    sub: "Sin una dirección cargada, no vas a poder usar la opción de envío en tus compras.",
  },
  direcciones: {
    title: "Agregá una dirección real para poder comprar con envío a domicilio.",
    sub: "Esta información solo la ve Colex y es necesaria para coordinar los envíos de forma correcta y segura.",
  },
} as const;

export type AddressMissingAlertVariant = keyof typeof COPY;

type AddressMissingAlertProps = {
  variant: AddressMissingAlertVariant;
  /** En Ajustes → Direcciones: abre el formulario y hace scroll. */
  onAddAddress?: () => void;
  className?: string;
};

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v4m0 4h.01M10.29 3.86l-8.4 14.52A2 2 0 003.52 21h16.96a2 2 0 001.63-2.62l-8.4-14.52a2 2 0 00-3.42 0z"
      />
    </svg>
  );
}

export function AddressMissingAlert({ variant, onAddAddress, className = "" }: AddressMissingAlertProps) {
  const { title, sub } = COPY[variant];
  const btnClass =
    "inline-flex shrink-0 items-center justify-center rounded-full bg-[#822020] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#6d1b1b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#822020] sm:py-2.5";

  return (
    <div
      role="status"
      className={`flex flex-col gap-3 rounded-xl border border-[#822020]/20 bg-[#822020]/[0.06] px-4 py-3.5 sm:flex-row sm:items-start sm:gap-4 sm:px-5 sm:py-4 ${className}`}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#822020]/10 text-[#822020] sm:mt-0.5"
        aria-hidden
      >
        <InfoIcon />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sm font-semibold leading-snug text-zinc-900 sm:text-base">{title}</p>
        <p className="text-xs leading-relaxed text-zinc-600 sm:text-sm">{sub}</p>
      </div>
      {onAddAddress ? (
        <button type="button" onClick={onAddAddress} className={`${btnClass} w-full sm:w-auto`}>
          Agregar dirección
        </button>
      ) : (
        <Link href="/ajustes?tab=direcciones#colex-direcciones" className={`${btnClass} w-full sm:w-auto`}>
          Agregar dirección
        </Link>
      )}
    </div>
  );
}
