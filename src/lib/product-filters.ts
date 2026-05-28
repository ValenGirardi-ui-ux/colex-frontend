import {
  getSubDefinition,
  isMainFilterId,
  isValidSubForMain,
  type MainFilterId,
} from "@/src/data/product-filters";
import { sortProductsFeaturedFirst } from "@/src/lib/featured-listings";
import { filterAndRankProducts } from "@/src/lib/product-search";
import { normalizeSearchText } from "@/src/lib/search-text";
import type { Product } from "@/src/types/product";

function safeString(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function norm(value: unknown): string {
  return normalizeSearchText(safeString(value));
}

function productCategoryNorm(product: Product): string {
  return norm(product.category);
}

function productHaystack(product: Product): string {
  const tags = Array.isArray(product.tags)
    ? product.tags.map(safeString).join(" ")
    : typeof product.tags === "string"
      ? product.tags
      : "";
  return norm(
    [
      product.title,
      product.description,
      product.category,
      product.brand,
      product.institution,
      product.location,
      product.size,
      tags,
    ]
      .map(safeString)
      .filter(Boolean)
      .join(" "),
  );
}

function haystackHasAny(haystack: string, needles: string[]): boolean {
  if (!haystack) return false;
  return needles.some((n) => {
    const t = norm(n);
    return t.length > 0 && haystack.includes(t);
  });
}

function categoryIs(product: Product, ...labels: string[]): boolean {
  const cat = productCategoryNorm(product);
  if (!cat) return false;
  return labels.some((label) => cat === norm(label) || cat.includes(norm(label)));
}

/** Mapeo directo del campo `category` de Supabase / mocks al menú principal. */
const PRODUCT_CATEGORY_MAIN: Record<string, MainFilterId> = {
  uniformes: "uniformes",
  guardapolvos: "uniformes",
  "indumentaria institucional": "uniformes",
  indumentaria: "uniformes",
  calzado: "uniformes",
  libros: "libros",
  libro: "libros",
  "utiles escolares": "utiles",
  utiles: "utiles",
  mochilas: "mochilas",
  mochila: "mochilas",
  accesorios: "otros",
  otros: "otros",
  arte: "arte",
  tecnologia: "tecnologia",
};

function mainFamilyFromProductCategory(product: Product): MainFilterId | null {
  const cat = productCategoryNorm(product);
  if (!cat) return null;
  if (PRODUCT_CATEGORY_MAIN[cat]) return PRODUCT_CATEGORY_MAIN[cat];
  for (const [key, main] of Object.entries(PRODUCT_CATEGORY_MAIN)) {
    if (cat.includes(key) || key.includes(cat)) return main;
  }
  return null;
}

function productMatchesMainFamily(product: Product, main: MainFilterId): boolean {
  const fromField = mainFamilyFromProductCategory(product);
  if (fromField) return fromField === main;
  switch (main) {
    case "uniformes":
      return matchesUniformesFamily(product);
    case "utiles":
      return matchesUtilesFamily(product);
    case "libros":
      return matchesLibrosFamily(product);
    case "mochilas":
      return matchesMochilasFamily(product);
    case "arte":
      return matchesArteFamily(product);
    case "tecnologia":
      return matchesTecnologiaFamily(product);
    case "otros":
      return matchesOtrosFamily(product);
    default:
      return true;
  }
}

function matchesUniformesFamily(product: Product): boolean {
  return (
    categoryIs(product, "Uniformes", "Guardapolvos", "Indumentaria institucional", "Calzado") ||
    haystackHasAny(productHaystack(product), [
      "uniforme",
      "guardapolvo",
      "buzo",
      "chomba",
      "campera",
      "pollera",
    ])
  );
}

function matchesUtilesFamily(product: Product): boolean {
  return (
    categoryIs(product, "Útiles escolares", "Utiles escolares") ||
    haystackHasAny(productHaystack(product), [
      "util",
      "lapiz",
      "cuaderno",
      "cartuchera",
      "carpeta",
      "regla",
      "calculadora",
    ])
  );
}

function matchesLibrosFamily(product: Product): boolean {
  return (
    categoryIs(product, "Libros") ||
    haystackHasAny(productHaystack(product), ["libro", "texto", "apunte", "manual", "literatura"])
  );
}

function matchesMochilasFamily(product: Product): boolean {
  return (
    categoryIs(product, "Mochilas") ||
    haystackHasAny(productHaystack(product), ["mochila", "bolso", "lonchera"])
  );
}

function matchesArteFamily(product: Product): boolean {
  return haystackHasAny(productHaystack(product), [
    "arte",
    "pintura",
    "dibujo",
    "acuarela",
    "pincel",
    "manualidades",
    "cartulina",
  ]);
}

function matchesTecnologiaFamily(product: Product): boolean {
  return haystackHasAny(productHaystack(product), [
    "tecnologia",
    "tablet",
    "calculadora",
    "auricular",
    "cargador",
    "usb",
    "computadora",
    "notebook",
  ]);
}

function matchesOtrosFamily(product: Product): boolean {
  if (categoryIs(product, "Otros", "Accesorios")) return true;
  const cat = productCategoryNorm(product);
  if (!cat) return true;
  return (
    !matchesUniformesFamily(product) &&
    !matchesUtilesFamily(product) &&
    !matchesLibrosFamily(product) &&
    !matchesMochilasFamily(product) &&
    !matchesArteFamily(product) &&
    !matchesTecnologiaFamily(product)
  );
}

export function productMatchesMainFilter(product: Product, main: MainFilterId): boolean {
  if (main === "todo") return true;
  return productMatchesMainFamily(product, main);
}

export function productMatchesSubFilter(product: Product, main: MainFilterId, subId: string): boolean {
  if (!subId || subId === "todo") return true;
  if (!productMatchesMainFilter(product, main)) return false;

  const def = getSubDefinition(main, subId);
  if (!def) return true;

  const haystack = productHaystack(product);
  const cat = productCategoryNorm(product);

  if (haystackHasAny(haystack, def.keywords)) return true;
  if (categoryIs(product, def.label)) return true;

  // Subcategorías alineadas al campo category real del producto
  if (subId === "guardapolvos" && (cat.includes("guardapolvo") || cat === norm("Guardapolvos"))) {
    return true;
  }
  if (subId === "mochilas" && cat.includes("mochila")) return true;
  if (subId === "libros" && cat.includes("libro")) return true;

  return false;
}

export type CatalogFilterParams = {
  main?: string | null;
  sub?: string | null;
  query?: string | null;
};

export function parseCatalogFilterParams(params: CatalogFilterParams): {
  main: MainFilterId;
  sub: string;
  query: string;
} {
  const main = isMainFilterId(params.main) ? params.main : "todo";
  const subRaw = params.sub ?? "todo";
  const sub = isValidSubForMain(main, subRaw) ? subRaw : "todo";
  const query = safeString(params.query).trim();
  return { main, sub, query };
}

export function applyCatalogFilters(products: Product[], params: CatalogFilterParams): Product[] {
  const { main, sub, query } = parseCatalogFilterParams(params);

  let list = products.filter(
    (p) => productMatchesMainFilter(p, main) && productMatchesSubFilter(p, main, sub),
  );

  if (query) {
    list = filterAndRankProducts(list, query).products;
  } else {
    list = sortProductsFeaturedFirst(list);
  }

  return list;
}

export function catalogHasActiveFilters(params: CatalogFilterParams): boolean {
  const { main, sub, query } = parseCatalogFilterParams(params);
  return main !== "todo" || sub !== "todo" || query.length > 0;
}

export function buildCatalogSearchParams(params: CatalogFilterParams): URLSearchParams {
  const { main, sub, query } = parseCatalogFilterParams(params);
  const sp = new URLSearchParams();
  if (query) sp.set("q", query);
  if (main !== "todo") sp.set("cat", main);
  if (sub !== "todo") sp.set("sub", sub);
  return sp;
}

export type BrowseBasePath = "home" | "buscar";

export function buildBrowseHref(base: BrowseBasePath, params: CatalogFilterParams): string {
  const sp = buildCatalogSearchParams(params);
  const qs = sp.toString();
  if (base === "home") {
    return qs ? `/?${qs}#productos-destacados` : "/#productos-destacados";
  }
  return qs ? `/buscar?${qs}` : "/buscar";
}
