"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  PRODUCT_REPORT_REASONS,
  type ProductReportReason,
} from "@/src/lib/product-report-reasons";
import { submitProductReport } from "@/src/services/product-reports";

export { PRODUCT_REPORT_REASONS, type ProductReportReason };

const SUCCESS_MESSAGE =
  "Publicación reportada. Gracias por ayudarnos a mantener Colex seguro.";

type ProductReportMenuProps = {
  productId: string;
};

export function ProductReportMenu({ productId }: ProductReportMenuProps) {
  const menuId = useId();
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [reason, setReason] = useState<ProductReportReason>(PRODUCT_REPORT_REASONS[0]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen && !modalOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (modalOpen) setModalOpen(false);
        else setMenuOpen(false);
      }
    }

    function onPointerDown(e: MouseEvent) {
      if (!menuOpen || modalOpen) return;
      const target = e.target as Node;
      if (rootRef.current && !rootRef.current.contains(target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [menuOpen, modalOpen]);

  function openReportModal() {
    setMenuOpen(false);
    setModalOpen(true);
    setReason(PRODUCT_REPORT_REASONS[0]);
    setSubmitError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    const { ok, error } = await submitProductReport(productId, reason);
    setSubmitting(false);
    if (!ok) {
      setSubmitError(error ?? "No se pudo enviar el reporte.");
      return;
    }
    setModalOpen(false);
    setSubmitted(true);
  }

  return (
    <>
      <div ref={rootRef} className="relative shrink-0">
        <button
          type="button"
          aria-label="Más opciones de la publicación"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#822020] sm:h-11 sm:w-11"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
            <circle cx="6" cy="12" r="1.75" />
            <circle cx="12" cy="12" r="1.75" />
            <circle cx="18" cy="12" r="1.75" />
          </svg>
        </button>

        {menuOpen ? (
          <div
            id={menuId}
            role="menu"
            className="absolute right-0 top-full z-30 mt-2 min-w-[12.5rem] overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-lg"
          >
            <button
              type="button"
              role="menuitem"
              onClick={openReportModal}
              className="flex w-full px-4 py-2.5 text-left text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 hover:text-[#822020]"
            >
              Reportar publicación
            </button>
          </div>
        ) : null}
      </div>

      {modalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-900/45 p-0 sm:items-center sm:p-4"
          role="presentation"
          onClick={() => setModalOpen(false)}
        >
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-publication-title"
            className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-zinc-200 bg-white p-5 shadow-xl sm:rounded-3xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 id="report-publication-title" className="text-lg font-semibold text-zinc-900">
                  Reportar publicación
                </h3>
                <p className="mt-1 text-sm text-zinc-600">Elegí el motivo del reporte.</p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <fieldset className="space-y-2">
              <legend className="sr-only">Motivo del reporte</legend>
              {PRODUCT_REPORT_REASONS.map((option) => (
                <label
                  key={option}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                    reason === option
                      ? "border-[#822020]/40 bg-[#822020]/[0.06] text-zinc-900"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={option}
                    checked={reason === option}
                    onChange={() => setReason(option)}
                    className="h-4 w-4 border-zinc-300 text-[#822020] focus:ring-[#822020]/30"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </fieldset>

            {submitError ? (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
                {submitError}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={submitting}
                className="rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-[#822020] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6d1b1b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#822020] disabled:opacity-70"
              >
                {submitting ? "Enviando…" : "Enviar reporte"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {submitted ? (
        <div
          role="status"
          className="fixed inset-x-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-50 mx-auto max-w-lg rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 shadow-lg sm:bottom-6 lg:bottom-8"
        >
          <div className="flex items-start justify-between gap-3">
            <p>{SUCCESS_MESSAGE}</p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="shrink-0 text-emerald-700/80 transition hover:text-emerald-900"
              aria-label="Cerrar mensaje"
            >
              ×
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
