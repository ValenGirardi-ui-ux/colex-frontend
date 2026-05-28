import { formatArsPrice } from "@/src/lib/money";

type CheckoutTotalsSummaryProps = {
  subtotal: number;
  shippingFee: number;
  total: number;
  showShippingLine?: boolean;
  /** Envío a domicilio elegido pero falta localidad para calcular. */
  shippingPending?: boolean;
  className?: string;
};

export function CheckoutTotalsSummary({
  subtotal,
  shippingFee,
  total,
  showShippingLine = true,
  shippingPending = false,
  className = "",
}: CheckoutTotalsSummaryProps) {
  const displayTotal = showShippingLine && !shippingPending ? total : subtotal;

  return (
    <div className={`space-y-2 border-t border-zinc-200 pt-4 text-sm text-zinc-700 ${className}`}>
      <p className="flex items-center justify-between gap-3">
        <span>Subtotal</span>
        <span className="font-medium text-zinc-900">{formatArsPrice(subtotal)}</span>
      </p>
      {showShippingLine ? (
        <p className="flex items-center justify-between gap-3">
          <span>Costo de envío</span>
          <span className="font-medium text-[#822020]">
            {shippingPending
              ? "A calcular"
              : shippingFee > 0
                ? `+ ${formatArsPrice(shippingFee)}`
                : "—"}
          </span>
        </p>
      ) : null}
      <p className="flex items-center justify-between gap-3 border-t border-zinc-200 pt-2 text-base">
        <span className="font-semibold text-zinc-900">Total</span>
        <span className="font-bold text-zinc-900">{formatArsPrice(displayTotal)}</span>
      </p>
      {showShippingLine && shippingPending ? (
        <p className="text-xs text-zinc-500">El total incluirá el envío cuando elijas tu localidad.</p>
      ) : null}
    </div>
  );
}
