import { supabase } from "@/src/lib/supabase/client";

const BUCKET = "product-images";

function fileExtension(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && ["jpg", "jpeg", "png", "webp", "gif"].includes(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  return "jpg";
}

/**
 * Logo del negocio en `{userId}/avatar.{ext}` (bucket product-images, upsert).
 */
export async function uploadBusinessLogo(
  userId: string,
  file: File,
): Promise<{ url: string | null; error: string | null }> {
  const ext = fileExtension(file);
  const path = `${userId}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type || `image/${ext}`,
  });

  if (uploadError) {
    const msg = uploadError.message.toLowerCase();
    if (msg.includes("bucket") && msg.includes("not found")) {
      return {
        url: null,
        error: "Falta el bucket product-images en Supabase. Ejecutá supabase/products-setup.sql.",
      };
    }
    return { url: null, error: uploadError.message };
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl ?? null, error: null };
}

/** Banner de tienda en `{userId}/shop-banner.{ext}`. */
export async function uploadShopBanner(
  userId: string,
  file: File,
): Promise<{ url: string | null; error: string | null }> {
  const ext = fileExtension(file);
  const path = `${userId}/shop-banner.${ext}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type || `image/${ext}`,
  });

  if (uploadError) {
    const msg = uploadError.message.toLowerCase();
    if (msg.includes("bucket") && msg.includes("not found")) {
      return {
        url: null,
        error: "Falta el bucket product-images en Supabase. Ejecutá supabase/products-setup.sql.",
      };
    }
    return { url: null, error: uploadError.message };
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl ?? null, error: null };
}
