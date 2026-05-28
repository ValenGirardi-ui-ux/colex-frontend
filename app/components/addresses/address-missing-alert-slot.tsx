"use client";

import { AddressMissingAlert, type AddressMissingAlertVariant } from "@/app/components/addresses/address-missing-alert";
import { useUserSavedAddresses } from "@/app/components/addresses/use-user-saved-addresses";

type AddressMissingAlertSlotProps = {
  variant: AddressMissingAlertVariant;
  onAddAddress?: () => void;
  className?: string;
};

/** Muestra la alerta solo si el usuario autenticado no tiene direcciones completas guardadas. */
export function AddressMissingAlertSlot({ variant, onAddAddress, className }: AddressMissingAlertSlotProps) {
  const { loading, hasSavedAddress, sessionMissing } = useUserSavedAddresses();

  if (loading || sessionMissing || hasSavedAddress) return null;

  return <AddressMissingAlert variant={variant} onAddAddress={onAddAddress} className={className} />;
}
