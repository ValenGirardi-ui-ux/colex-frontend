"use client";

import { BUYER_DELIVERY_OPTIONS, CORDOBA_SHIPPING_DISCLAIMER } from "@/src/lib/checkout";
import {
  CORDOBA_LOCALITIES,
  MAX_CORDOBA_SHIPPING_KM,
  SHIPPING_FEE_CORDOBA_CAPITAL,
  SHIPPING_FEE_WITHIN_100_KM,
} from "@/src/lib/cordoba-shipping";
import { formatArsPrice } from "@/src/lib/money";
import type { BuyerDeliveryChoice } from "@/src/types/order";

function ShippingBenefitHighlight() {
  return (
    <div
      className="flex gap-3 rounded-lg border border-[#822020]/15 bg-white/90 px-3 py-2.5 sm:gap-3.5 sm:px-3.5 sm:py-3"
      role="note"
      aria-label="Beneficio de envío a domicilio"
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#822020]/10 text-[#822020] sm:h-10 sm:w-10"
        aria-hidden
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-[1.35rem] sm:w-[1.35rem]" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3l7.5 3v5c0 4.2-3.2 7.9-7.5 9-4.3-1.1-7.5-4.8-7.5-9V6L12 3z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
        </svg>
      </div>
      <div className="min-w-0 pt-0.5">
        <p className="text-sm font-semibold text-zinc-900">Comprá más seguro</p>
        <p className="mt-0.5 text-xs leading-relaxed text-zinc-600 sm:text-sm">
          Colex coordina el envío para que recibas tu compra sin moverte y sin juntarte con desconocidos.
        </p>
      </div>
    </div>
  );
}

type BuyerDeliverySelectorProps = {
  value: BuyerDeliveryChoice | "";
  onChange: (value: BuyerDeliveryChoice) => void;
  buyerLocalityId: string;
  onLocalityChange: (localityId: string) => void;
  shippingFee: number;
  shippingError: string | null;
  distanceKm: number | null;
  productPrice: number;
  orderTotal: number;
  name?: string;
};

export function BuyerDeliverySelector({
  value,
  onChange,
  buyerLocalityId,
  onLocalityChange,
  shippingFee,
  shippingError,
  distanceKm,
  productPrice,
  orderTotal,
  name = "buyer-delivery",
}: BuyerDeliverySelectorProps) {
  const isHome = value === "envio_domicilio";
  const hasLocality = buyerLocalityId.length > 0;
  const showTotals = isHome && hasLocality && !shippingError;

  return (
    <fieldset className="space-y-3">
      <legend className="mb-2 text-sm font-medium text-zinc-800 sm:text-base">Método de entrega</legend>
      <div className="space-y-2">
        {BUYER_DELIVERY_OPTIONS.map(({ value: optionValue, label, sub }) => {
          const checked = value === optionValue;
          const isHomeOption = optionValue === "envio_domicilio";
          const optionShellClass = `rounded-xl border transition-colors ${
            checked
              ? "border-[#822020] bg-[#822020]/[0.08]"
              : "border-zinc-200 bg-zinc-50/50 hover:border-zinc-300"
          }`;

          if (isHomeOption) {
            return (
              <div key={optionValue} className={optionShellClass}>
                <label className="flex cursor-pointer items-start gap-3 px-4 py-3 sm:items-center">
                  <input
                    type="radio"
                    name={name}
                    value={optionValue}
                    checked={checked}
                    onChange={() => onChange(optionValue)}
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#822020] focus:ring-[#822020]/30 sm:mt-0"
                  />
                  <span className="min-w-0">
                    <span
                      className={`block text-sm font-medium sm:text-base ${
                        checked ? "text-[#822020]" : "text-zinc-900"
                      }`}
                    >
                      {label}
                    </span>
                    <span className="text-sm leading-snug text-zinc-500 sm:text-base">{sub}</span>
                  </span>
                </label>
                <div className="px-4 pb-3 pt-0">
                  <ShippingBenefitHighlight />
                </div>
              </div>
            );
          }

          return (
            <label
              key={optionValue}
              className={`flex cursor-pointer items-start gap-3 px-4 py-3 sm:items-center ${optionShellClass}`}
            >
              <input
                type="radio"
                name={name}
                value={optionValue}
                checked={checked}
                onChange={() => onChange(optionValue)}
                className="mt-0.5 h-4 w-4 shrink-0 text-[#822020] focus:ring-[#822020]/30 sm:mt-0"
              />
              <span className="min-w-0">
                <span
                  className={`block text-sm font-medium sm:text-base ${
                    checked ? "text-[#822020]" : "text-zinc-900"
                  }`}
                >
                  {label}
                </span>
                <span className="text-sm leading-snug text-zinc-500 sm:text-base">{sub}</span>
              </span>
            </label>
          );
        })}
      </div>

      {isHome ? (
        <div className="space-y-3 rounded-xl border border-[#822020]/20 bg-[#822020]/[0.04] p-4">
          <p className="text-xs font-medium leading-relaxed text-zinc-700 sm:text-sm">
            {CORDOBA_SHIPPING_DISCLAIMER}
          </p>
          <ul className="list-inside list-disc space-y-0.5 text-xs text-zinc-600 sm:text-sm">
            <li>Córdoba Capital: {formatArsPrice(SHIPPING_FEE_CORDOBA_CAPITAL)}</li>
            <li>
              Otra localidad en Córdoba (hasta {MAX_CORDOBA_SHIPPING_KM} km de Capital):{" "}
              {formatArsPrice(SHIPPING_FEE_WITHIN_100_KM)}
            </li>
            <li>Más de {MAX_CORDOBA_SHIPPING_KM} km desde Capital: envío no disponible</li>
          </ul>
          <div className="space-y-1.5">
            <label htmlFor="buyer-locality" className="block text-sm font-medium text-zinc-800">
              Tu localidad (Córdoba)
            </label>
            <select
              id="buyer-locality"
              value={buyerLocalityId}
              onChange={(e) => onLocalityChange(e.target.value)}
              className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-[#822020] focus:ring-2 focus:ring-[#822020]/15"
            >
              <option value="">Seleccioná una localidad</option>
              {CORDOBA_LOCALITIES.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.label}
                </option>
              ))}
            </select>
          </div>

          {showTotals ? (
            <div
              className="rounded-lg border border-zinc-200/90 bg-white p-3 text-sm"
              aria-live="polite"
            >
              <p className="flex justify-between gap-2 text-zinc-700">
                <span>Subtotal producto</span>
                <span className="font-medium">{formatArsPrice(productPrice)}</span>
              </p>
              <p className="mt-1 flex justify-between gap-2 text-[#822020]">
                <span>
                  Costo de envío
                  {distanceKm != null ? ` (${distanceKm} km desde Capital)` : ""}
                </span>
                <span className="font-semibold">+ {formatArsPrice(shippingFee)}</span>
              </p>
              <p className="mt-2 flex justify-between gap-2 border-t border-zinc-200 pt-2 text-base font-semibold text-zinc-900">
                <span>Total</span>
                <span>{formatArsPrice(orderTotal)}</span>
              </p>
            </div>
          ) : null}

          {shippingError ? (
            <p role="alert" className="rounded-lg border border-[#822020]/20 bg-white px-3 py-2.5 text-sm text-[#822020]">
              {shippingError}
            </p>
          ) : null}

          {isHome && !hasLocality && !shippingError ? (
            <p className="text-xs text-zinc-500 sm:text-sm">
              Elegí tu localidad para ver el costo de envío y el total antes de continuar.
            </p>
          ) : null}
        </div>
      ) : null}
    </fieldset>
  );
}
