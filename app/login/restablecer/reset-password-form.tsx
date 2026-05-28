"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/app/components/site-header";
import { formatAuthErrorForUser, updatePasswordAfterRecovery } from "@/src/services/auth";
import { supabase } from "@/src/lib/supabase/client";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [sessionReady, setSessionReady] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      setHasRecoverySession(Boolean(session));
      setSessionReady(true);
    }

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setHasRecoverySession(Boolean(session));
        setSessionReady(true);
      }
    });

    void checkSession();

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFeedback(null);

    if (!password.trim() || !repeatPassword.trim()) {
      setFeedback({ type: "error", text: "Completá ambos campos." });
      return;
    }
    if (password !== repeatPassword) {
      setFeedback({ type: "error", text: "Las contraseñas no coinciden." });
      return;
    }

    setBusy(true);
    try {
      const { error } = await updatePasswordAfterRecovery(password);
      if (error) {
        setFeedback({ type: "error", text: error });
        return;
      }
      setFeedback({ type: "success", text: "Contraseña actualizada. Redirigiendo al login…" });
      await supabase.auth.signOut();
      setTimeout(() => {
        router.push("/login?reset=ok");
      }, 1200);
    } catch (unexpected) {
      setFeedback({
        type: "error",
        text: formatAuthErrorForUser(
          unexpected instanceof Error ? unexpected.message : String(unexpected),
        ),
      });
    } finally {
      setBusy(false);
    }
  }

  const feedbackClass =
    feedback?.type === "success"
      ? "border-green-700/25 bg-green-700/10 text-green-900"
      : "border-[#822020]/25 bg-[#822020]/10 text-[#6d1b1b]";

  if (!sessionReady) {
    return (
      <div className="min-h-screen bg-[#F6F6F6] text-zinc-900">
        <SiteHeader />
        <main className="mx-auto max-w-md px-4 py-16 text-center text-sm text-zinc-600">Cargando…</main>
      </div>
    );
  }

  if (!hasRecoverySession) {
    return (
      <div className="min-h-screen bg-[#F6F6F6] text-zinc-900">
        <SiteHeader />
        <main className="mx-auto w-full max-w-md px-4 py-16 text-center">
          <p className="text-sm text-zinc-600 sm:text-base">
            El enlace no es válido o ya expiró. Pedí uno nuevo para restablecer tu contraseña.
          </p>
          <Link
            href="/login/olvide"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[#822020] px-6 text-sm font-semibold text-white hover:bg-[#6d1b1b]"
          >
            Pedir nuevo enlace
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F6F6] text-zinc-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1240px] px-4 py-8 lg:px-6 lg:py-10">
        <section className="mx-auto w-full max-w-md rounded-3xl border border-zinc-200/90 bg-white p-6 sm:p-7">
          <h1 className="text-3xl font-semibold tracking-tight text-[#822020] sm:text-4xl">
            Nueva contraseña
          </h1>
          <p className="mt-2 text-sm text-zinc-600 sm:text-base">Elegí una contraseña nueva para tu cuenta.</p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-600">Contraseña nueva</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="h-11 w-full rounded-xl border border-zinc-300 px-3 outline-none transition focus:border-[#822020]"
                placeholder="Mínimo 6 caracteres"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block text-zinc-600">Repetir contraseña</span>
              <input
                type="password"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                autoComplete="new-password"
                className="h-11 w-full rounded-xl border border-zinc-300 px-3 outline-none transition focus:border-[#822020]"
                placeholder="********"
              />
            </label>

            <button
              type="submit"
              disabled={busy}
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#822020] px-6 text-sm font-semibold text-white transition hover:bg-[#6d1b1b] disabled:opacity-60"
            >
              {busy ? "Guardando…" : "Guardar contraseña"}
            </button>

            {feedback ? (
              <p
                className={`rounded-xl border px-3 py-2 text-sm leading-relaxed ${feedbackClass}`}
                role={feedback.type === "error" ? "alert" : "status"}
              >
                {feedback.text}
              </p>
            ) : null}
          </form>
        </section>
      </main>
    </div>
  );
}
