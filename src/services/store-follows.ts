import { displayNameFromEmail } from "@/src/lib/auth-profile";
import { premiumShopPath, profileHasPublishedShop } from "@/src/lib/premium-shop";
import { getCurrentUser } from "@/src/services/auth";
import { isUserUuid, sellerProfilePath } from "@/src/services/profiles";
import { hasSupabaseEnv, supabase } from "@/src/lib/supabase/client";
import type { FollowedStore, StoreFollowState } from "@/src/types/store-follow";
import type { ProfileRow } from "@/src/types/profile";

export function isStoreFollowsSchemaError(message: string | null | undefined): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  return (
    m.includes("store_followers") &&
    (m.includes("schema cache") || m.includes("does not exist") || m.includes("could not find"))
  );
}

export function formatStoreFollowErrorForUser(message: string): string {
  if (isStoreFollowsSchemaError(message)) {
    return "Falta configurar seguir tiendas en Supabase. Ejecutá la migración store_followers.";
  }
  const m = message.toLowerCase();
  if (m.includes("store_followers_no_self") || m.includes("follower_id") && m.includes("store_user_id")) {
    return "No podés seguir tu propia tienda.";
  }
  if (m.includes("unique") || m.includes("duplicate")) {
    return "Ya seguís esta tienda.";
  }
  return message || "No se pudo actualizar el seguimiento.";
}

function businessNameFromRow(row: Pick<ProfileRow, "business_name" | "full_name" | "username" | "email">): string {
  const bn = row.business_name?.trim();
  if (bn) return bn;
  const full = row.full_name?.trim();
  if (full) return full;
  const user = row.username?.trim();
  if (user) return user;
  const email = row.email?.trim();
  if (email) return displayNameFromEmail(email);
  return "Tienda";
}

export async function fetchStoreFollowState(
  storeUserId: string,
  viewerUserId?: string | null,
): Promise<StoreFollowState> {
  const isOwnStore = Boolean(viewerUserId && viewerUserId === storeUserId);
  if (!hasSupabaseEnv || !isUserUuid(storeUserId)) {
    return { followerCount: 0, isFollowing: false, isOwnStore };
  }

  const { data: countData, error: countErr } = await supabase.rpc("store_follower_count", {
    p_store_user_id: storeUserId,
  });

  const followerCount =
    countErr || countData == null ? 0 : Number(countData) || 0;

  if (!viewerUserId || !isUserUuid(viewerUserId) || isOwnStore) {
    return { followerCount, isFollowing: false, isOwnStore };
  }

  const { data: following, error: followErr } = await supabase.rpc("is_following_store", {
    p_store_user_id: storeUserId,
  });

  if (followErr && !isStoreFollowsSchemaError(followErr.message)) {
    console.warn("[Colex store-follows] is_following", followErr.message);
  }

  return {
    followerCount,
    isFollowing: following === true,
    isOwnStore,
  };
}

export async function followStore(storeUserId: string): Promise<{ error: string | null }> {
  const user = await getCurrentUser();
  if (!user?.id) return { error: "Iniciá sesión para seguir tiendas." };
  if (!isUserUuid(storeUserId)) return { error: "Tienda no válida." };
  if (user.id === storeUserId) return { error: "No podés seguir tu propia tienda." };
  if (!hasSupabaseEnv) return { error: "Supabase no configurado." };

  const { error } = await supabase.from("store_followers").insert({
    follower_id: user.id,
    store_user_id: storeUserId,
  });

  if (error) return { error: formatStoreFollowErrorForUser(error.message) };
  return { error: null };
}

export async function unfollowStore(storeUserId: string): Promise<{ error: string | null }> {
  const user = await getCurrentUser();
  if (!user?.id) return { error: "Iniciá sesión para dejar de seguir." };
  if (!hasSupabaseEnv) return { error: "Supabase no configurado." };

  const { error } = await supabase
    .from("store_followers")
    .delete()
    .eq("follower_id", user.id)
    .eq("store_user_id", storeUserId);

  if (error) return { error: formatStoreFollowErrorForUser(error.message) };
  return { error: null };
}

const FOLLOWED_STORE_PROFILE_SELECT =
  "id,email,username,full_name,business_name,business_description,avatar_url,shop_slug,is_premium,institution" as const;

export async function fetchFollowedStores(followerUserId: string): Promise<{
  stores: FollowedStore[];
  error: string | null;
}> {
  if (!hasSupabaseEnv || !isUserUuid(followerUserId)) {
    return { stores: [], error: null };
  }

  const { data: follows, error: followErr } = await supabase
    .from("store_followers")
    .select("store_user_id, created_at")
    .eq("follower_id", followerUserId)
    .order("created_at", { ascending: false });

  if (followErr) {
    if (isStoreFollowsSchemaError(followErr.message)) {
      return { stores: [], error: followErr.message };
    }
    return { stores: [], error: followErr.message };
  }

  const storeIds = [...new Set((follows ?? []).map((r) => r.store_user_id).filter(isUserUuid))];
  if (storeIds.length === 0) return { stores: [], error: null };

  const { data: profiles, error: profErr } = await supabase
    .from("profiles")
    .select(FOLLOWED_STORE_PROFILE_SELECT)
    .in("id", storeIds)
    .eq("is_premium", true);

  if (profErr) return { stores: [], error: profErr.message };

  const profileById = new Map<string, ProfileRow>();
  for (const raw of profiles ?? []) {
    if (raw && typeof raw === "object" && typeof (raw as ProfileRow).id === "string") {
      profileById.set((raw as ProfileRow).id, raw as ProfileRow);
    }
  }

  const stores: FollowedStore[] = [];
  for (const row of follows ?? []) {
    const storeUserId = row.store_user_id;
    if (!isUserUuid(storeUserId)) continue;
    const profile = profileById.get(storeUserId);
    if (!profile || !profileHasPublishedShop(profile)) continue;

    const slug = profile.shop_slug?.trim() || null;
    const businessName = businessNameFromRow(profile);
    stores.push({
      storeUserId,
      businessName,
      shopSlug: slug,
      avatarUrl: profile.avatar_url?.trim() || null,
      subtitle: profile.business_description?.trim() || profile.institution?.trim() || null,
      shopHref: slug ? premiumShopPath(slug) : sellerProfilePath(storeUserId),
      profileHref: sellerProfilePath(storeUserId),
      followedAt: typeof row.created_at === "string" ? row.created_at : new Date().toISOString(),
    });
  }

  return { stores, error: null };
}
