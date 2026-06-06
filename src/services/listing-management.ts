import { formatPublishErrorForUser, type PublishProductInput } from "@/src/services/publish-product";
import { getOwnProductById, updateProduct, deleteProduct } from "@/src/services/products";
import { uploadProductImages } from "@/src/services/product-images";
import type { Product, ProductStatus } from "@/src/types/product";

export type UpdateListingInput = PublishProductInput & {
  existingImageUrls: string[];
};

export function formatListingErrorForUser(message: string): string {
  return formatPublishErrorForUser(message);
}

function assertManageable(product: Product | null): product is Product {
  if (!product) return false;
  return product.status === "active" || product.status === "paused";
}

export async function updatePublishedListing(
  productId: string,
  userId: string,
  input: UpdateListingInput,
): Promise<{ product: Product | null; error: string | null }> {
  const existing = await getOwnProductById(productId, userId);
  if (!assertManageable(existing)) {
    return { product: null, error: "No encontramos esta publicación o no podés editarla." };
  }

  let imageUrls = [...input.existingImageUrls];
  if (input.imageFiles.length > 0) {
    const { urls, error: uploadError } = await uploadProductImages(userId, input.imageFiles);
    if (uploadError) {
      return { product: null, error: formatListingErrorForUser(uploadError) };
    }
    imageUrls = [...imageUrls, ...urls];
  }

  if (imageUrls.length === 0) {
    return { product: null, error: "Agregá al menos una imagen." };
  }

  try {
    const product = await updateProduct(
      productId,
      {
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
        images: imageUrls,
      },
      userId,
    );
    return { product, error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { product: null, error: formatListingErrorForUser(message) };
  }
}

async function setListingStatus(
  productId: string,
  userId: string,
  status: ProductStatus,
): Promise<{ product: Product | null; error: string | null }> {
  const existing = await getOwnProductById(productId, userId);
  if (!existing) {
    return { product: null, error: "No encontramos esta publicación." };
  }
  if (status === "active" && existing.status !== "paused") {
    return { product: null, error: "Solo podés republicar publicaciones pausadas." };
  }
  if (status === "paused" && existing.status !== "active") {
    return { product: null, error: "Solo podés pausar publicaciones activas." };
  }

  try {
    const product = await updateProduct(productId, { status }, userId);
    return { product, error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { product: null, error: formatListingErrorForUser(message) };
  }
}

export async function pauseListing(
  productId: string,
  userId: string,
): Promise<{ product: Product | null; error: string | null }> {
  return setListingStatus(productId, userId, "paused");
}

export async function republishListing(
  productId: string,
  userId: string,
): Promise<{ product: Product | null; error: string | null }> {
  return setListingStatus(productId, userId, "active");
}

export async function deleteListing(
  productId: string,
  userId: string,
): Promise<{ error: string | null }> {
  const existing = await getOwnProductById(productId, userId);
  if (!existing) {
    return { error: "No encontramos esta publicación." };
  }
  try {
    await deleteProduct(productId, userId);
    return { error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { error: formatListingErrorForUser(message) };
  }
}
