import type { MainFilterId } from "@/src/data/product-filters";

export type HomeCategoryStripItem = {
  id: string;
  label: string;
  hint: string;
  cat: MainFilterId;
  sub?: string;
};

/** Categorías rápidas en home (strip + rails por categoría). */
export const HOME_CATEGORY_STRIP: HomeCategoryStripItem[] = [
  { id: "uniformes", label: "Uniformes", hint: "Gorro, camisas", cat: "uniformes" },
  { id: "guardapolvos", label: "Guardapolvos", hint: "Blanco, azul", cat: "uniformes", sub: "guardapolvos" },
  { id: "libros", label: "Libros", hint: "Materia y curso", cat: "libros" },
  { id: "utiles", label: "Útiles", hint: "Lápices, cuadernos", cat: "utiles" },
  { id: "mochilas", label: "Mochilas", hint: "Tamaños varios", cat: "mochilas" },
  { id: "arte", label: "Arte", hint: "Pintura, dibujo", cat: "arte" },
  { id: "tecnologia", label: "Tecnología", hint: "Tablets, más", cat: "tecnologia" },
  { id: "otros", label: "Otros", hint: "Accesorios", cat: "otros" },
];
