import Link from "next/link";
import { SiteHeader } from "@/app/components/site-header";

type PageProps = {
  searchParams: Promise<{ status?: string; external_reference?: string }>;
};

function titleForStatus(status: string): string {
  switch (status) {
    case "success":
      return "Pago en proceso";
    case "pending":
      return "Pago pendiente";
    case "failure":
      return "Pago no completado";
    default:
      return "Resultado del pago";
  }
}

function messageForStatus(status: string): string {
  switch (status) {
    case "success":
      return "Si Mercado Pago aprobó tu pago, en unos segundos actualizaremos tu compra y vas a poder coordinar la entrega en Ventas. No hace falta pagar de nuevo.";
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
  const status = (params.status ?? "").trim().toLowerCase() || "unknown";
  const title = titleForStatus(status);
  const message = messageForStatus(status);
  const isFailure = status === "failure";

  return (
    <div className="min-h-screen bg-[#F6F6F6] text-zinc-900">
      <SiteHeader />
      <main className="colex-page mx-auto max-w-lg py-10">
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#822020]">Colex · Checkout</p>
          <h1 className="mt-2 text-xl font-bold text-zinc-900 sm:text-2xl">{title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">{message}</p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/mensajes?tab=ventas"
              className="flex h-11 items-center justify-center rounded-full bg-[#822020] px-6 text-sm font-semibold text-white transition hover:bg-[#6d1b1b]"
            >
              Ir a Ventas
            </Link>
            {isFailure ? (
              <Link
                href="/"
                className="flex h-11 items-center justify-center rounded-full border border-zinc-200 px-6 text-sm font-semibold text-zinc-700 transition hover:border-[#822020]/30"
              >
                Volver al inicio
              </Link>
            ) : (
              <Link
                href="/perfil"
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
