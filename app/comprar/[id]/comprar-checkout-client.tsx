"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { BuyerDeliverySelector } from "@/app/components/checkout/buyer-delivery-selector";
import { CheckoutMercadoPagoSection } from "@/app/components/checkout/checkout-mercadopago-section";
import { CheckoutTotalsSummary } from "@/app/components/checkout/checkout-totals-summary";
import { SiteHeader } from "@/app/components/site-header";
import { computeCheckoutTotals, resolveBuyerDeliveryChoice } from "@/src/lib/checkout";
import { getDeliveryMethodDisplay } from "@/src/lib/delivery-method";
import { formatArsPrice } from "@/src/lib/money";
import { formatProductCondition } from "@/src/lib/product-condition";
import { supabase } from "@/src/lib/supabase/client";
import { getOrCreateOrderForCheckout } from "@/src/services/orders";
import type { BuyerDeliveryChoice } from "@/src/types/order";
import type { Product } from "@/src/types/product";

type ComprarCheckoutClientProps = {
  product: Product;
};

export function ComprarCheckoutClient({ product }: ComprarCheckoutClientProps) {
  const router = useRouter();
  const [buyerDelivery, setBuyerDelivery] = useState<BuyerDeliveryChoice | "">("coordinar_vendedor");
  const [buyerLocalityId, setBuyerLocalityId] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const resolvedDelivery = resolveBuyerDeliveryChoice(buyerDelivery);
  const totals = useMemo(
    () =>
      computeCheckoutTotals({
        productPrice: product.price,
        buyerDelivery: resolvedDelivery,
        sellerLocation: product.location,
        buyerLocalityId: buyerLocalityId || null,
      }),
    [product.price, product.location, resolvedDelivery, buyerLocalityId],
  );

  const sellerDelivery = getDeliveryMethodDisplay(product.delivery_method);
  const primaryImage = product.images?.[0];
  const shippingPending =
    resolvedDelivery === "envio_domicilio" && !buyerLocalityId && !totals.shippingError;
  const canPay = !shippingPending && !totals.shippingError;

  async function handlePayAndContinue(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);

    if (resolvedDelivery === "envio_domicilio") {
      if (!buyerLocalityId) {
        setSubmitError("Seleccioná tu localidad en Córdoba para continuar con envío a domicilio.");
        return;
      }
      if (totals.shippingError) {
        setSubmitError(totals.shippingError);
        return;
      }
    }

    setSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        router.push(`/login?next=${encodeURIComponent(`/comprar/${encodeURIComponent(product.id)}`)}`);
        return;
      }

      const { order, error: orderError } = await getOrCreateOrderForCheckout({
        buyerId: session.user.id,
        product,
        buyerDelivery: resolvedDelivery,
        shippingFee: totals.shippingFee,
        totalAmount: totals.total,
        buyerLocationLabel: totals.buyerLocationLabel,
        shippingDistanceKm: totals.distanceKm,
        phase: "start",
      });

      if (orderError && !order) {
        setSubmitError(orderError);
        return;
      }
      if (!order?.id || order.id.startsWith("local-")) {
        setSubmitError(
          orderError ?? "No se pudo registrar la orden. Revisá la conexión con Supabase.",
        );
        return;
      }

      const prefRes = await fetch("/api/mercadopago/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });

      const prefData = (await prefRes.json()) as { initPoint?: string; error?: string };

      if (!prefRes.ok || !prefData.initPoint) {
        const msg = prefData.error ?? "No se pudo iniciar el pago con Mercado Pago.";
        if (prefRes.status === 503) {
          setSubmitError(
            `${msg} Configurá MERCADOPAGO_ACCESS_TOKEN y SUPABASE_SERVICE_ROLE_KEY en el servidor.`,
          );
        } else {
          setSubmitError(msg);
        }
        return;
      }

      window.location.href = prefData.initPoint;
    } catch {
      setSubmitError("No se pudo conectar con el servidor de pagos. Intentá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F6F6] text-zinc-900">
      <SiteHeader />
      <main className="colex-page min-w-0">
        <div className="mb-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-zinc-500">
          <Link href="/" className="transition hover:text-[#822020]">
            Inicio
          </Link>
          <span>/</span>
          <Link href={`/producto/${encodeURIComponent(product.id)}`} className="transition hover:text-[#822020]">
            Producto
          </Link>
          <span>/</span>
          <span className="text-zinc-700">Checkout</span>
        </div>

        <form
          onSubmit={(e) => void handlePayAndContinue(e)}
          className="grid min-w-0 gap-6 rounded-2xl border border-zinc-200/90 bg-white p-4 sm:rounded-3xl sm:p-6 lg:grid-cols-[1fr_400px] lg:gap-8"
          noValidate
        >
          <div className="min-w-0 space-y-6">
            <div>
              <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">Finalizá tu compra</h1>
              <p className="mt-1 text-sm text-zinc-600">
                Elegí entrega y pagá con Mercado Pago. La compra se confirma cuando el pago es aprobado.
              </p>
            </div>

            <div className="flex gap-4 lg:hidden">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                {primaryImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={primaryImage} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">Sin foto</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-semibold text-zinc-900">{product.title}</p>
                <p className="mt-1 text-lg font-bold text-zinc-900">{formatArsPrice(product.price)}</p>
              </div>
            </div>

            <BuyerDeliverySelector
              value={buyerDelivery || resolvedDelivery}
              onChange={(v) => {
                setBuyerDelivery(v);
                setSubmitError(null);
              }}
              buyerLocalityId={buyerLocalityId}
              onLocalityChange={(id) => {
                setBuyerLocalityId(id);
                setSubmitError(null);
              }}
              shippingFee={totals.shippingFee}
              shippingError={totals.shippingError}
              distanceKm={totals.distanceKm}
              productPrice={totals.subtotal}
              orderTotal={totals.total}
            />

            <CheckoutMercadoPagoSection disabled={!canPay || submitting} />
          </div>

          <aside className="h-fit space-y-4 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-zinc-200/90 bg-zinc-50/70 p-4 sm:p-5">
              <h2 className="text-lg font-semibold text-zinc-900">Resumen de compra</h2>

              <div className="mt-4 hidden overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 lg:block">
                {primaryImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={primaryImage} alt="" className="aspect-[4/3] w-full object-cover" />
                ) : (
                  <div className="flex aspect-[4/3] w-full items-center justify-center text-sm text-zinc-400">
                    Sin imagen
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-2 text-sm text-zinc-700">
                <p className="flex items-start justify-between gap-3">
                  <span className="shrink-0 text-zinc-500">Producto</span>
                  <span className="line-clamp-3 text-right font-medium text-zinc-900">{product.title}</span>
                </p>
                <p className="hidden text-xs text-zinc-500 sm:block">
                  {formatProductCondition(product)}
                  {product.institution ? ` · ${product.institution}` : ""}
                </p>
                <p className="flex justify-between gap-3">
                  <span className="text-zinc-500">Entrega vendedor</span>
                  <span className="text-right font-medium text-zinc-800">{sellerDelivery.label}</span>
                </p>
              </div>

              <CheckoutTotalsSummary
                subtotal={totals.subtotal}
                shippingFee={totals.shippingFee}
                total={totals.total}
                showShippingLine={resolvedDelivery === "envio_domicilio"}
                shippingPending={shippingPending}
              />

              {resolvedDelivery === "envio_domicilio" && totals.shippingFee > 0 && !shippingPending ? (
                <p className="text-xs text-zinc-500">
                  Envío a domicilio
                  {totals.distanceKm != null ? ` · ${totals.distanceKm} km desde Córdoba Capital` : ""}.
                </p>
              ) : null}

              {submitError ? (
                <p role="alert" className="rounded-xl border border-[#822020]/25 bg-[#822020]/10 px-3 py-2 text-sm text-[#6d1b1b]">
                  {submitError}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting || !canPay}
                className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-[#822020] text-sm font-semibold text-white transition hover:bg-[#6d1b1b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Preparando pago…" : `Pagar con Mercado Pago · ${formatArsPrice(totals.total)}`}
              </button>

              <p className="text-center text-[11px] text-zinc-400">
                Se crea una orden pendiente y te redirigimos a Mercado Pago. El chat de venta se abre al confirmar el pago.
              </p>
            </div>

            <Link
              href={`/producto/${encodeURIComponent(product.id)}`}
              className="flex h-11 w-full items-center justify-center rounded-full border border-[#822020]/30 bg-white text-sm font-semibold text-[#822020] transition hover:bg-[#822020]/[0.05]"
            >
              Volver al producto
            </Link>
          </aside>
        </form>
      </main>
    </div>
  );
}
