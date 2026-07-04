"use client";

type CheckoutMercadoPagoSectionProps = {
  disabled?: boolean;
};

export function CheckoutMercadoPagoSection({ disabled = false }: CheckoutMercadoPagoSectionProps) {
  return (
    <div className="rounded-2xl border border-zinc-200/90 bg-zinc-50/50 p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 sm:text-lg">Pago con Mercado Pago</h2>
          <p className="mt-0.5 text-xs text-zinc-500 sm:text-sm">
            Al continuar vas a Mercado Pago para pagar con tarjeta, dinero en cuenta u otros medios.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-sky-800">
          Checkout Pro
        </span>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#009EE3]/10 text-sm font-bold text-[#009EE3]"
          aria-hidden
        >
          MP
        </div>
        <div className="min-w-0 text-sm text-zinc-700">
          <p className="font-medium text-zinc-900">Pago seguro en Mercado Pago</p>
          <p className="text-xs text-zinc-500">
            Al volver, confirmamos el pago y registramos tu compra en Colex.
          </p>
        </div>
      </div>

      {disabled ? (
        <p className="mt-3 text-xs text-zinc-500">Completá la entrega para habilitar el pago.</p>
      ) : null}
    </div>
  );
}
