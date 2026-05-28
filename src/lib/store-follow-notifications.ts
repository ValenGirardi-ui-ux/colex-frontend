import type { StoreNewProductsNotificationPayload } from "@/src/types/store-follow";

/**
 * Plantilla para notificaciones cuando una tienda seguida publica productos.
 * Invocar desde un trigger/job al insertar productos activos (futuro).
 */
export function buildStoreNewProductsNotification(
  payload: StoreNewProductsNotificationPayload,
): { title: string; message: string } {
  const name = payload.storeDisplayName.trim() || "Una tienda que seguís";
  const count = payload.productIds.length;
  const noun = count === 1 ? "un producto nuevo" : `${count} productos nuevos`;
  return {
    title: `${name} publicó novedades`,
    message: `Hay ${noun} en su tienda. Entrá a ver las publicaciones.`,
  };
}
