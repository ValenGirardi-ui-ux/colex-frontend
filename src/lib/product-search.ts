import { isFeaturedListing } from "@/src/lib/featured-listings";
import { formatProductCondition } from "@/src/lib/product-condition";
import { normalizeSearchText, searchQueryTokens, tokenMatchVariants } from "@/src/lib/search-text";
import type { Product } from "@/src/types/product";

function safeString(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function productTags(product: Product): string[] {
  const raw = product.tags;
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((t) => safeString(t)).filter(Boolean);
  }
  if (typeof raw === "string") {
    return raw
      .split(/[,;|]/)
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
}

/** Texto indexable del producto (todos los campos relevantes). */
export function productSearchHaystack(product: Product): string {
  const tags = productTags(product);
  const conditionLabel = formatProductCondition(product);
  const parts = [
    product.title,
    product.description,
    product.category,
    product.brand,
    product.institution,
    product.location,
    product.size,
    conditionLabel,
    ...tags,
  ];
  return normalizeSearchText(parts.map(safeString).filter(Boolean).join(" "));
}

function tokenMatchesHaystack(haystack: string, token: string): boolean {
  const variants = tokenMatchVariants(token);
  return variants.some((v) => v.length > 0 && haystack.includes(v));
}

/** ¿El producto coincide con la consulta? (todos los tokens deben aparecer). */
export function productMatchesSearch(product: Product, query: string): boolean {
  const tokens = searchQueryTokens(query);
  if (tokens.length === 0) return false;
  const haystack = productSearchHaystack(product);
  if (!haystack) return false;
  return tokens.every((token) => tokenMatchesHaystack(haystack, token));
}

function fieldBonus(raw: string | null | undefined, token: string): number {
  const field = normalizeSearchText(safeString(raw));
  if (!field) return 0;
  const variants = tokenMatchVariants(token);
  let bonus = 0;
  for (const v of variants) {
    if (!v) continue;
    if (field === v) bonus = Math.max(bonus, 40);
    else if (field.startsWith(v)) bonus = Math.max(bonus, 28);
    else if (field.includes(v)) bonus = Math.max(bonus, 14);
  }
  return bonus;
}

function scoreProduct(product: Product, query: string): number {
  const tokens = searchQueryTokens(query);
  if (tokens.length === 0) return 0;
  const haystack = productSearchHaystack(product);
  let score = 0;

  for (const token of tokens) {
    if (!tokenMatchesHaystack(haystack, token)) return 0;
    score += 10;
    score += fieldBonus(product.title, token) * 2;
    score += fieldBonus(product.category, token);
    score += fieldBonus(product.brand, token);
    score += fieldBonus(product.description, token);
    for (const tag of productTags(product)) {
      score += fieldBonus(tag, token);
    }
  }

  return score;
}

export type SearchProductsResult = {
  products: Product[];
  query: string;
};

/**
 * Filtra y ordena por relevancia. Premium solo desempata entre coincidencias del mismo puntaje
 * (no empuja productos poco relacionados al tope).
 */
export function filterAndRankProducts(products: Product[], query: string): SearchProductsResult {
  const trimmed = query.trim();
  const tokens = searchQueryTokens(trimmed);
  if (tokens.length === 0) {
    return { products: [], query: trimmed };
  }

  const scored = products
    .map((product) => ({ product, score: scoreProduct(product, trimmed) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const aFeatured = isFeaturedListing(a.product) ? 1 : 0;
      const bFeatured = isFeaturedListing(b.product) ? 1 : 0;
      if (bFeatured !== aFeatured) return bFeatured - aFeatured;
      return b.product.created_at.localeCompare(a.product.created_at);
    });

  return {
    products: scored.map((row) => row.product),
    query: trimmed,
  };
}
