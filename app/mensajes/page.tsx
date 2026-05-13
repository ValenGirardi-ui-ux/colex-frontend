import { Suspense } from "react";
import { SiteHeader } from "../components/site-header";
import { MensajesInbox } from "./mensajes-inbox";

export default function MensajesPage() {
  return (
    <div className="min-h-screen bg-[#F6F6F6] text-zinc-900">
      <SiteHeader />
      <main className="flex min-h-0 flex-1 flex-col">
        <div className="border-b border-zinc-200/90 bg-white px-4 py-4 lg:px-6">
          <h1 className="text-2xl font-bold text-[#822020] sm:text-3xl">Mensajes</h1>
          <p className="mt-1 text-sm text-zinc-600 sm:text-base">Chats con vendedores y compradores de Colex.</p>
        </div>
        <Suspense
          fallback={
            <div className="px-4 py-12 text-center text-sm text-zinc-500" role="status">
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
