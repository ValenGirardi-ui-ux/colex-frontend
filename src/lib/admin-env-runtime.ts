/** Diagnóstico de env en servidor (sin exponer valores secretos). */
export type AdminEnvRuntimeDebug = {
  nodeEnv: string | null;
  vercelEnv: string | null;
  runtime: "nodejs" | "edge" | "unknown";
  detectedEnvKeys: string[];
  envPresent: {
    COLEX_ADMIN_EMAILS: boolean;
    COLEX_ADMIN_USER_IDS: boolean;
    SUPABASE_SERVICE_ROLE_KEY: boolean;
    NEXT_PUBLIC_SUPABASE_URL: boolean;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: boolean;
  };
  /** Longitud del valor en runtime (0 = ausente o vacío). No expone el contenido. */
  envValueLength: {
    COLEX_ADMIN_EMAILS: number;
    COLEX_ADMIN_USER_IDS: number;
    SUPABASE_SERVICE_ROLE_KEY: number;
  };
};

function envLength(name: string): number {
  return process.env[name]?.length ?? 0;
}

export function getAdminEnvRuntimeDebug(): AdminEnvRuntimeDebug {
  const detectedEnvKeys = Object.keys(process.env)
    .filter((k) => k.includes("COLEX") || k.includes("SUPABASE"))
    .sort();

  return {
    nodeEnv: process.env.NODE_ENV ?? null,
    vercelEnv: process.env.VERCEL_ENV ?? null,
    runtime:
      process.env.NEXT_RUNTIME === "nodejs"
        ? "nodejs"
        : process.env.NEXT_RUNTIME === "edge"
          ? "edge"
          : "unknown",
    detectedEnvKeys,
    envPresent: {
      COLEX_ADMIN_EMAILS: Boolean(process.env.COLEX_ADMIN_EMAILS?.trim()),
      COLEX_ADMIN_USER_IDS: Boolean(process.env.COLEX_ADMIN_USER_IDS?.trim()),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()),
      NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()),
    },
    envValueLength: {
      COLEX_ADMIN_EMAILS: envLength("COLEX_ADMIN_EMAILS"),
      COLEX_ADMIN_USER_IDS: envLength("COLEX_ADMIN_USER_IDS"),
      SUPABASE_SERVICE_ROLE_KEY: envLength("SUPABASE_SERVICE_ROLE_KEY"),
    },
  };
}
