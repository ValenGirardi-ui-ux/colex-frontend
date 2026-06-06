"use server";

import { displayNameFromEmail } from "@/src/lib/auth-profile";
import { assertAdminAction } from "@/src/lib/admin-action";
import { createServiceRoleClient } from "@/src/lib/supabase/admin-service";
import type { AdminCreateUserInput, AdminUserRow } from "@/src/types/admin";
import type { ProfileRow } from "@/src/types/profile";

const ADMIN_PROFILE_SELECT =
  "id,email,username,full_name,is_premium,is_featured,shop_slug,created_at" as const;

type ActionResult<T> = { data: T; error: string | null };

function rowToAdminUser(row: ProfileRow): AdminUserRow {
  return {
    id: row.id,
    email: row.email?.trim() || null,
    fullName: row.full_name?.trim() || null,
    username: row.username?.trim() || null,
    createdAt: row.created_at ?? null,
    isPremium: row.is_premium === true,
    isFeatured: row.is_featured === true,
    shopSlug: row.shop_slug?.trim() || null,
  };
}

function profileFromUnknown(data: unknown): ProfileRow | null {
  if (!data || typeof data !== "object") return null;
  const r = data as Record<string, unknown>;
  const id = typeof r.id === "string" ? r.id : null;
  if (!id) return null;
  return {
    id,
    email: typeof r.email === "string" ? r.email : null,
    username: typeof r.username === "string" ? r.username : null,
    full_name: typeof r.full_name === "string" ? r.full_name : null,
    phone: null,
    institution: null,
    bio: null,
    location: null,
    is_premium: r.is_premium === true,
    is_featured: r.is_featured === true,
    shop_slug: typeof r.shop_slug === "string" ? r.shop_slug : null,
    created_at: typeof r.created_at === "string" ? r.created_at : undefined,
    updated_at: null,
  };
}

export async function adminListUsers(): Promise<ActionResult<AdminUserRow[]>> {
  try {
    await assertAdminAction();
    const db = createServiceRoleClient();
    const { data, error } = await db
      .from("profiles")
      .select(ADMIN_PROFILE_SELECT)
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) return { data: [], error: error.message };

    const users: AdminUserRow[] = [];
    for (const raw of data ?? []) {
      const row = profileFromUnknown(raw);
      if (row) users.push(rowToAdminUser(row));
    }
    return { data: users, error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : "No autorizado.";
    return { data: [], error: message };
  }
}

export async function adminSetUserPremium(
  userId: string,
  isPremium: boolean,
): Promise<ActionResult<AdminUserRow | null>> {
  try {
    await assertAdminAction();
    const db = createServiceRoleClient();
    const { data, error } = await db
      .from("profiles")
      .update({ is_premium: isPremium })
      .eq("id", userId)
      .select(ADMIN_PROFILE_SELECT)
      .maybeSingle();

    if (error) return { data: null, error: error.message };
    const row = profileFromUnknown(data);
    return { data: row ? rowToAdminUser(row) : null, error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : "No autorizado." };
  }
}

export async function adminSetUserFeatured(
  userId: string,
  isFeatured: boolean,
): Promise<ActionResult<AdminUserRow | null>> {
  try {
    await assertAdminAction();
    const db = createServiceRoleClient();
    const { data, error } = await db
      .from("profiles")
      .update({ is_featured: isFeatured })
      .eq("id", userId)
      .select(ADMIN_PROFILE_SELECT)
      .maybeSingle();

    if (error) return { data: null, error: error.message };
    const row = profileFromUnknown(data);
    return { data: row ? rowToAdminUser(row) : null, error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : "No autorizado." };
  }
}

export async function adminCreateUser(
  input: AdminCreateUserInput,
): Promise<ActionResult<AdminUserRow | null>> {
  try {
    await assertAdminAction();

    const email = input.email.trim().toLowerCase();
    const fullName = input.fullName.trim();
    const password = input.password;

    if (!email || !email.includes("@")) {
      return { data: null, error: "Ingresá un email válido." };
    }
    if (password.length < 6) {
      return { data: null, error: "La contraseña debe tener al menos 6 caracteres." };
    }
    if (!fullName) {
      return { data: null, error: "Ingresá el nombre del usuario." };
    }

    const db = createServiceRoleClient();
    const { data: authData, error: authError } = await db.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (authError || !authData.user) {
      return { data: null, error: authError?.message ?? "No se pudo crear el usuario." };
    }

    const userId = authData.user.id;
    const username = displayNameFromEmail(email);

    const { data: profile, error: profileError } = await db
      .from("profiles")
      .upsert(
        {
          id: userId,
          email,
          full_name: fullName,
          username,
          is_premium: false,
          is_featured: false,
        },
        { onConflict: "id" },
      )
      .select(ADMIN_PROFILE_SELECT)
      .maybeSingle();

    if (profileError) {
      return { data: null, error: profileError.message };
    }

    const row = profileFromUnknown(profile);
    return { data: row ? rowToAdminUser(row) : null, error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : "No autorizado." };
  }
}
