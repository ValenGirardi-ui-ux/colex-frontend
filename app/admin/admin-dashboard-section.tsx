"use client";

import { useCallback, useEffect, useState } from "react";
import { adminGetMetrics } from "@/src/services/admin-metrics";
import type { AdminMetrics } from "@/src/types/admin";
import { AdminFeedback } from "@/app/admin/admin-shared";

const EMPTY: AdminMetrics = {
  registeredUsers: 0,
  activeListings: 0,
  pausedListings: 0,
  soldListings: 0,
  premiumShops: 0,
  featuredBusinesses: 0,
  totalOrders: 0,
  pendingReports: 0,
};

function MetricCard({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200/90 bg-white p-5">
      <p className="text-sm font-medium text-zinc-600">{label}</p>
      <p className="mt-2 text-3xl font-bold tabular-nums text-zinc-900">{value.toLocaleString("es-AR")}</p>
      {hint ? <p className="mt-1 text-xs text-zinc-500">{hint}</p> : null}
    </div>
  );
}

export function AdminDashboardSection() {
  const [metrics, setMetrics] = useState<AdminMetrics>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setFeedback(null);
    const { data, error } = await adminGetMetrics();
    if (error) {
      setFeedback({ type: "err", text: error });
      setMetrics(EMPTY);
    } else {
      setMetrics(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Dashboard</h2>
            <p className="mt-1 text-sm text-zinc-600">Resumen rápido de la plataforma.</p>
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

      {loading ? (
        <p className="text-center text-sm text-zinc-500">Cargando métricas…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Usuarios registrados" value={metrics.registeredUsers} />
          <MetricCard label="Publicaciones activas" value={metrics.activeListings} />
          <MetricCard
            label="Publicaciones pausadas"
            value={metrics.pausedListings}
            hint="Ocultas del catálogo"
          />
          <MetricCard label="Publicaciones vendidas" value={metrics.soldListings} />
          <MetricCard label="Tiendas premium" value={metrics.premiumShops} />
          <MetricCard label="Negocios destacados" value={metrics.featuredBusinesses} />
          <MetricCard label="Órdenes totales" value={metrics.totalOrders} />
          <MetricCard
            label="Reportes pendientes"
            value={metrics.pendingReports}
            hint="Requieren revisión"
          />
        </div>
      )}
    </div>
  );
}
