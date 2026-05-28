import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { hasSupabaseEnv, supabaseAnonKey, supabaseUrl } from "@/src/lib/supabase/client";

/** Cliente Supabase con sesión del usuario (Server Components / Server Actions). */
export async function createServerSupabaseClient() {
  if (!hasSupabaseEnv) {
    throw new Error("Supabase no configurado.");
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Component: no-op si las cookies son de solo lectura.
        }
      },
    },
  });
}
