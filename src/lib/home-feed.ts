import { HOME_CATEGORY_STRIP } from "@/src/data/home-category-strip";
import type { MainFilterId } from "@/src/data/product-filters";
import { sortProductsFeaturedFirst } from "@/src/lib/featured-listings";
import { buildBrowseHref, productMatchesMainFilter } from "@/src/lib/product-filters";
import type { Product } from "@/src/types/product";

export type HomeFeedSection = {
  id: string;
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHref?: string;
};

const MIN_RAIL_ITEMS = 2;
const DEFAULT_RAIL_LIMIT = 8;
const COMBO_RAIL_LIMIT = 6;
const CATEGORY_RAIL_LIMIT = 4;

function safeString(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function productTagsText(product: Product): string {
  const raw = product.tags;
  if (!raw) return "";
  if (Array.isArray(raw)) return raw.map(safeString).filter(Boolean).join(" ");
  if (typeof raw === "string") return raw;
  return "";
}

/** Pack / combo / kit en título, descripción o tags. */
export function isComboProduct(product: Product): boolean {
  const blob = `${product.title} ${product.description} ${productTagsText(product)}`.toLowerCase();
  return /\b(pack|combo|kit|lote)\b/u.test(blob) || /\bpack\b/u.test(blob);
}

export function isPremiumSellerProduct(product: Product): boolean {
  return product.seller_premium === true;
}

function sortByNewest(products: Product[]): Product[] {
  return [...products].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

function takeUnique(
  products: Product[],
  limit: number,
  used: Set<string>,
): Product[] {
  const picked: Product[] = [];
  for (const p of products) {
    if (used.has(p.id)) continue;
    picked.push(p);
    used.add(p.id);
    if (picked.length >= limit) break;
  }
  return picked;
}

function mainFamiliesFromFavorites(all: Product[], favoriteIds: ReadonlySet<string>): MainFilterId[] {
  const mains = new Set<MainFilterId>();
  for (const p of all) {
    if (!favoriteIds.has(p.id)) continue;
    for (const cat of HOME_CATEGORY_STRIP) {
      if (productMatchesMainFilter(p, cat.cat)) {
        mains.add(cat.cat);
        break;
      }
    }
  }
  return [...mains];
}

function buildRecommended(
  pool: Product[],
  all: Product[],
  favoriteIds: ReadonlySet<string>,
  used: Set<string>,
): Product[] {
  const mains = mainFamiliesFromFavorites(all, favoriteIds);
  let candidates = pool.filter((p) => !used.has(p.id));

  if (mains.length > 0) {
    const matched = candidates.filter((p) => mains.some((m) => productMatchesMainFilter(p, m)));
    if (matched.length >= MIN_RAIL_ITEMS) candidates = matched;
  }

  return takeUnique(sortProductsFeaturedFirst(sortByNewest(candidates)), DEFAULT_RAIL_LIMIT, used);
}

export type BuildHomeFeedResult = {
  sections: HomeFeedSection[];
  usedProductIds: Set<string>;
};

/**
 * Arma secciones del feed home (sin búsqueda/filtros activos).
 * Cada producto aparece como máximo en una sección prioritaria.
 */
export function buildHomeFeedSections(
  allProducts: Product[],
  options?: { favoriteIds?: ReadonlySet<string> },
): BuildHomeFeedResult {
  const used = new Set<string>();
  const sections: HomeFeedSection[] = [];
  const active = allProducts.filter((p) => p.status === "active");
  const pool = sortByNewest(active);
  const favoriteIds = options?.favoriteIds ?? new Set<string>();

  const newest = takeUnique(pool, DEFAULT_RAIL_LIMIT, used);
  if (newest.length >= MIN_RAIL_ITEMS) {
    sections.push({
      id: "nuevos-ingresos",
      title: "Nuevos ingresos",
      subtitle: "Publicaciones recientes en el marketplace",
      products: newest,
      viewAllHref: buildBrowseHref("buscar", { main: "todo", sub: "todo", query: "" }),
    });
  }

  const premiumPool = sortProductsFeaturedFirst(
    pool.filter((p) => isPremiumSellerProduct(p) && !used.has(p.id)),
  );
  const premiumListings = takeUnique(premiumPool, DEFAULT_RAIL_LIMIT, used);
  if (premiumListings.length >= MIN_RAIL_ITEMS) {
    sections.push({
      id: "publicaciones-destacadas",
      title: "Publicaciones destacadas",
      subtitle: "De vendedores con Colex Premium",
      products: premiumListings,
      viewAllHref: "/premium",
    });
  }

  const comboPool = sortProductsFeaturedFirst(
    pool.filter((p) => isComboProduct(p) && !used.has(p.id)),
  );
  const combos = takeUnique(comboPool, COMBO_RAIL_LIMIT, used);
  if (combos.length >= MIN_RAIL_ITEMS) {
    sections.push({
      id: "combos-destacados",
      title: "Combos destacados",
      subtitle: "Packs y lotes para arrancar el ciclo",
      products: combos,
      viewAllHref: buildBrowseHref("buscar", { main: "todo", sub: "todo", query: "pack" }),
    });
  }

  for (const cat of HOME_CATEGORY_STRIP) {
    const inCategory = pool.filter(
      (p) => !used.has(p.id) && productMatchesMainFilter(p, cat.cat),
    );
    const rail = takeUnique(sortByNewest(inCategory), CATEGORY_RAIL_LIMIT, used);
    if (rail.length < MIN_RAIL_ITEMS) continue;
    sections.push({
      id: `categoria-${cat.id}`,
      title: cat.label,
      subtitle: `Recientes en ${cat.label.toLowerCase()}`,
      products: rail,
      viewAllHref: buildBrowseHref("home", {
        main: cat.cat,
        sub: cat.sub ?? "todo",
        query: "",
      }),
    });
  }

  const recommended = buildRecommended(pool, active, favoriteIds, used);
  if (recommended.length >= MIN_RAIL_ITEMS) {
    const subtitle =
      favoriteIds.size > 0
        ? "Basado en tus favoritos y categorías que seguís"
        : "Descubrí artículos populares en Colex";
    sections.push({
      id: "recomendados",
      title: "Recomendados para vos",
      subtitle,
      products: recommended,
      viewAllHref: favoriteIds.size > 0 ? "/favoritos" : buildBrowseHref("buscar", { main: "todo", sub: "todo", query: "" }),
    });
  }

  return { sections, usedProductIds: used };
}
