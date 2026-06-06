export type ProductCondition = "nuevo" | "usado";
export type ProductNewCondition = "con_etiqueta" | "sin_etiqueta";
export type ProductUsedCondition = "casi_nuevo" | "algo_desgastado" | "bastante_desgastado" | "roto";
/** `active` = publicado y visible en catálogo. */
export type ProductStatus = "active" | "sold" | "paused";

export function isPublishedProduct(status: ProductStatus): boolean {
  return status === "active";
}

/**
 * Tipo base para productos en Supabase (tabla `products`).
 */
export type Product = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: ProductCondition | null;
  new_condition: ProductNewCondition | null;
  used_condition: ProductUsedCondition | null;
  institution: string | null;
  brand: string | null;
  location: string;
  size: string | null;
  /** Etiquetas opcionales (columna o JSON en Supabase). */
  tags?: string[] | string | null;
  delivery_method: SellDeliveryMethod | null;
  status: ProductStatus;
  created_at: string;
  images: string[];
  /** Enriquecido desde `profiles`: vendedor con is_premium o is_featured (badge + etiqueta Destacado). */
  seller_verified?: boolean;
  /** Enriquecido desde `profiles`: vendedor con plan Premium activo. */
  seller_premium?: boolean;
  /** Promedio de reseñas del vendedor (tabla `reviews`). */
  seller_rating_avg?: number;
  seller_review_count?: number;
};

export type ProductInsert = Omit<Product, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

/** Alias para mantener semántica en pantallas de detalle */
export type ProductDetail = Product;

export type SellDeliveryMethod = "retiro" | "envio" | "envio_domicilio" | "ambos";
