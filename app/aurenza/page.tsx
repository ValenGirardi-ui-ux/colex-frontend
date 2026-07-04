import { redirect } from "next/navigation";

/** Ruta legacy: antes mostraba Aurenza; ahora redirige a Acerca de Colex en Ajustes. */
export default function AurenzaLegacyRedirect() {
  redirect("/ajustes?tab=acerca");
}
