import type { Product, ProductCondition, ProductNewCondition, ProductUsedCondition } from "@/src/types/product";

export function formatNewConditionLabel(newCondition: ProductNewCondition | null | undefined): string {
  if (newCondition === "con_etiqueta") return "Con etiqueta";
  if (newCondition === "sin_etiqueta") return "Sin etiqueta";
  return "Sin etiqueta";
}

export function formatUsedConditionLabel(usedCondition: ProductUsedCondition | null | undefined): string {
  if (usedCondition === "casi_nuevo") return "Casi nuevo";
  if (usedCondition === "algo_desgastado") return "Algo desgastado";
  if (usedCondition === "bastante_desgastado") return "Bastante desgastado";
  if (usedCondition === "roto") return "Roto";
  return "Algo desgastado";
}

export function formatConditionLabel(
  condition: ProductCondition,
  newCondition: ProductNewCondition | null | undefined,
  usedCondition: ProductUsedCondition | null | undefined
): string {
  if (condition === "usado") return `Usado - ${formatUsedConditionLabel(usedCondition)}`;
  return `Nuevo - ${formatNewConditionLabel(newCondition)}`;
}

export function formatProductCondition(product: Pick<Product, "condition" | "new_condition" | "used_condition">): string {
  if (!product.condition) return "Sin especificar";
  return formatConditionLabel(product.condition, product.new_condition, product.used_condition);
}
