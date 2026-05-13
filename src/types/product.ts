export type ProductCondition = "nuevo" | "usado";
export type ProductNewCondition = "con_etiqueta" | "sin_etiqueta";
export type ProductUsedCondition = "casi_nuevo" | "algo_desgastado" | "bastante_desgastado" | "roto";
export type ProductStatus = "active" | "sold" | "paused";

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
  condition: ProductCondition;
  new_condition: ProductNewCondition | null;
  used_condition: ProductUsedCondition | null;
  institution: string | null;
  location: string;
  size: string | null;
  status: ProductStatus;
  created_at: string;
  images: string[];
};

export type ProductInsert = Omit<Product, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

/** Alias para mantener semántica en pantallas de detalle */
export type ProductDetail = Product;

/** Formulario de publicación (pantalla Vender) — sin persistencia todavía */
export type SellDeliveryMethod = "retiro" | "envio" | "ambos";
