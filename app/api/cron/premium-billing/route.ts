import { NextResponse } from "next/server";
import { runPremiumBillingCycle } from "@/src/services/premium-billing-server";

export async function GET(request: Request) {
  const secret = process.env.PREMIUM_CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ error: "PREMIUM_CRON_SECRET no configurado." }, { status: 503 });
  }

  const auth = request.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const headerSecret = request.headers.get("x-cron-secret");
  if (bearer !== secret && headerSecret !== secret) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const result = await runPremiumBillingCycle();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error en ciclo de cobro.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
