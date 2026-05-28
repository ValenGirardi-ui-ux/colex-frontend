import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SiteHeader } from "@/app/components/site-header";
import { MOCK_CURRENT_USER_ID } from "@/src/data/mockProfiles";
import { PerfilPublicContent } from "./perfil-public-content";

type PerfilUsuarioPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

function PerfilPublicFallback() {
  return (
    <div className="min-h-screen bg-[#FFFFFF] text-zinc-900">
      <SiteHeader />
      <main className="mx-auto max-w-[1240px] px-4 py-16 text-center sm:px-6">
        <p className="text-base text-zinc-600" role="status">
          Cargando perfil…
        </p>
      </main>
    </div>
  );
}

async function PerfilPublicPageInner({
  params,
  searchParams,
}: PerfilUsuarioPageProps) {
  const { id } = await params;
  const q = await searchParams;

  if (id === MOCK_CURRENT_USER_ID) {
    redirect("/perfil");
  }

  return <PerfilPublicContent id={id} tab={q.tab} />;
}

export default function PerfilUsuarioPage(props: PerfilUsuarioPageProps) {
  return (
    <Suspense fallback={<PerfilPublicFallback />}>
      <PerfilPublicPageInner {...props} />
    </Suspense>
  );
}
