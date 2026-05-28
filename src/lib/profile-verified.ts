/** Perfil con Badge verificado (Premium o destacado en home). */
export type ProfileVerifiedFields = {
  is_premium?: boolean;
  is_featured?: boolean;
};

export function isProfileVerified(profile: ProfileVerifiedFields | null | undefined): boolean {
  if (!profile) return false;
  return profile.is_premium === true || profile.is_featured === true;
}
