export const PRODUCT_REPORT_REASONS = [
  "Contenido inapropiado",
  "Producto falso o engañoso",
  "Precio sospechoso",
  "Spam",
  "Otro",
] as const;

export type ProductReportReason = (typeof PRODUCT_REPORT_REASONS)[number];
