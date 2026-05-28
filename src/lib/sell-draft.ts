import type { ProductCondition, ProductNewCondition, ProductUsedCondition, SellDeliveryMethod } from "@/src/types/product";

export const LOCAL_SELL_DRAFT_KEY = "colex-sell-draft-v1";
export const LOCAL_SELL_DRAFT_ID = "local";

export type SellDraftPhotoStored = {
  id: string;
  /** Data URL para persistencia en localStorage */
  dataUrl: string;
  name: string;
};

export type SellDraftSnapshot = {
  version: 1;
  id: string;
  updatedAt: string;
  title: string;
  description: string;
  category: string;
  condition: ProductCondition | "";
  newCondition: ProductNewCondition | "";
  usedCondition: ProductUsedCondition | "";
  price: string;
  brand: string;
  institution: string;
  sizeLabel: string;
  location: string;
  delivery: SellDeliveryMethod | "";
  /** URLs ya subidas (borrador en Supabase) */
  imageUrls: string[];
  /** Fotos pendientes de subir (solo local) */
  localPhotos: SellDraftPhotoStored[];
};

export function createEmptyLocalDraft(): SellDraftSnapshot {
  return {
    version: 1,
    id: LOCAL_SELL_DRAFT_ID,
    updatedAt: new Date().toISOString(),
    title: "",
    description: "",
    category: "",
    condition: "",
    newCondition: "",
    usedCondition: "",
    price: "",
    brand: "",
    institution: "",
    sizeLabel: "",
    location: "",
    delivery: "",
    imageUrls: [],
    localPhotos: [],
  };
}

export function readLocalSellDraft(): SellDraftSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LOCAL_SELL_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SellDraftSnapshot;
    if (parsed?.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeLocalSellDraft(draft: SellDraftSnapshot): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_SELL_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // quota exceeded — silent fail
  }
}

export function clearLocalSellDraft(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LOCAL_SELL_DRAFT_KEY);
}

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.readAsDataURL(file);
  });
}

export async function dataUrlToFile(dataUrl: string, name: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], name, { type: blob.type || "image/jpeg" });
}
