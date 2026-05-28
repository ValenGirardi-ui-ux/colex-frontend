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
 * Sube imágenes al bucket `product-images` en `{userId}/{uuid}.ext`.
 * Requiere `supabase/products-setup.sql` (bucket + políticas).
 */
export async function uploadProductImages(
  userId: string,
  files: File[],
): Promise<{ urls: string[]; error: string | null }> {
  const urls: string[] = [];

  for (const file of files) {
    const ext = fileExtension(file);
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || `image/${ext}`,
    });

    if (uploadError) {
      const msg = uploadError.message.toLowerCase();
      if (msg.includes("bucket") && msg.includes("not found")) {
        return {
          urls,
          error: "Falta el bucket product-images en Supabase. Ejecutá supabase/products-setup.sql.",
        };
      }
      return { urls, error: uploadError.message };
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    if (data.publicUrl) urls.push(data.publicUrl);
  }

  return { urls, error: null };
}
