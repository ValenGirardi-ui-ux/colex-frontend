/**
 * Mega menú de categorías Colex (barra principal + subcategorías en panel).
 */

export const MAIN_FILTER_IDS = [
  "todo",
  "utiles",
  "libros",
  "uniformes",
  "tecnologia",
  "mochilas",
  "arte",
  "otros",
] as const;

export type MainFilterId = (typeof MAIN_FILTER_IDS)[number];

export type MegaMenuSub = {
  id: string;
  label: string;
  /** Palabras para matchear título, descripción, categoría, tags. */
  keywords: string[];
};

export type MegaMenuCategory = {
  id: MainFilterId;
  label: string;
  subs: MegaMenuSub[];
};

export const MEGA_MENU_CATEGORIES: MegaMenuCategory[] = [
  { id: "todo", label: "Todo", subs: [] },
  {
    id: "utiles",
    label: "Útiles",
    subs: [
      { id: "cartucheras", label: "Cartucheras", keywords: ["cartuchera"] },
      { id: "lapices", label: "Lápices", keywords: ["lapiz", "lapices", "goma", "marcador"] },
      { id: "cuadernos", label: "Cuadernos", keywords: ["cuaderno", "cuadernos"] },
      { id: "carpetas", label: "Carpetas", keywords: ["carpeta", "folios"] },
      { id: "reglas", label: "Reglas", keywords: ["regla", "escuadra", "compas"] },
      { id: "calculadoras-utiles", label: "Calculadoras", keywords: ["calculadora"] },
    ],
  },
  {
    id: "libros",
    label: "Libros",
    subs: [
      { id: "primaria", label: "Primaria", keywords: ["primaria", "primario", "1er grado", "2do grado"] },
      { id: "secundaria", label: "Secundaria", keywords: ["secundaria", "secundario", "eso", "bachiller"] },
      { id: "universitarios", label: "Universitarios", keywords: ["universidad", "universitario", "facultad"] },
      { id: "literatura", label: "Literatura", keywords: ["literatura", "novela", "cuento"] },
      { id: "manuales", label: "Manuales", keywords: ["manual", "texto", "apunte"] },
    ],
  },
  {
    id: "uniformes",
    label: "Uniformes",
    subs: [
      { id: "chombas", label: "Chombas", keywords: ["chomba", "remera", "musculosa"] },
      { id: "buzos", label: "Buzos", keywords: ["buzo", "hoodie", "sweater"] },
      { id: "camperas", label: "Camperas", keywords: ["campera", "camperon", "abrigo"] },
      { id: "polleras", label: "Polleras", keywords: ["pollera", "falda"] },
      { id: "pantalones", label: "Pantalones", keywords: ["pantalon", "pantalones", "bermuda"] },
      { id: "guardapolvos", label: "Guardapolvos", keywords: ["guardapolvo", "guardapolvos", "delantal"] },
    ],
  },
  {
    id: "tecnologia",
    label: "Tecnología",
    subs: [
      { id: "calculadoras-tech", label: "Calculadoras", keywords: ["calculadora", "cientifica"] },
      { id: "tablets", label: "Tablets", keywords: ["tablet", "ipad"] },
      { id: "notebooks", label: "Notebooks", keywords: ["notebook", "laptop", "computadora"] },
      { id: "auriculares", label: "Auriculares", keywords: ["auricular", "auriculares", "cascos"] },
    ],
  },
  {
    id: "mochilas",
    label: "Mochilas",
    subs: [
      { id: "mochilas", label: "Mochilas", keywords: ["mochila"] },
      { id: "bolsos", label: "Bolsos", keywords: ["bolso", "morral"] },
      { id: "loncheras", label: "Loncheras", keywords: ["lonchera", "vianda"] },
    ],
  },
  {
    id: "arte",
    label: "Arte",
    subs: [
      { id: "pintura", label: "Pintura", keywords: ["pintura", "acrilico", "oleo", "tempera"] },
      { id: "dibujo", label: "Dibujo", keywords: ["dibujo", "grafito", "carboncillo"] },
      { id: "manualidades", label: "Manualidades", keywords: ["manualidades", "goma eva", "cartulina"] },
      { id: "pinceles", label: "Pinceles", keywords: ["pincel", "brocha"] },
    ],
  },
  {
    id: "otros",
    label: "Otros",
    subs: [
      { id: "accesorios", label: "Accesorios", keywords: ["accesorio", "accesorios"] },
      { id: "deporte", label: "Deporte", keywords: ["deporte", "pelota", "remera deportiva"] },
      { id: "varios", label: "Varios", keywords: ["otros", "varios"] },
    ],
  },
];

/** @deprecated usar MEGA_MENU_CATEGORIES */
export const MAIN_FILTERS = MEGA_MENU_CATEGORIES.map(({ id, label }) => ({ id, label }));

export type SubFilterDef = { id: string; label: string };

export const SUB_FILTERS_BY_MAIN: Record<MainFilterId, SubFilterDef[]> = Object.fromEntries(
  MEGA_MENU_CATEGORIES.map((cat) => [
    cat.id,
    [{ id: "todo", label: "Todos" }, ...cat.subs.map(({ id, label }) => ({ id, label }))],
  ]),
) as Record<MainFilterId, SubFilterDef[]>;

export function isMainFilterId(value: string | undefined | null): value is MainFilterId {
  return value != null && (MAIN_FILTER_IDS as readonly string[]).includes(value);
}

export function getMegaMenuCategory(main: MainFilterId): MegaMenuCategory | undefined {
  return MEGA_MENU_CATEGORIES.find((c) => c.id === main);
}

export function getSubFiltersForMain(main: MainFilterId): SubFilterDef[] {
  return SUB_FILTERS_BY_MAIN[main] ?? SUB_FILTERS_BY_MAIN.todo;
}

export function getSubDefinition(main: MainFilterId, subId: string): MegaMenuSub | null {
  if (!subId || subId === "todo") return null;
  const cat = getMegaMenuCategory(main);
  return cat?.subs.find((s) => s.id === subId) ?? null;
}

export function isValidSubForMain(main: MainFilterId, subId: string): boolean {
  if (!subId || subId === "todo") return true;
  return getSubDefinition(main, subId) != null;
}

export function getMainFilterLabel(main: MainFilterId): string {
  return getMegaMenuCategory(main)?.label ?? "Todo";
}

export function getSubFilterLabel(main: MainFilterId, subId: string): string {
  if (!subId || subId === "todo") return "Todos";
  return getSubDefinition(main, subId)?.label ?? getSubFiltersForMain(main).find((s) => s.id === subId)?.label ?? "Todos";
}
