/**
 * Convierte un precio de etiqueta (ej. "$ 53.000") a entero en pesos. Solo mock/local.
 */
export function priceLabelToArs(label: string): number {
  const digits = label.replace(/[^\d]/g, "");
  if (!digits) return 0;
  return parseInt(digits, 10) || 0;
}

export function formatArs(n: number): string {
  return n.toLocaleString("es-AR", { maximumFractionDigits: 0 });
}

export function formatArsPrice(n: number): string {
  return `$ ${formatArs(n)}`;
}
