import { supabase } from "@/src/lib/supabase/client";
import type { UserAddress, UserAddressInput } from "@/src/types/address";

const ADDRESS_SELECT =
  "id,user_id,label,line1,street,street_number,address_notes,city,region,postal_code,country,is_default,created_at" as const;

export function isUserAddressesSchemaError(message: string | null | undefined): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  return (
    m.includes("user_addresses") &&
    (m.includes("schema cache") || m.includes("does not exist") || m.includes("could not find"))
  );
}

export function formatAddressErrorForUser(message: string): string {
  if (isUserAddressesSchemaError(message)) {
    return "Falta configurar direcciones en Supabase. Ejecutá supabase/user-addresses-setup.sql.";
  }
  return message || "No pudimos completar la operación. Intentá de nuevo.";
}

function rowFromUnknown(data: unknown): UserAddress | null {
  if (!data || typeof data !== "object") return null;
  const r = data as Record<string, unknown>;
  const id = typeof r.id === "string" ? r.id : null;
  const user_id = typeof r.user_id === "string" ? r.user_id : null;
  if (!id || !user_id) return null;
  return {
    id,
    user_id,
    label: typeof r.label === "string" ? r.label : "",
    line1: typeof r.line1 === "string" ? r.line1 : "",
    street: typeof r.street === "string" ? r.street : null,
    street_number: typeof r.street_number === "string" ? r.street_number : null,
    address_notes: typeof r.address_notes === "string" ? r.address_notes : null,
    city: typeof r.city === "string" ? r.city : "",
    region: typeof r.region === "string" ? r.region : "",
    postal_code: typeof r.postal_code === "string" ? r.postal_code : "",
    country: typeof r.country === "string" ? r.country : "Argentina",
    is_default: Boolean(r.is_default),
    created_at: typeof r.created_at === "string" ? r.created_at : new Date().toISOString(),
  };
}

export async function fetchUserAddresses(userId: string): Promise<{
  addresses: UserAddress[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("user_addresses")
    .select(ADDRESS_SELECT)
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return { addresses: [], error: error.message };
  }

  const addresses = (Array.isArray(data) ? data : [])
    .map(rowFromUnknown)
    .filter((a): a is UserAddress => a != null);

  return { addresses, error: null };
}

export async function createUserAddress(
  userId: string,
  input: UserAddressInput,
): Promise<{ address: UserAddress | null; error: string | null }> {
  const { addresses: existing } = await fetchUserAddresses(userId);
  const isFirst = existing.length === 0;

  const { data, error } = await supabase
    .from("user_addresses")
    .insert({
      user_id: userId,
      label: input.label.trim(),
      line1: input.line1.trim(),
      street: input.street?.trim() || null,
      street_number: input.street_number?.trim() || null,
      address_notes: input.address_notes?.trim() || null,
      city: input.city.trim(),
      region: input.region.trim(),
      postal_code: input.postal_code.trim(),
      country: input.country.trim() || "Argentina",
      is_default: isFirst,
    })
    .select(ADDRESS_SELECT)
    .single();

  if (error) {
    return { address: null, error: error.message };
  }

  return { address: rowFromUnknown(data), error: null };
}

export async function updateUserAddress(
  userId: string,
  addressId: string,
  input: UserAddressInput,
): Promise<{ address: UserAddress | null; error: string | null }> {
  const { data, error } = await supabase
    .from("user_addresses")
    .update({
      label: input.label.trim(),
      line1: input.line1.trim(),
      street: input.street?.trim() || null,
      street_number: input.street_number?.trim() || null,
      address_notes: input.address_notes?.trim() || null,
      city: input.city.trim(),
      region: input.region.trim(),
      postal_code: input.postal_code.trim(),
      country: input.country.trim() || "Argentina",
    })
    .eq("id", addressId)
    .eq("user_id", userId)
    .select(ADDRESS_SELECT)
    .single();

  if (error) {
    return { address: null, error: error.message };
  }

  const address = rowFromUnknown(data);
  if (!address) {
    return { address: null, error: "No se recibió la dirección actualizada." };
  }

  return { address, error: null };
}

export async function deleteUserAddress(
  userId: string,
  addressId: string,
): Promise<{ error: string | null }> {
  const { data: deleted, error } = await supabase
    .from("user_addresses")
    .delete()
    .eq("id", addressId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    return { error: error.message };
  }

  if (!deleted) {
    return { error: "No se encontró la dirección o no tenés permiso para eliminarla." };
  }

  const { addresses } = await fetchUserAddresses(userId);
  if (addresses.length > 0 && !addresses.some((a) => a.is_default)) {
    await supabase
      .from("user_addresses")
      .update({ is_default: true })
      .eq("id", addresses[0]!.id)
      .eq("user_id", userId);
  }

  return { error: null };
}
