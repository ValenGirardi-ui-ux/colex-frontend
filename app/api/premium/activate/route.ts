import { NextResponse } from "next/server";
import { activatePremiumSubscription } from "@/src/services/premium-billing-server";
import { createServerSupabaseClient } from "@/src/lib/supabase/server";
import { formatPremiumDateEs } from "@/src/lib/premium-billing";

type Body = {
  paymentMethod?: string;
  provider?: string;
};

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Iniciá sesión." }, { status: 401 });
    }

    let body: Body = {};
    try {
      body = (await request.json()) as Body;
    } catch {
      body = {};
    }

    const provider = (body.provider ?? body.paymentMethod ?? "card").trim() || "card";
    const paymentRef = `pay_${user.id}_${Date.now()}`;

    const { error, periodEnd } = await activatePremiumSubscription(user.id, {
      provider,
      paymentRef,
    });

    if (error) {
      const m = error.toLowerCase();
      if (m.includes("service_role") || m.includes("supabase_service")) {
        return NextResponse.json(
          { error: "Premium no configurado en el servidor (SUPABASE_SERVICE_ROLE_KEY)." },
          { status: 503 },
        );
      }
      if (m.includes("premium_")) {
        return NextResponse.json(
          {
            error:
              "Falta la migración de suscripción Premium. Ejecutá supabase/migrations/20260516600000_premium_subscription.sql.",
          },
          { status: 503 },
        );
      }
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      periodEnd,
      periodEndLabel: formatPremiumDateEs(periodEnd),
      message: periodEnd
        ? `Premium activo. Próximo cobro el ${formatPremiumDateEs(periodEnd)} (mismo día cada mes).`
        : "Premium activado.",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al activar Premium.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
