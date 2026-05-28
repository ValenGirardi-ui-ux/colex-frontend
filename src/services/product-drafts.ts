import { uploadProductImages } from "@/src/services/product-images";

import { createProduct, deleteProduct, getOwnProductById, updateProduct } from "@/src/services/products";

import { publishProduct, type PublishProductInput } from "@/src/services/publish-product";

import type {

  Product,

  ProductCondition,

  ProductInsert,

  ProductNewCondition,

  ProductUsedCondition,

  SellDeliveryMethod,

} from "@/src/types/product";



export type SaveDraftInput = {

  userId: string;

  draftId?: string | null;

  title: string;

  description: string;

  category: string;

  condition: ProductCondition | "";

  newCondition: ProductNewCondition | "";

  usedCondition: ProductUsedCondition | "";

  price: number;

  brand: string | null;

  institution: string | null;

  size: string | null;

  location: string;

  deliveryMethod: SellDeliveryMethod | null;

  existingImageUrls: string[];

  newImageFiles: File[];

};



function resolveDraftConditionFields(input: SaveDraftInput): Pick<

  ProductInsert,

  "condition" | "new_condition" | "used_condition"

> {

  if (input.condition === "nuevo") {

    return {

      condition: "nuevo",

      new_condition:

        input.newCondition === "con_etiqueta" || input.newCondition === "sin_etiqueta"

          ? input.newCondition

          : null,

      used_condition: null,

    };

  }

  if (input.condition === "usado") {

    return {

      condition: "usado",

      new_condition: null,

      used_condition:

        input.usedCondition === "casi_nuevo" ||

        input.usedCondition === "algo_desgastado" ||

        input.usedCondition === "bastante_desgastado" ||

        input.usedCondition === "roto"

          ? input.usedCondition

          : null,

    };

  }

  return {

    condition: null,

    new_condition: null,

    used_condition: null,

  };

}



function resolvePublishConditionFields(input: SaveDraftInput): {

  condition: ProductCondition;

  newCondition: ProductNewCondition | null;

  usedCondition: ProductUsedCondition | null;

} {

  const condition: ProductCondition = input.condition === "nuevo" ? "nuevo" : "usado";

  const newCondition: ProductNewCondition | null =

    condition === "nuevo"

      ? input.newCondition === "con_etiqueta" || input.newCondition === "sin_etiqueta"

        ? input.newCondition

        : null

      : null;

  const usedCondition: ProductUsedCondition | null =

    condition === "usado"

      ? input.usedCondition === "casi_nuevo" ||

        input.usedCondition === "algo_desgastado" ||

        input.usedCondition === "bastante_desgastado" ||

        input.usedCondition === "roto"

        ? input.usedCondition

        : null

      : null;

  return { condition, newCondition, usedCondition };

}



export function formatDraftErrorForUser(message: string): string {

  const m = message.toLowerCase();

  if (m.includes("row-level security") || m.includes("policy")) {

    return "No tenés permiso para guardar borradores. Ejecutá supabase/products-draft-status.sql en Supabase.";

  }

  if (m.includes("products_price_check") || (m.includes("price") && m.includes("check"))) {

    return "Revisá el precio del borrador.";

  }

  if (m.includes("schema cache") || m.includes("column") || m.includes("updated_at")) {

    return "Falta configurar borradores en Supabase. Ejecutá supabase/products-draft-status.sql.";

  }

  if (m.includes("products_draft_condition_check")) {

    return "Revisá el estado del producto en el borrador.";

  }

  return message || "No se pudo guardar el borrador.";

}



export async function saveProductDraft(

  input: SaveDraftInput,

): Promise<{ product: Product | null; error: string | null }> {

  const conditionFields = resolveDraftConditionFields(input);



  let imageUrls = [...input.existingImageUrls];

  if (input.newImageFiles.length > 0) {

    const { urls, error: uploadError } = await uploadProductImages(input.userId, input.newImageFiles);

    if (uploadError) {

      return { product: null, error: formatDraftErrorForUser(uploadError) };

    }

    imageUrls = [...imageUrls, ...urls];

  }



  const title = input.title.trim() || "Sin título";

  const payload: Partial<ProductInsert> & { status: "draft"; user_id: string; title: string } = {

    user_id: input.userId,

    title,

    description: input.description.trim(),

    price: Math.max(0, input.price),

    category: input.category.trim() || "Otros",

    ...conditionFields,

    institution: input.institution,

    brand: input.brand,

    location: input.location.trim() || "No indicada",

    size: input.size,

    delivery_method: input.deliveryMethod,

    status: "draft",

    images: imageUrls,

  };



  try {

    if (input.draftId) {

      const existing = await getOwnProductById(input.draftId, input.userId);

      if (!existing) {

        return { product: null, error: "No encontramos ese borrador." };

      }

      if (existing.status !== "draft") {

        return { product: null, error: "Solo podés editar publicaciones en borrador." };

      }

      const product = await updateProduct(input.draftId, payload, input.userId);

      return { product, error: null };

    }



    const product = await createProduct(payload as ProductInsert);

    return { product, error: null };

  } catch (e) {

    const message = e instanceof Error ? e.message : String(e);

    return { product: null, error: formatDraftErrorForUser(message) };

  }

}



/** Publica un borrador existente: actualiza la misma fila a `active` (visible en catálogo). */

export async function publishExistingDraft(

  draftId: string,

  userId: string,

  input: SaveDraftInput & { imageFiles: File[] },

): Promise<{ product: Product | null; error: string | null }> {

  if (input.imageFiles.length === 0 && input.existingImageUrls.length === 0) {

    return { product: null, error: "Agregá al menos una imagen." };

  }



  const saveResult = await saveProductDraft({ ...input, draftId, userId });

  if (saveResult.error || !saveResult.product) {

    return saveResult;

  }



  const title = input.title.trim();

  if (!title) {

    return { product: null, error: "Ingresá un título." };

  }

  if (input.price <= 0) {

    return { product: null, error: "Ingresá un precio válido." };

  }



  const { condition, newCondition, usedCondition } = resolvePublishConditionFields(input);

  if (condition === "nuevo" && !newCondition) {

    return { product: null, error: "Indicá si el producto nuevo tiene etiqueta." };

  }

  if (condition === "usado" && !usedCondition) {

    return { product: null, error: "Indicá el estado del producto usado." };

  }



  try {

    const product = await updateProduct(

      draftId,

      {

        status: "active",

        title,

        description: input.description.trim(),

        price: input.price,

        category: input.category.trim() || "Otros",

        condition,

        new_condition: newCondition,

        used_condition: usedCondition,

        institution: input.institution,

        brand: input.brand,

        location: input.location.trim() || "No indicada",

        size: input.size,

        delivery_method: input.deliveryMethod,

        images: saveResult.product.images,

      },

      userId,

    );

    return { product, error: null };

  } catch (e) {

    const message = e instanceof Error ? e.message : String(e);

    return { product: null, error: formatDraftErrorForUser(message) };

  }

}



export async function removeProductDraft(

  draftId: string,

  userId: string,

): Promise<{ error: string | null }> {

  try {

    const existing = await getOwnProductById(draftId, userId);

    if (!existing) return { error: "Borrador no encontrado." };

    if (existing.status !== "draft") {

      return { error: "Solo podés eliminar borradores." };

    }

    await deleteProduct(draftId, userId);

    return { error: null };

  } catch (e) {

    const message = e instanceof Error ? e.message : String(e);

    return { error: formatDraftErrorForUser(message) };

  }

}


