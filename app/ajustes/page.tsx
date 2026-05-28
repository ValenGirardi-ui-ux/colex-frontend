import { Suspense } from "react";
import { AjustesScreen } from "./_components/ajustes-screen";

function AjustesFallback() {
  return (
    <p className="py-12 text-center text-sm text-zinc-600" aria-busy="true">
      Cargando ajustes…
    </p>
  );
}

export default function AjustesPage() {
  return (
    <Suspense fallback={<AjustesFallback />}>
      <AjustesScreen />
    </Suspense>
  );
}
