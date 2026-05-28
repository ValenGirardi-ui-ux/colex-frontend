import { displayNameFromEmail } from "@/src/lib/auth-profile";
import type { ProfileRow } from "@/src/types/profile";

export function profileDisplayName(profile: ProfileRow | null, fallback = "Usuario"): string {
  if (!profile) return fallback;
  const full = profile.full_name?.trim();
  if (full) return full;
  const user = profile.username?.trim();
  if (user) return user.startsWith("@") ? user : `@${user}`;
  const email = profile.email?.trim();
  if (email) return displayNameFromEmail(email);
  return fallback;
}

export function profilePeerSubtitle(profile: ProfileRow | null): string | null {
  const email = profile?.email?.trim();
  return email || null;
}

export function initialsFromLabel(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}
