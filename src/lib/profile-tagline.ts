import { isProfileVerified, type ProfileVerifiedFields } from "@/src/lib/profile-verified";

export type ProfileTaglineFields = ProfileVerifiedFields & {
  business_description?: string | null;
  institution?: string | null;
};

/** Subtítulo bajo el nombre en perfiles premium/destacados (descripción corta o rubro). */
export function profileTaglineFromFields(
  row: ProfileTaglineFields | null | undefined,
): string | null {
  if (!isProfileVerified(row)) return null;
  const description = row?.business_description?.trim();
  if (description) return description;
  const institution = row?.institution?.trim();
  if (institution) return institution;
  return null;
}
