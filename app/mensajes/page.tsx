import { Suspense } from "react";
import { SiteHeader } from "../components/site-header";
import { MensajesInbox } from "./mensajes-inbox";

export default function MensajesPage() {
  return (
    <div className="colex-messages-shell text-zinc-900">
      <div className="shrink-0">
        <SiteHeader />
      </div>
      <main className="colex-messages-main">
        <div className="hidden shrink-0 border-b border-zinc-200/90 bg-white px-4 py-3 lg:block lg:px-6">
          <h1 className="text-xl font-bold text-[#822020]">Mensajes</h1>
          <p className="mt-0.5 text-sm text-zinc-600">
            Chat para consultas previas a comprar; Ventas para compras confirmadas.
          </p>
        </div>
        <Suspense
          fallback={
            <div
              className="flex flex-1 items-center justify-center px-4 text-center text-sm text-zinc-500"
              role="status"
            >
              Cargando conversaciones…
            </div>
          }
        >
          <MensajesInbox />
        </Suspense>
      </main>
    </div>
  );
}
