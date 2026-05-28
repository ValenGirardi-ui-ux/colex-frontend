"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { SiteHeader } from "../components/site-header";
import { formatAuthErrorForUser, signIn } from "@/src/services/auth";

function safeReturnPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/perfil";
  return raw;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = safeReturnPath(searchParams.get("next"));
  const passwordResetOk = searchParams.get("reset") === "ok";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFeedback(null);
    if (!email.trim() || !password.trim()) {
      setFeedback({ type: "error", text: "Completá email y contraseña." });
      return;
    }
    setBusy(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        setFeedback({ type: "error", text: error });
        return;
      }
      setFeedback({ type: "success", text: "Ingresaste correctamente. Redirigiendo…" });
      router.refresh();
      router.push(returnTo);
    } catch (unexpected) {
      console.error("[Colex login] error inesperado", unexpected);
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

  return (
    <div className="min-h-screen bg-[#F6F6F6] text-zinc-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1240px] px-4 py-8 lg:px-6 lg:py-10">
        <section className="mx-auto w-full max-w-md rounded-3xl border border-zinc-200/90 bg-white p-6 sm:p-7">
          <h1 className="text-3xl font-semibold tracking-tight text-[#822020] sm:text-4xl">Iniciar sesión</h1>
          <p className="mt-2 text-sm text-zinc-600 sm:text-base">
            Accedé a tu cuenta para seguir comprando y vendiendo en Colex.
          </p>

          {passwordResetOk ? (
            <p
              className="mt-4 rounded-xl border border-green-700/25 bg-green-700/10 px-3 py-2 text-sm text-green-900"
              role="status"
            >
              Tu contraseña fue actualizada. Iniciá sesión con la nueva contraseña.
            </p>
          ) : null}

          <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-600">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="h-11 w-full rounded-xl border border-zinc-300 px-3 outline-none transition focus:border-[#822020]"
                placeholder="tu@email.com"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block text-zinc-600">Contraseña</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="h-11 w-full rounded-xl border border-zinc-300 px-3 outline-none transition focus:border-[#822020]"
                placeholder="********"
              />
            </label>

            <div className="-mt-2 flex justify-end">
              <Link
                href="/login/olvide"
                className="text-sm font-medium text-[#822020] hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#822020] px-6 text-sm font-semibold text-white transition hover:bg-[#6d1b1b] disabled:opacity-60"
            >
              {busy ? "Entrando…" : "Entrar"}
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

          <p className="mt-5 text-sm text-zinc-600">
            ¿No tenés cuenta?{" "}
            <Link href="/registro" className="font-semibold text-[#822020] hover:underline">
              Registrate
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
