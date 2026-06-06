"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  adminHideReportedProduct,
  adminListReports,
  adminMarkReportReviewed,
} from "@/src/services/admin-reports";
import type { AdminReportRow } from "@/src/types/admin";
import {
  AdminFeedback,
  adminInputClass,
  formatAdminDate,
} from "@/app/admin/admin-shared";

export function AdminReportsSection() {
  const [reports, setReports] = useState<AdminReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "reviewed">("all");

  const load = useCallback(async () => {
    setLoading(true);
    setFeedback(null);
    const { data, error } = await adminListReports();
    if (error) {
      setFeedback({ type: "err", text: error });
      setReports([]);
    } else {
      setReports(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    let list = reports;
    if (filter === "pending") list = list.filter((r) => r.status === "pending");
    if (filter === "reviewed") list = list.filter((r) => r.status === "reviewed");
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((r) => {
      const blob = [
        r.productTitle,
        r.productId,
        r.reporterEmail,
        r.reporterId,
        r.reason,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [reports, query, filter]);

  async function handleReviewed(reportId: string) {
    setBusyId(reportId);
    setFeedback(null);
    const { error } = await adminMarkReportReviewed(reportId);
    setBusyId(null);
    if (error) {
      setFeedback({ type: "err", text: error });
      return;
    }
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? { ...r, status: "reviewed", reviewedAt: new Date().toISOString() }
          : r,
      ),
    );
    setFeedback({ type: "ok", text: "Reporte marcado como revisado." });
  }

  async function handleHide(productId: string, reportId: string) {
    if (!window.confirm("¿Pausar la publicación reportada?")) return;
    setBusyId(reportId);
    setFeedback(null);
    const { error } = await adminHideReportedProduct(productId);
    setBusyId(null);
    if (error) {
      setFeedback({ type: "err", text: error });
      return;
    }
    setFeedback({ type: "ok", text: "Publicación pausada." });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Reportes</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Revisá denuncias de publicaciones y tomá acción desde admin.
        </p>

        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por publicación, motivo o usuario…"
            className={adminInputClass}
          />
          <div className="flex shrink-0 flex-wrap gap-2">
            {(
              [
                ["all", "Todos"],
                ["pending", "Pendientes"],
                ["reviewed", "Revisados"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  filter === value
                    ? "bg-[#822020] text-white"
                    : "border border-zinc-200 text-zinc-700 hover:border-[#822020]/30"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="shrink-0 rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-800 transition hover:border-[#822020]/30 disabled:opacity-60"
          >
            Actualizar
          </button>
        </div>

        {feedback ? (
          <div className="mt-4">
            <AdminFeedback feedback={feedback} />
          </div>
        ) : null}
      </section>

      <section className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white">
        {loading ? (
          <p className="p-8 text-center text-sm text-zinc-500">Cargando reportes…</p>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-zinc-500">No hay reportes para mostrar.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="border-b border-zinc-100 bg-zinc-50/80 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Publicación</th>
                  <th className="px-4 py-3">Reportó</th>
                  <th className="px-4 py-3">Motivo</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filtered.map((report) => {
                  const busy = busyId === report.id;
                  const pending = report.status === "pending";
                  return (
                    <tr key={report.id} className="hover:bg-zinc-50/50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-zinc-900">{report.productTitle}</p>
                        <Link
                          href={`/producto/${encodeURIComponent(report.productId)}`}
                          className="text-xs font-medium text-[#822020] hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Ver publicación
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-zinc-900">{report.reporterEmail ?? "Anónimo"}</p>
                        {report.reporterId ? (
                          <p className="font-mono text-[11px] text-zinc-400">{report.reporterId}</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-zinc-700">{report.reason}</td>
                      <td className="px-4 py-3 text-zinc-600">{formatAdminDate(report.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                            pending
                              ? "bg-amber-50 text-amber-900 ring-amber-200/80"
                              : "bg-zinc-100 text-zinc-700 ring-zinc-200/80"
                          }`}
                        >
                          {pending ? "Pendiente" : "Revisado"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {pending ? (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void handleReviewed(report.id)}
                              className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-800 transition hover:border-[#822020]/30 disabled:opacity-60"
                            >
                              Marcar revisado
                            </button>
                          ) : null}
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void handleHide(report.productId, report.id)}
                            className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-900 transition hover:bg-amber-100 disabled:opacity-60"
                          >
                            Pausar publicación
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="border-t border-zinc-100 px-4 py-3 text-xs text-zinc-500">
          Mostrando {filtered.length} de {reports.length} reportes (máx. 300 más recientes).
        </p>
      </section>
    </div>
  );
}
