"use client";

import Link from "next/link";
import { useState } from "react";
import { SiteHeader } from "@/app/components/site-header";
import { formatAuthErrorForUser, requestPasswordReset } from "@/src/services/auth";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFeedback(null);

    if (!email.trim()) {
      setFeedback({ type: "error", text: "Ingresá tu email." });
      return;
    }

    setBusy(true);
    try {
      const { error } = await requestPasswordReset(email);
      if (error) {
        setFeedback({ type: "error", text: error });
        return;
      }
      setSent(true);
      setFeedback({
        type: "success",
        text: "Si existe una cuenta con ese email, te enviamos un enlace para restablecer la contraseña. Revisá tu bandeja y spam.",
      });
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

  return (
    <div className="min-h-screen bg-[#F6F6F6] text-zinc-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1240px] px-4 py-8 lg:px-6 lg:py-10">
        <section className="mx-auto w-full max-w-md rounded-3xl border border-zinc-200/90 bg-white p-6 sm:p-7">
          <h1 className="text-3xl font-semibold tracking-tight text-[#822020] sm:text-4xl">
            Recuperar contraseña
          </h1>
          <p className="mt-2 text-sm text-zinc-600 sm:text-base">
            Te enviaremos un enlace por email para elegir una contraseña nueva.
          </p>

          {sent ? (
            <div className="mt-6 space-y-4">
              {feedback ? (
                <p
                  className={`rounded-xl border px-3 py-2 text-sm leading-relaxed ${feedbackClass}`}
                  role="status"
                >
                  {feedback.text}
                </p>
              ) : null}
              <Link
                href="/login"
                className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#822020] text-sm font-semibold text-white hover:bg-[#6d1b1b]"
              >
                Volver al login
              </Link>
            </div>
          ) : (
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

              <button
                type="submit"
                disabled={busy}
                className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#822020] px-6 text-sm font-semibold text-white transition hover:bg-[#6d1b1b] disabled:opacity-60"
              >
                {busy ? "Enviando…" : "Enviar enlace"}
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
          )}

          {!sent ? (
            <p className="mt-5 text-sm text-zinc-600">
              <Link href="/login" className="font-semibold text-[#822020] hover:underline">
                Volver al login
              </Link>
            </p>
          ) : null}
        </section>
      </main>
    </div>
  );
}
