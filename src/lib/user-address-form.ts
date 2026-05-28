import { validateAddressForHomeDelivery } from "@/src/lib/cordoba-shipping";
import type { UserAddress } from "@/src/types/address";

export type AddressFormFields = {
  label: string;
  street: string;
  street_number: string;
  address_notes: string;
  city: string;
  region: string;
  postal_code: string;
  country: string;
};

export const EMPTY_ADDRESS_FORM: AddressFormFields = {
  label: "",
  street: "",
  street_number: "",
  address_notes: "",
  city: "",
  region: "Córdoba",
  postal_code: "",
  country: "Argentina",
};

export function composeAddressLine1(fields: Pick<AddressFormFields, "street" | "street_number" | "address_notes">): string {
  const streetPart = [fields.street.trim(), fields.street_number.trim()].filter(Boolean).join(" ");
  const notes = fields.address_notes.trim();
  if (!streetPart) return notes;
  return notes ? `${streetPart}, ${notes}` : streetPart;
}

export function addressToFormFields(address: UserAddress): AddressFormFields {
  const street = address.street?.trim() || "";
  const street_number = address.street_number?.trim() || "";
  if (street || street_number) {
    return {
      label: address.label,
      street,
      street_number,
      address_notes: address.address_notes?.trim() ?? "",
      city: address.city,
      region: address.region,
      postal_code: address.postal_code,
      country: address.country,
    };
  }
  return {
    label: address.label,
    street: address.line1,
    street_number: "",
    address_notes: "",
    city: address.city,
    region: address.region,
    postal_code: address.postal_code,
    country: address.country,
  };
}

export function formatAddressDisplayLine(address: UserAddress): string {
  const composed = composeAddressLine1({
    street: address.street ?? "",
    street_number: address.street_number ?? "",
    address_notes: address.address_notes ?? "",
  });
  return composed || address.line1;
}

export function validateAddressFormFields(
  fields: AddressFormFields,
): { ok: true; line1: string } | { ok: false; error: string } {
  const label = fields.label.trim();
  const street = fields.street.trim();
  const street_number = fields.street_number.trim();
  const city = fields.city.trim();
  const region = fields.region.trim();
  const postal_code = fields.postal_code.trim();

  if (!label) {
    return { ok: false, error: "Ingresá un nombre para la dirección (ej. Casa)." };
  }
  if (!street) {
    return { ok: false, error: "Ingresá la calle." };
  }
  if (!street_number) {
    return { ok: false, error: "Ingresá el número." };
  }
  if (!city || !region || !postal_code) {
    return { ok: false, error: "Completá ciudad, provincia y código postal." };
  }

  const line1 = composeAddressLine1(fields);
  if (line1.length < 4) {
    return { ok: false, error: "Completá calle y número con datos reales." };
  }

  const shipping = validateAddressForHomeDelivery({ line1, city, region });
  if (!shipping.valid && shipping.error) {
    return { ok: false, error: shipping.error };
  }

  return { ok: true, line1 };
}

/** Dirección persistida con datos mínimos para envío a domicilio (excluye filas vacías o incompletas). */
export function isCompleteSavedAddress(address: UserAddress): boolean {
  return validateAddressFormFields(addressToFormFields(address)).ok;
}

export function filterCompleteSavedAddresses(addresses: UserAddress[]): UserAddress[] {
  return addresses.filter(isCompleteSavedAddress);
}

export function formFieldsToPayload(fields: AddressFormFields) {
  const line1 = composeAddressLine1(fields);
  return {
    label: fields.label.trim(),
    line1,
    street: fields.street.trim(),
    street_number: fields.street_number.trim(),
    address_notes: fields.address_notes.trim() || null,
    city: fields.city.trim(),
    region: fields.region.trim(),
    postal_code: fields.postal_code.trim(),
    country: fields.country.trim() || "Argentina",
  };
}
