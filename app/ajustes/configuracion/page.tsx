import { redirect } from "next/navigation";
import { parseAjustesSection, type AjustesSection } from "../_components/ajustes-screen";

type PageProps = {
  searchParams: Promise<{ area?: string }>;
};

/** Rutas legacy `/ajustes/configuracion` → pantalla única `/ajustes`. */
function legacyAreaToTab(area?: string): AjustesSection {
  const a = area?.trim().toLowerCase();
  if (a === "cuenta") return "cuenta";
  if (a === "vender" || a === "comprar" || a === "inicio") return "ayuda";
  return parseAjustesSection(undefined);
}

export default async function ConfiguracionLegacyRedirect({ searchParams }: PageProps) {
  const { area } = await searchParams;
  const tab = legacyAreaToTab(area);
  redirect(tab === "perfil" ? "/ajustes" : `/ajustes?tab=${tab}`);
}
