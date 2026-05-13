/**
 * Categorías de publicación en Colex (vender / búsqueda futura)
 */
export const SELL_CATEGORIES = [
  "Uniformes",
  "Guardapolvos",
  "Libros",
  "Útiles escolares",
  "Mochilas",
  "Indumentaria institucional",
  "Calzado",
  "Accesorios",
  "Otros",
] as const;

export type SellCategory = (typeof SELL_CATEGORIES)[number];
