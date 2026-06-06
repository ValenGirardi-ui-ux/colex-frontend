import { supabase } from "@/src/lib/supabase/client";

const BUCKET = "chat-images";
const MAX_BYTES = 5 * 1024 * 1024;

const MIGRATION_HINT =
  "Falta el bucket chat-images. Ejecutá supabase/migrations/20260517000000_chat_images.sql.";

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

export function validateChatImageFile(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "Elegí una imagen (JPG, PNG, WebP o GIF).";
  }
  if (file.size > MAX_BYTES) {
    return "La imagen no puede superar 5 MB.";
  }
  return null;
}

/**
 * Sube imagen de chat a `{conversationId}/{userId}/{uuid}.ext`.
 */
export async function uploadChatImage(
  conversationId: string,
  userId: string,
  file: File,
): Promise<{ url: string | null; error: string | null }> {
  const validation = validateChatImageFile(file);
  if (validation) return { url: null, error: validation };

  const ext = fileExtension(file);
  const path = `${conversationId}/${userId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || `image/${ext}`,
  });

  if (uploadError) {
    const msg = uploadError.message.toLowerCase();
    if (msg.includes("bucket") && msg.includes("not found")) {
      return { url: null, error: MIGRATION_HINT };
    }
    if (msg.includes("row-level security") || msg.includes("policy")) {
      return { url: null, error: "No tenés permiso para subir imágenes en este chat." };
    }
    return { url: null, error: uploadError.message };
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl ?? null, error: null };
}
