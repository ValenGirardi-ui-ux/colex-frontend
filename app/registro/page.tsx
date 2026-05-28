"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SiteHeader } from "../components/site-header";
import { formatAuthErrorForUser, registerWithEmail } from "@/src/services/auth";

export default function RegistroPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; text: string } | null>(
    null,
  );
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFeedback(null);

    if (!fullName.trim() || !email.trim() || !password.trim() || !repeatPassword.trim()) {
      setFeedback({ type: "error", text: "Completá todos los campos." });
      return;
    }

    if (password !== repeatPassword) {
      setFeedback({ type: "error", text: "Las contraseñas no coinciden." });
      return;
    }

    setBusy(true);
    try {
      const { error, sessionActive } = await registerWithEmail(email, password, fullName.trim());

      if (error) {
        setFeedback({ type: "error", text: error });
        return;
      }

      if (sessionActive) {
        setFeedback({ type: "success", text: "¡Cuenta creada! Redirigiendo…" });
        router.refresh();
        router.push("/perfil");
        return;
      }

      setFeedback({
        type: "success",
        text: "¡Registro exitoso! Si tu proyecto tiene confirmación por email, revisá tu bandeja y luego iniciá sesión. Te llevamos al login.",
      });
      setTimeout(() => {
        router.push("/login");
      }, 2600);
    } catch (unexpected) {
      console.error("[Colex registro] error inesperado", unexpected);
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
          <h1 className="text-3xl font-semibold tracking-tight text-[#822020] sm:text-4xl">Crear cuenta</h1>
          <p className="mt-2 text-sm text-zinc-600 sm:text-base">Registrate para publicar, comprar y guardar favoritos.</p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-600">Nombre completo</span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                className="h-11 w-full rounded-xl border border-zinc-300 px-3 outline-none transition focus:border-[#822020]"
                placeholder="Nombre y apellido"
              />
            </label>

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
                autoComplete="new-password"
                className="h-11 w-full rounded-xl border border-zinc-300 px-3 outline-none transition focus:border-[#822020]"
                placeholder="********"
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
              {busy ? "Registrando…" : "Registrarme"}
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
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="font-semibold text-[#822020] hover:underline">
              Iniciá sesión
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
