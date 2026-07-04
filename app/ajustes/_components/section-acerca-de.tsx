import Link from "next/link";
import { ColexAboutContent } from "@/src/components/colex/colex-about-content";

export function SectionAcercaDe() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">Acerca de Colex</h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 sm:text-base">
          Conocé la plataforma, cómo funciona y por qué existe Colex para la comunidad escolar.
        </p>
      </div>
      <ColexAboutContent variant="settings" />
      <p className="text-sm text-zinc-500">
        ¿Tenés dudas? Visitá el{" "}
        <Link href="/ajustes?tab=ayuda" className="font-medium text-[#822020] hover:underline">
          centro de ayuda
        </Link>{" "}
        o{" "}
        <Link href="/ajustes?tab=soporte" className="font-medium text-[#822020] hover:underline">
          contactá soporte
        </Link>
        .
      </p>
    </div>
  );
}
