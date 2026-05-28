import Link from "next/link";
import type { AdminEnvRuntimeDebug } from "@/src/lib/admin-env-runtime";
import type { AdminAccessDebugInfo } from "@/src/lib/admin-guard";

function DebugRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-zinc-100 py-3 sm:grid-cols-[11rem_1fr] sm:gap-4">
      <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</dt>
      <dd className="min-w-0 break-all font-mono text-sm text-zinc-900">{value}</dd>
    </div>
  );
}

type AdminAccessDebugPanelProps = {
  debug: AdminAccessDebugInfo;
  runtime: AdminEnvRuntimeDebug;
  title?: string;
};

export function AdminAccessDebugPanel({
  debug,
  runtime,
  title = "Acceso a /admin denegado",
}: AdminAccessDebugPanelProps) {
  const detectedKeys =
    runtime.detectedEnvKeys.length > 0 ? runtime.detectedEnvKeys.join(", ") : "(ninguna en process.env)";

  return (
    <div className="min-h-screen bg-[#F6F6F6] px-4 py-10 text-zinc-900 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Debug · servidor</p>
          <h1 className="mt-2 text-xl font-bold text-zinc-900 sm:text-2xl">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
            Solo nombres de variables y flags; nunca se muestran valores secretos. En Vercel: marcá las vars para{" "}
            <strong>Production</strong> y redeployá tras cambiarlas.
          </p>

          <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-zinc-700">Runtime / env</h2>
          <dl className="mt-2">
            <DebugRow label="NODE_ENV" value={runtime.nodeEnv ?? "—"} />
            <DebugRow label="VERCEL_ENV" value={runtime.vercelEnv ?? "—"} />
            <DebugRow label="NEXT_RUNTIME" value={runtime.runtime} />
            <DebugRow label="detectedEnvKeys" value={detectedKeys} />
            <DebugRow
              label="COLEX_ADMIN_EMAILS"
              value={`present=${String(runtime.envPresent.COLEX_ADMIN_EMAILS)} · length=${runtime.envValueLength.COLEX_ADMIN_EMAILS}`}
            />
            <DebugRow
              label="COLEX_ADMIN_USER_IDS"
              value={`present=${String(runtime.envPresent.COLEX_ADMIN_USER_IDS)} · length=${runtime.envValueLength.COLEX_ADMIN_USER_IDS}`}
            />
            <DebugRow
              label="SUPABASE_SERVICE_ROLE_KEY"
              value={`present=${String(runtime.envPresent.SUPABASE_SERVICE_ROLE_KEY)} · length=${runtime.envValueLength.SUPABASE_SERVICE_ROLE_KEY}`}
            />
            <DebugRow
              label="NEXT_PUBLIC_SUPABASE_URL"
              value={String(runtime.envPresent.NEXT_PUBLIC_SUPABASE_URL)}
            />
            <DebugRow
              label="NEXT_PUBLIC_SUPABASE_ANON_KEY"
              value={String(runtime.envPresent.NEXT_PUBLIC_SUPABASE_ANON_KEY)}
            />
          </dl>

          <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-zinc-700">Admin guard</h2>
          <dl className="mt-2">
            <DebugRow label="reason" value={debug.reason} />
            <DebugRow label="step" value={debug.step} />
            <DebugRow label="hasSession" value={debug.hasSession ? "true" : "false"} />
            <DebugRow label="userEmail" value={debug.userEmail ?? "—"} />
            <DebugRow label="userId" value={debug.userId ?? "—"} />
            <DebugRow
              label="allowedEmails (parsed)"
              value={debug.allowedEmails.length ? debug.allowedEmails.join(", ") : "(vacío)"}
            />
            <DebugRow
              label="allowedUserIds (parsed)"
              value={debug.allowedUserIds.length ? debug.allowedUserIds.join(", ") : "(vacío)"}
            />
            <DebugRow label="hasServiceRoleKey" value={debug.hasServiceRoleKey ? "true" : "false"} />
          </dl>

          <p className="mt-4 text-xs text-zinc-500">
            Si <code className="rounded bg-zinc-100 px-1">length</code> &gt; 0 pero{" "}
            <code className="rounded bg-zinc-100 px-1">allowedUserIds (parsed)</code> está vacío, el UUID en Vercel
            no pasó validación. Si <code className="rounded bg-zinc-100 px-1">detectedEnvKeys</code> no lista
            COLEX_ADMIN_*, Vercel no inyectó esas variables en este deployment.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex rounded-full bg-[#822020] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6d1b1b]"
            >
              Ir a login
            </Link>
            <Link
              href="/admin"
              className="inline-flex rounded-full border border-[#822020]/35 px-5 py-2.5 text-sm font-semibold text-[#822020] transition hover:bg-[#822020]/[0.06]"
            >
              Probar /admin
            </Link>
            <Link
              href="/"
              className="inline-flex rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-300"
            >
              Inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
