import type { Metadata } from "next";
import { AdminAccessDebugPanel } from "@/app/admin/admin-access-debug";
import { getAdminEnvRuntimeDebug } from "@/src/lib/admin-env-runtime";
import { evaluateAdminAccess } from "@/src/lib/admin-guard";
import { getAdminEmails, getAdminUserIds } from "@/src/lib/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Admin Debug · Colex",
  robots: { index: false, follow: false },
};

export default async function AdminDebugPage() {
  const runtimeDebug = getAdminEnvRuntimeDebug();
  const access = await evaluateAdminAccess();

  if (access.allowed) {
    return (
      <AdminAccessDebugPanel
        title="Admin debug — acceso permitido"
        debug={{
          reason: "Acceso permitido: el usuario cumple condiciones de admin.",
          step: "not_admin",
          hasSession: true,
          userEmail: access.user.email ?? null,
          userId: access.user.id,
          allowedEmails: getAdminEmails(),
          allowedUserIds: getAdminUserIds(),
          hasServiceRoleKey: runtimeDebug.envPresent.SUPABASE_SERVICE_ROLE_KEY,
        }}
        runtime={runtimeDebug}
      />
    );
  }

  return (
    <AdminAccessDebugPanel
      title="Admin debug — acceso denegado"
      debug={access.debug}
      runtime={runtimeDebug}
    />
  );
}
