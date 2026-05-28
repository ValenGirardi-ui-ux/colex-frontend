import { redirect } from "next/navigation";
import { buildCatalogSearchParams } from "@/src/lib/product-filters";
import type { MainFilterId } from "@/src/data/product-filters";

type PageProps = {
  params: Promise<{ categoria: string }>;
};

const LEGACY_SLUG_MAP: Record<string, { main: MainFilterId; sub?: string }> = {
  arte: { main: "arte" },
  ropa: { main: "uniformes", sub: "indumentaria" },
  uniformes: { main: "uniformes" },
  accesorios: { main: "otros", sub: "accesorios" },
  tecnologia: { main: "tecnologia" },
  deporte: { main: "otros" },
  libro: { main: "libros" },
  libros: { main: "libros" },
  utiles: { main: "utiles" },
  mochilas: { main: "mochilas" },
  guardapolvos: { main: "uniformes", sub: "guardapolvos" },
  calzado: { main: "uniformes", sub: "calzado" },
  otros: { main: "otros" },
};

export default async function CategoriaPage({ params }: PageProps) {
  const { categoria } = await params;
  const slug = categoria.trim().toLowerCase();
  const mapped = LEGACY_SLUG_MAP[slug] ?? { main: "todo" as const };
  const sp = buildCatalogSearchParams({
    main: mapped.main,
    sub: mapped.sub ?? "todo",
    query: "",
  });
  redirect(sp.toString() ? `/buscar?${sp.toString()}` : "/buscar");
}
