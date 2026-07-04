import Link from "next/link";
import { SiteHeader } from "@/app/components/site-header";
import { processMercadoPagoPaymentById } from "@/src/services/mercadopago-payment-process";

type PageProps = {
  searchParams: Promise<{
    status?: string;
    orderId?: string;
    productId?: string;
    conv?: string;
    registered?: string;
    payment_id?: string;
    external_reference?: string;
  }>;
};

function titleForStatus(status: string, registered: boolean): string {
  switch (status) {
    case "success":
      return registered ? "¡Compra confirmada!" : "Pago en proceso";
    case "pending":
      return "Pago pendiente";
    case "failure":
      return "Pago no completado";
    default:
      return "Resultado del pago";
  }
}

function messageForStatus(status: string, registered: boolean): string {
  switch (status) {
    case "success":
      return registered
        ? "Tu pago fue acreditado y registramos la compra. Ya podés coordinar la entrega con el vendedor en Ventas."
        : "Si Mercado Pago aprobó tu pago, en unos segundos actualizaremos tu compra. No hace falta pagar de nuevo.";
    case "pending":
      return "Tu pago quedó pendiente de acreditación. Cuando Mercado Pago lo confirme, te avisamos y habilitamos el chat de venta.";
    case "failure":
      return "El pago no se completó. Podés volver al checkout e intentar de nuevo con otro medio de pago.";
    default:
      return "Revisá el estado de tu compra en Mensajes → Ventas.";
  }
}

export default async function ComprarPagoResultadoPage({ searchParams }: PageProps) {
  const params = await searchParams;
  let status = (params.status ?? "").trim().toLowerCase() || "unknown";
  let orderId = params.orderId?.trim() ?? params.external_reference?.trim() ?? null;
  let conversationId = params.conv?.trim() ?? null;
  let registered = params.registered === "1";

  const paymentId = params.payment_id?.trim();
  if (!registered && paymentId) {
    const result = await processMercadoPagoPaymentById(paymentId);
    if (result.returnStatus !== "unknown") {
      status = result.returnStatus;
    }
    orderId = result.orderId ?? orderId;
    conversationId = result.conversationId ?? conversationId;
    registered = status === "success" && (result.alreadyPaid || !result.error);
  }

  const title = titleForStatus(status, registered);
  const message = messageForStatus(status, registered);
  const isFailure = status === "failure";
  const productId = params.productId?.trim() ?? null;
  const ventasHref = conversationId
    ? `/mensajes?conv=${encodeURIComponent(conversationId)}&tab=ventas`
    : "/mensajes?tab=ventas";

  return (
    <div className="min-h-screen bg-[#F6F6F6] text-zinc-900">
      <SiteHeader />
      <main className="colex-page mx-auto max-w-lg py-10">
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#822020]">Colex · Checkout</p>
          <h1 className="mt-2 text-xl font-bold text-zinc-900 sm:text-2xl">{title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">{message}</p>

          {orderId && registered ? (
            <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
              Compra registrada correctamente.
            </p>
          ) : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={ventasHref}
              className="flex h-11 items-center justify-center rounded-full bg-[#822020] px-6 text-sm font-semibold text-white transition hover:bg-[#6d1b1b]"
            >
              {conversationId ? "Abrir chat de venta" : "Ir a Ventas"}
            </Link>
            {isFailure && productId ? (
              <Link
                href={`/comprar/${encodeURIComponent(productId)}`}
                className="flex h-11 items-center justify-center rounded-full border border-[#822020]/30 px-6 text-sm font-semibold text-[#822020] transition hover:bg-[#822020]/[0.05]"
              >
                Reintentar pago
              </Link>
            ) : null}
            {isFailure ? (
              <Link
                href="/"
                className="flex h-11 items-center justify-center rounded-full border border-zinc-200 px-6 text-sm font-semibold text-zinc-700 transition hover:border-[#822020]/30"
              >
                Volver al inicio
              </Link>
            ) : (
              <Link
                href="/perfil?tab=publicaciones"
                className="flex h-11 items-center justify-center rounded-full border border-zinc-200 px-6 text-sm font-semibold text-zinc-700 transition hover:border-[#822020]/30"
              >
                Mis compras
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
