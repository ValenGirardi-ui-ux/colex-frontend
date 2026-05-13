import Link from "next/link";
import { SiteHeader } from "@/app/components/site-header";

export default function ProductoNotFound() {
  return (
    <div className="min-h-screen bg-[#F6F6F6] text-zinc-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-lg px-4 py-16 text-center lg:px-6">
        <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">Producto no encontrado</h1>
        <p className="mt-2 text-sm text-zinc-600 sm:text-base">
          Puede haberse vendido o el enlace no es válido.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-[#822020] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#6d1b1b] sm:text-base"
        >
          Volver al inicio
        </Link>
        <p className="mt-4">
          <Link href="/favoritos" className="text-sm font-medium text-[#822020] hover:underline">
            Ir a favoritos
          </Link>
        </p>
      </main>
    </div>
  );
}
