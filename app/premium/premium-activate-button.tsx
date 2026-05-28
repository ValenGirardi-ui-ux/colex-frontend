"use client";

import { useState } from "react";

export function PremiumActivateButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  function handleActivate() {
    if (status !== "idle") return;
    setStatus("loading");
    window.setTimeout(() => setStatus("done"), 900);
  }

  if (status === "done") {
    return (
      <div
        className="rounded-2xl border border-[#822020]/20 bg-[#822020]/[0.06] px-5 py-4 text-center sm:text-left"
        role="status"
      >
        <p className="font-semibold text-[#822020]">¡Solicitud registrada!</p>
        <p className="mt-1 text-sm text-zinc-600">
          Pronto vas a poder activar Premium con pago online. Por ahora un asesor de Colex se pondrá en
          contacto para completar tu alta.
        </p>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={status === "loading"}
      onClick={handleActivate}
      className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#822020] px-8 text-sm font-semibold text-white transition hover:bg-[#6d1b1b] disabled:cursor-wait disabled:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#822020] sm:w-auto sm:min-w-[240px] sm:text-base"
    >
      {status === "loading" ? "Procesando…" : "Activar Premium"}
    </button>
  );
}
