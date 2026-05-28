import { Suspense } from "react";
import { SiteHeader } from "@/app/components/site-header";
import { PerfilOwnClient } from "./perfil-own-client";

function PerfilOwnFallback() {
  return (
    <div className="min-h-screen bg-[#FFFFFF] text-zinc-900">
      <SiteHeader />
      <main className="mx-auto max-w-[1240px] px-4 py-16 text-center sm:px-6">
        <p className="text-base text-zinc-600">Cargando…</p>
      </main>
    </div>
  );
}

export default function PerfilPage() {
  return (
    <Suspense fallback={<PerfilOwnFallback />}>
      <PerfilOwnClient />
    </Suspense>
  );
}
