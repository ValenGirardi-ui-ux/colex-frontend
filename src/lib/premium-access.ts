import type { ProfileRow } from "@/src/types/profile";

export type PremiumSubscriptionFields = Pick<
  ProfileRow,
  "is_premium" | "premium_current_period_end" | "premium_cancel_at_period_end"
>;

/** Premium activo con acceso (incluye período pagado aunque haya pedido baja). */
export function isPremiumEntitled(
  profile: PremiumSubscriptionFields | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!profile?.is_premium) return false;
  const endIso = profile.premium_current_period_end;
  if (!endIso?.trim()) return true;
  const end = new Date(endIso);
  if (Number.isNaN(end.getTime())) return true;
  return end.getTime() > now.getTime();
}

/** Cobro automático el mes siguiente (no pidió baja). */
export function willAutoRenewPremium(
  profile: PremiumSubscriptionFields | null | undefined,
): boolean {
  return isPremiumEntitled(profile) && profile?.premium_cancel_at_period_end !== true;
}
