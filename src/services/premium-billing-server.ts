import { initialPremiumPeriodEnd, nextPremiumPeriodEnd } from "@/src/lib/premium-billing";
import { createServiceRoleClient } from "@/src/lib/supabase/admin-service";

export type PremiumBillingRow = {
  id: string;
  premium_started_at: string | null;
  premium_current_period_end: string | null;
  premium_cancel_at_period_end: boolean;
  premium_payment_provider: string | null;
  premium_payment_ref: string | null;
  email: string | null;
};

const BILLING_SELECT =
  "id,email,premium_started_at,premium_current_period_end,premium_cancel_at_period_end,premium_payment_provider,premium_payment_ref" as const;

/** Activa Premium tras pago (mismo día del mes para renovaciones). */
export async function activatePremiumSubscription(
  userId: string,
  opts: { provider: string; paymentRef: string },
): Promise<{ error: string | null; periodEnd: string | null }> {
  const admin = createServiceRoleClient();
  const startedAt = new Date();
  const periodEnd = initialPremiumPeriodEnd(startedAt);

  const { error } = await admin
    .from("profiles")
    .update({
      is_premium: true,
      premium_started_at: startedAt.toISOString(),
      premium_current_period_end: periodEnd.toISOString(),
      premium_cancel_at_period_end: false,
      premium_last_payment_at: startedAt.toISOString(),
      premium_payment_provider: opts.provider,
      premium_payment_ref: opts.paymentRef,
    })
    .eq("id", userId);

  if (error) return { error: error.message, periodEnd: null };
  return { error: null, periodEnd: periodEnd.toISOString() };
}

/** Simula cobro con tarjeta guardada (integración Stripe pendiente). */
export async function chargePremiumRenewal(
  row: PremiumBillingRow,
): Promise<{ ok: boolean; error: string | null; paymentRef: string | null }> {
  if (!row.premium_payment_ref?.trim()) {
    return { ok: false, error: "Sin método de pago registrado.", paymentRef: null };
  }
  // TODO: Stripe PaymentIntent / Subscription cuando esté conectado.
  const ref = `renew_${row.id}_${Date.now()}`;
  return { ok: true, error: null, paymentRef: ref };
}

export type PremiumBillingRunResult = {
  renewed: string[];
  expired: string[];
  failed: Array<{ userId: string; reason: string }>;
};

/** Procesa vencimientos: baja o cobro + extensión por aniversario. */
export async function runPremiumBillingCycle(now: Date = new Date()): Promise<PremiumBillingRunResult> {
  const admin = createServiceRoleClient();
  const result: PremiumBillingRunResult = { renewed: [], expired: [], failed: [] };

  const { data, error } = await admin
    .from("profiles")
    .select(BILLING_SELECT)
    .eq("is_premium", true)
    .not("premium_current_period_end", "is", null)
    .lte("premium_current_period_end", now.toISOString());

  if (error) {
    throw new Error(error.message);
  }

  for (const raw of data ?? []) {
    const row = raw as PremiumBillingRow;
    const periodEnd = row.premium_current_period_end;
    if (!periodEnd) continue;

    if (row.premium_cancel_at_period_end) {
      const { error: offErr } = await admin
        .from("profiles")
        .update({
          is_premium: false,
          premium_cancel_at_period_end: false,
        })
        .eq("id", row.id);
      if (offErr) {
        result.failed.push({ userId: row.id, reason: offErr.message });
      } else {
        result.expired.push(row.id);
      }
      continue;
    }

    const charge = await chargePremiumRenewal(row);
    if (!charge.ok) {
      const { error: offErr } = await admin
        .from("profiles")
        .update({ is_premium: false })
        .eq("id", row.id);
      if (offErr) {
        result.failed.push({ userId: row.id, reason: `${charge.error}; off: ${offErr.message}` });
      } else {
        result.expired.push(row.id);
        result.failed.push({ userId: row.id, reason: charge.error ?? "Cobro fallido" });
      }
      continue;
    }

    const anchor = row.premium_started_at ? new Date(row.premium_started_at) : new Date(periodEnd);
    const nextEnd = nextPremiumPeriodEnd(anchor, new Date(periodEnd));
    const paidAt = new Date();

    const { error: upErr } = await admin
      .from("profiles")
      .update({
        is_premium: true,
        premium_current_period_end: nextEnd.toISOString(),
        premium_last_payment_at: paidAt.toISOString(),
        premium_payment_ref: charge.paymentRef,
        premium_cancel_at_period_end: false,
      })
      .eq("id", row.id);

    if (upErr) {
      result.failed.push({ userId: row.id, reason: upErr.message });
    } else {
      result.renewed.push(row.id);
    }
  }

  return result;
}
