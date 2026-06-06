import { NextResponse } from "next/server";
import { resolveSiteOrigin } from "@/src/lib/mercadopago/site-url";
import { isMercadoPagoServerConfigured } from "@/src/lib/mercadopago/config";
import { createServerSupabaseClient } from "@/src/lib/supabase/server";
import { createServiceRoleClient } from "@/src/lib/supabase/admin-service";
import { createMercadoPagoPreference } from "@/src/services/mercadopago-server";

type Body = {
  orderId?: string;
};

const OPEN_STATUSES = ["pendiente", "coordinando"];

export async function POST(request: Request) {
  try {
    if (!isMercadoPagoServerConfigured()) {
      return NextResponse.json(
        { error: "Mercado Pago no configurado (MERCADOPAGO_ACCESS_TOKEN)." },
        { status: 503 },
      );
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Iniciá sesión para pagar." }, { status: 401 });
    }

    let body: Body = {};
    try {
      body = (await request.json()) as Body;
    } catch {
      return NextResponse.json({ error: "Datos de pago inválidos." }, { status: 400 });
    }

    const orderId = body.orderId?.trim();
    if (!orderId) {
      return NextResponse.json({ error: "Falta la orden de compra." }, { status: 400 });
    }

    const db = createServiceRoleClient();
    const { data: orderRaw, error: orderError } = await db
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("buyer_id", user.id)
      .maybeSingle();

    if (orderError || !orderRaw) {
      return NextResponse.json({ error: "No encontramos tu orden de compra." }, { status: 404 });
    }

    const order = orderRaw as Record<string, unknown>;
    const status = typeof order.status === "string" ? order.status : "";
    if (!OPEN_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "Esta orden ya no está pendiente de pago." },
        { status: 409 },
      );
    }

    const productTitle = typeof order.product_title === "string" ? order.product_title : "Producto";
    const productPrice = Number(order.product_price) || 0;
    const shippingFee = Number(order.shipping_fee) || 0;
    const totalAmount = Number(order.total_amount) || productPrice + shippingFee;

    if (totalAmount <= 0) {
      return NextResponse.json({ error: "El total de la compra no es válido." }, { status: 400 });
    }

    const siteOrigin = resolveSiteOrigin(request);
    const { preferenceId, initPoint, error } = await createMercadoPagoPreference({
      orderId,
      productTitle,
      productPrice,
      shippingFee,
      totalAmount,
      payerEmail: user.email,
      siteOrigin,
    });

    if (error || !initPoint) {
      return NextResponse.json({ error: error ?? "No se pudo iniciar el pago." }, { status: 502 });
    }

    if (preferenceId) {
      await db.from("orders").update({ mp_preference_id: preferenceId }).eq("id", orderId);
    }

    return NextResponse.json({ initPoint, preferenceId });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al crear el pago.";
    if (message.includes("SERVICE_ROLE")) {
      return NextResponse.json(
        { error: "Pagos no configurados en el servidor (SUPABASE_SERVICE_ROLE_KEY)." },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
