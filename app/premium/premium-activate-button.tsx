"use client";

import { useState } from "react";

export function PremiumActivateButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleActivate() {
    if (status === "loading") return;
    setStatus("loading");
    setMessage(null);
    try {
      const res = await fetch("/api/premium/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: "card", provider: "card" }),
      });
      const data = (await res.json()) as { error?: string; message?: string; periodEndLabel?: string };
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "No se pudo activar Premium.");
        return;
      }
      setStatus("done");
      setMessage(
        data.message ??
          (data.periodEndLabel
            ? `Premium activo. Próximo cobro el ${data.periodEndLabel} (mismo día cada mes).`
            : "Premium activado."),
      );
    } catch {
      setStatus("error");
      setMessage("Error de conexión. Intentá de nuevo.");
    }
  }

  if (status === "done") {
    return (
      <div
        className="rounded-2xl border border-[#822020]/20 bg-[#822020]/[0.06] px-5 py-4 text-center sm:text-left"
        role="status"
      >
        <p className="font-semibold text-[#822020]">¡Premium activado!</p>
        <p className="mt-1 text-sm text-zinc-600">{message}</p>
        <p className="mt-2 text-xs text-zinc-500">
          Podés dar de baja antes del próximo cobro desde Ajustes → Editar mi tienda.
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="space-y-3 text-center sm:text-left">
        <p className="text-sm text-red-700" role="alert">
          {message}
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setMessage(null);
          }}
          className="inline-flex h-12 w-full items-center justify-center rounded-full border border-zinc-300 bg-white px-8 text-sm font-semibold text-zinc-800 sm:w-auto"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={status === "loading"}
      onClick={() => void handleActivate()}
      className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#822020] px-8 text-sm font-semibold text-white transition hover:bg-[#6d1b1b] disabled:cursor-wait disabled:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#822020] sm:w-auto sm:min-w-[240px] sm:text-base"
    >
      {status === "loading" ? "Procesando pago…" : "Activar Premium"}
    </button>
  );
}
