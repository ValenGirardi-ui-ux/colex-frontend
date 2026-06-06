/** Elección de entrega del comprador al finalizar la compra. */
export type BuyerDeliveryChoice = "coordinar_vendedor" | "envio_domicilio";

export type OrderStatus =
  | "pendiente"
  | "coordinando"
  | "pagado"
  | "enviado"
  | "entregado"
  | "cancelado";

export type Order = {
  id: string;
  buyer_id: string;
  product_id: string;
  seller_id: string | null;
  product_title: string;
  product_price: number;
  buyer_delivery_method: BuyerDeliveryChoice;
  shipping_fee: number;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  buyer_location_label?: string | null;
  shipping_distance_km?: number | null;
  mp_preference_id?: string | null;
  mp_payment_id?: string | null;
};

export type OrderInsert = Omit<Order, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

/** Orden de venta enriquecida para el panel del vendedor. */
export type SellerOrderRow = Order & {
  buyerDisplayName: string;
  buyerIsVerified: boolean;
  saleConversationId: string | null;
};
