export type PremiumSubscriptionStatus = {
  isPremium: boolean;
  entitled: boolean;
  cancelAtPeriodEnd: boolean;
  startedAt: string | null;
  currentPeriodEnd: string | null;
  lastPaymentAt: string | null;
  paymentProvider: string | null;
  willAutoRenew: boolean;
};
