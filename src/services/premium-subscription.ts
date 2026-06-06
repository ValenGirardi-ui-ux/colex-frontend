import { isPremiumEntitled, willAutoRenewPremium } from "@/src/lib/premium-access";
import { getCurrentUser } from "@/src/services/auth";
import { fetchProfileByUserId, isUserUuid } from "@/src/services/profiles";
import { hasSupabaseEnv, supabase } from "@/src/lib/supabase/client";
import type { ProfileRow } from "@/src/types/profile";
import type { PremiumSubscriptionStatus } from "@/src/types/premium-subscription";

const SUBSCRIPTION_SELECT =
  "is_premium,premium_started_at,premium_current_period_end,premium_cancel_at_period_end,premium_last_payment_at,premium_payment_provider" as const;

function rowToStatus(row: ProfileRow | null): PremiumSubscriptionStatus {
  const entitled = isPremiumEntitled(row);
  return {
    isPremium: row?.is_premium === true,
    entitled,
    cancelAtPeriodEnd: row?.premium_cancel_at_period_end === true,
    startedAt: row?.premium_started_at ?? null,
    currentPeriodEnd: row?.premium_current_period_end ?? null,
    lastPaymentAt: row?.premium_last_payment_at ?? null,
    paymentProvider: row?.premium_payment_provider ?? null,
    willAutoRenew: willAutoRenewPremium(row),
  };
}

export async function fetchPremiumSubscriptionStatus(
  userId?: string,
): Promise<{ status: PremiumSubscriptionStatus | null; error: string | null }> {
  if (!hasSupabaseEnv) return { status: null, error: null };

  let id = userId;
  if (!id) {
    const user = await getCurrentUser();
    id = user?.id;
  }
  if (!id || !isUserUuid(id)) {
    return { status: null, error: "Sesión inválida." };
  }

  const { data, error } = await supabase.from("profiles").select(SUBSCRIPTION_SELECT).eq("id", id).maybeSingle();

  if (error) {
    const m = error.message.toLowerCase();
    if (m.includes("premium_") && (m.includes("schema") || m.includes("does not exist"))) {
      return {
        status: { isPremium: false, entitled: false, cancelAtPeriodEnd: false, startedAt: null, currentPeriodEnd: null, lastPaymentAt: null, paymentProvider: null, willAutoRenew: false },
        error: "Falta la migración premium_subscription. Ejecutá supabase/migrations/20260516600000_premium_subscription.sql.",
      };
    }
    return { status: null, error: error.message };
  }

  const row = data as ProfileRow | null;
  return { status: rowToStatus(row), error: null };
}

/** Elimina datos de la tienda publicada (no cancela Premium). */
export async function deletePremiumShopData(): Promise<{ error: string | null }> {
  const user = await getCurrentUser();
  if (!user?.id || !isUserUuid(user.id)) {
    return { error: "Iniciá sesión." };
  }

  const { profile } = await fetchProfileByUserId(user.id);
  if (!isPremiumEntitled(profile)) {
    return { error: "Necesitás Premium activo para gestionar la tienda." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      shop_slug: null,
      shop_banner_url: null,
      shop_description: null,
      shop_social_links: {},
      business_name: null,
      business_description: null,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };
  return { error: null };
}

/** No renovar: mantiene acceso hasta `premium_current_period_end`. */
export async function cancelPremiumAtPeriodEnd(): Promise<{ error: string | null }> {
  const user = await getCurrentUser();
  if (!user?.id || !isUserUuid(user.id)) {
    return { error: "Iniciá sesión." };
  }

  const { profile } = await fetchProfileByUserId(user.id);
  if (!isPremiumEntitled(profile)) {
    return { error: "No tenés Premium activo." };
  }
  if (profile?.premium_cancel_at_period_end) {
    return { error: null };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ premium_cancel_at_period_end: true })
    .eq("id", user.id);

  if (error) return { error: error.message };
  return { error: null };
}

/** Revierte la baja si aún estás en el período pagado. */
export async function resumePremiumAutoRenew(): Promise<{ error: string | null }> {
  const user = await getCurrentUser();
  if (!user?.id || !isUserUuid(user.id)) {
    return { error: "Iniciá sesión." };
  }

  const { profile } = await fetchProfileByUserId(user.id);
  if (!isPremiumEntitled(profile)) {
    return { error: "No tenés Premium activo." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ premium_cancel_at_period_end: false })
    .eq("id", user.id);

  if (error) return { error: error.message };
  return { error: null };
}
