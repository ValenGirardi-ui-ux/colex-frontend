import { supabase } from "@/src/lib/supabase/client";

const AVATARS_BUCKET = "avatars";
const SHOP_BANNERS_BUCKET = "shop-banners";

const MIGRATION_HINT =
  "Faltan los buckets avatars/shop-banners en Supabase. Ejecutá supabase/migrations/20260516800000_profile_storage_buckets.sql.";

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

function bucketNotFoundMessage(bucket: string, message: string): string | null {
  const msg = message.toLowerCase();
  if (msg.includes("bucket") && msg.includes("not found")) {
    return MIGRATION_HINT;
  }
  if (msg.includes(bucket) && (msg.includes("does not exist") || msg.includes("not found"))) {
    return MIGRATION_HINT;
  }
  return null;
}

async function uploadProfileImage(
  bucket: string,
  path: string,
  file: File,
): Promise<{ url: string | null; error: string | null }> {
  const ext = fileExtension(file);
  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type || `image/${ext}`,
  });

  if (uploadError) {
    const hint = bucketNotFoundMessage(bucket, uploadError.message);
    return { url: null, error: hint ?? uploadError.message };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl ?? null, error: null };
}

/**
 * Avatar o logo en `{userId}/avatar.{ext}` (bucket `avatars`).
 * La URL pública se guarda en `profiles.avatar_url`.
 */
export async function uploadBusinessLogo(
  userId: string,
  file: File,
): Promise<{ url: string | null; error: string | null }> {
  const ext = fileExtension(file);
  const path = `${userId}/avatar.${ext}`;
  return uploadProfileImage(AVATARS_BUCKET, path, file);
}

/** Alias semántico para foto de perfil (mismo bucket y ruta que el logo). */
export async function uploadProfileAvatar(
  userId: string,
  file: File,
): Promise<{ url: string | null; error: string | null }> {
  return uploadBusinessLogo(userId, file);
}

/**
 * Banner de tienda en `{userId}/shop-banner.{ext}` (bucket `shop-banners`).
 * La URL pública se guarda en `profiles.shop_banner_url`.
 */
export async function uploadShopBanner(
  userId: string,
  file: File,
): Promise<{ url: string | null; error: string | null }> {
  const ext = fileExtension(file);
  const path = `${userId}/shop-banner.${ext}`;
  return uploadProfileImage(SHOP_BANNERS_BUCKET, path, file);
}
