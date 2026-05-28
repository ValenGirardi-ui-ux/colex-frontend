"use client";

import {
  formatCardNumberInput,
  formatExpirationInput,
  type CardPaymentErrors,
  type CardPaymentFields,
} from "@/src/lib/card-payment-validation";

const inputClass =
  "h-11 w-full min-w-0 rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#822020] focus:ring-2 focus:ring-[#822020]/20 sm:h-12 sm:text-base";

type CheckoutCardPaymentFormProps = {
  values: CardPaymentFields;
  errors: CardPaymentErrors;
  disabled?: boolean;
  onChange: (field: keyof CardPaymentFields, value: string) => void;
};

export function CheckoutCardPaymentForm({
  values,
  errors,
  disabled = false,
  onChange,
}: CheckoutCardPaymentFormProps) {
  return (
    <div className="rounded-2xl border border-zinc-200/90 bg-zinc-50/50 p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 sm:text-lg">Pago con tarjeta</h2>
          <p className="mt-0.5 text-xs text-zinc-500 sm:text-sm">
            Simulación local — no se realizará un cargo real.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
          Mock
        </span>
      </div>

      <div className="space-y-4">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-zinc-700">Número de tarjeta</span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="cc-number"
            disabled={disabled}
            value={values.cardNumber}
            onChange={(e) => onChange("cardNumber", formatCardNumberInput(e.target.value))}
            placeholder="1234 5678 9012 3456"
            className={inputClass}
            aria-invalid={Boolean(errors.cardNumber)}
          />
          {errors.cardNumber ? (
            <span className="mt-1 block text-xs text-[#822020]" role="alert">
              {errors.cardNumber}
            </span>
          ) : null}
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-zinc-700">Nombre del titular</span>
          <input
            type="text"
            autoComplete="cc-name"
            disabled={disabled}
            value={values.holderName}
            onChange={(e) => onChange("holderName", e.target.value)}
            placeholder="Como figura en la tarjeta"
            className={inputClass}
            aria-invalid={Boolean(errors.holderName)}
          />
          {errors.holderName ? (
            <span className="mt-1 block text-xs text-[#822020]" role="alert">
              {errors.holderName}
            </span>
          ) : null}
        </label>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-700">Vencimiento</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="cc-exp"
              disabled={disabled}
              value={values.expiration}
              onChange={(e) => onChange("expiration", formatExpirationInput(e.target.value))}
              placeholder="MM/AA"
              className={inputClass}
              aria-invalid={Boolean(errors.expiration)}
            />
            {errors.expiration ? (
              <span className="mt-1 block text-xs text-[#822020]" role="alert">
                {errors.expiration}
              </span>
            ) : null}
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-700">CVV</span>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="cc-csc"
              disabled={disabled}
              value={values.cvv}
              onChange={(e) => onChange("cvv", e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="123"
              className={inputClass}
              aria-invalid={Boolean(errors.cvv)}
            />
            {errors.cvv ? (
              <span className="mt-1 block text-xs text-[#822020]" role="alert">
                {errors.cvv}
              </span>
            ) : null}
          </label>
        </div>
      </div>
    </div>
  );
}
