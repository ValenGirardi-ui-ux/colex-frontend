import { createClient } from "@supabase/supabase-js";
import { hasSupabaseEnv, supabaseUrl } from "@/src/lib/supabase/client";

/** Cliente con service role — solo en servidor, nunca importar desde componentes cliente. */
export function createServiceRoleClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!hasSupabaseEnv || !key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY no configurada.");
  }

  return createClient(supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
