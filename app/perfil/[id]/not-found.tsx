import Link from "next/link";
import { SiteHeader } from "@/app/components/site-header";

export default function PerfilNotFound() {
  return (
    <div className="min-h-screen bg-[#FFFFFF] text-zinc-900">
      <SiteHeader />
      <main className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-zinc-900">Perfil no encontrado</h1>
        <p className="mt-3 text-base text-zinc-600">
          Este usuario no existe o todavía no completó su perfil en Colex.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-[#822020] px-6 text-sm font-semibold text-white transition hover:bg-[#6d1b1b]"
        >
          Volver al inicio
        </Link>
      </main>
    </div>
  );
}
