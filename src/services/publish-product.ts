import { uploadProductImages } from "@/src/services/product-images";
import { createProduct } from "@/src/services/products";
import type { Product, ProductCondition, ProductNewCondition, ProductUsedCondition, SellDeliveryMethod } from "@/src/types/product";

export type PublishProductInput = {
  userId: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: ProductCondition;
  newCondition: ProductNewCondition | null;
  usedCondition: ProductUsedCondition | null;
  institution: string | null;
  brand: string | null;
  size: string | null;
  location: string;
  deliveryMethod: SellDeliveryMethod | null;
  imageFiles: File[];
};

export function formatPublishErrorForUser(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("row-level security") || m.includes("policy")) {
    return "No tenés permiso para publicar. Revisá las políticas RLS de products en Supabase.";
  }
  if (m.includes("schema cache") || m.includes("column")) {
    return "La tabla products no está actualizada. Ejecutá supabase/products-setup.sql.";
  }
  return message || "No se pudo publicar el producto.";
}

export async function publishProduct(input: PublishProductInput): Promise<{ product: Product | null; error: string | null }> {
  if (input.imageFiles.length === 0) {
    return { product: null, error: "Agregá al menos una imagen." };
  }

  const { urls, error: uploadError } = await uploadProductImages(input.userId, input.imageFiles);
  if (uploadError) {
    return { product: null, error: formatPublishErrorForUser(uploadError) };
  }
  if (urls.length === 0) {
    return { product: null, error: "No se pudieron subir las imágenes." };
  }

  try {
    const product = await createProduct({
      user_id: input.userId,
      title: input.title.trim(),
      description: input.description.trim(),
      price: input.price,
      category: input.category.trim() || "Otros",
      condition: input.condition,
      new_condition: input.condition === "nuevo" ? input.newCondition : null,
      used_condition: input.condition === "usado" ? input.usedCondition : null,
      institution: input.institution?.trim() || null,
      brand: input.brand?.trim() || null,
      location: input.location.trim() || "No indicada",
      size: input.size?.trim() || null,
      delivery_method: input.deliveryMethod,
      status: "active",
      images: urls,
    });
    return { product, error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { product: null, error: formatPublishErrorForUser(message) };
  }
}
