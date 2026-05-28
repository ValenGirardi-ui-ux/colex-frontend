import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminAccessDebugPanel } from "@/app/admin/admin-access-debug";
import { getAdminEnvRuntimeDebug } from "@/src/lib/admin-env-runtime";
import { ADMIN_GUARD_DEBUG_MODE, evaluateAdminAccess } from "@/src/lib/admin-guard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Admin · Colex",
  robots: { index: false, follow: false },
};

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const access = await evaluateAdminAccess();
  const runtimeDebug = getAdminEnvRuntimeDebug();

  if (!access.allowed) {
    if (ADMIN_GUARD_DEBUG_MODE) {
      return <AdminAccessDebugPanel debug={access.debug} runtime={runtimeDebug} />;
    }
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#F6F6F6] text-zinc-900">
      <header className="border-b border-zinc-200/90 bg-white">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#822020]">Colex</p>
            <h1 className="text-lg font-bold text-zinc-900 sm:text-xl">Panel de administración</h1>
          </div>
          <Link
            href="/"
            className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-[#822020]/30 hover:text-[#822020]"
          >
            Volver al sitio
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-[1240px] px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
