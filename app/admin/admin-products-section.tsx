"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  adminDeleteProduct,
  adminListProducts,
  adminSetProductStatus,
} from "@/src/services/admin-products";
import type { AdminProductRow } from "@/src/types/admin";
import {
  AdminFeedback,
  adminInputClass,
  adminStatusBadgeClass,
  adminStatusLabel,
  formatAdminDate,
} from "@/app/admin/admin-shared";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(price);
}

export function AdminProductsSection() {
  const [products, setProducts] = useState<AdminProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setFeedback(null);
    const { data, error } = await adminListProducts();
    if (error) {
      setFeedback({ type: "err", text: error });
      setProducts([]);
    } else {
      setProducts(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const blob = [p.title, p.category, p.sellerEmail, p.sellerName, p.sellerId, p.id]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [products, query]);

  async function handlePause(productId: string) {
    if (!window.confirm("¿Pausar esta publicación? Dejará de verse en el catálogo.")) return;
    setBusyId(productId);
    setFeedback(null);
    const { error } = await adminSetProductStatus(productId, "paused");
    setBusyId(null);
    if (error) {
      setFeedback({ type: "err", text: error });
      return;
    }
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, status: "paused" } : p)),
    );
    setFeedback({ type: "ok", text: "Publicación pausada." });
  }

  async function handleActivate(productId: string) {
    setBusyId(productId);
    setFeedback(null);
    const { error } = await adminSetProductStatus(productId, "active");
    setBusyId(null);
    if (error) {
      setFeedback({ type: "err", text: error });
      return;
    }
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, status: "active" } : p)),
    );
    setFeedback({ type: "ok", text: "Publicación reactivada." });
  }

  async function handleDelete(productId: string, title: string) {
    if (
      !window.confirm(
        `¿Eliminar "${title}"? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }
    setBusyId(productId);
    setFeedback(null);
    const { error } = await adminDeleteProduct(productId);
    setBusyId(null);
    if (error) {
      setFeedback({ type: "err", text: error });
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setFeedback({ type: "ok", text: "Publicación eliminada." });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Publicaciones</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Listá, buscá y moderá publicaciones desde el panel admin.
        </p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título, vendedor o categoría…"
            className={adminInputClass}
          />
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
          <p className="p-8 text-center text-sm text-zinc-500">Cargando publicaciones…</p>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-zinc-500">No hay publicaciones para mostrar.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-zinc-100 bg-zinc-50/80 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Publicación</th>
                  <th className="px-4 py-3">Vendedor</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Precio</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filtered.map((product) => {
                  const busy = busyId === product.id;
                  const isActive = product.status === "active";
                  const isPaused = product.status === "paused";
                  return (
                    <tr key={product.id} className="hover:bg-zinc-50/50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-zinc-900">{product.title}</p>
                        <p className="text-zinc-600">{product.category}</p>
                        <p className="mt-0.5 font-mono text-[11px] text-zinc-400">{product.id}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-zinc-900">{product.sellerName ?? "Sin nombre"}</p>
                        <p className="text-zinc-600">{product.sellerEmail ?? "—"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${adminStatusBadgeClass(product.status)}`}
                        >
                          {adminStatusLabel(product.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-700">{formatPrice(product.price)}</td>
                      <td className="px-4 py-3 text-zinc-600">{formatAdminDate(product.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/producto/${encodeURIComponent(product.id)}`}
                            className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-[#822020] transition hover:border-[#822020]/30"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Abrir
                          </Link>
                          {isActive ? (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void handlePause(product.id)}
                              className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-900 transition hover:bg-amber-100 disabled:opacity-60"
                            >
                              Pausar
                            </button>
                          ) : null}
                          {isPaused ? (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void handleActivate(product.id)}
                              className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-900 transition hover:bg-emerald-100 disabled:opacity-60"
                            >
                              Reactivar
                            </button>
                          ) : null}
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void handleDelete(product.id, product.title)}
                            className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-900 transition hover:bg-red-100 disabled:opacity-60"
                          >
                            Eliminar
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
          Mostrando {filtered.length} de {products.length} publicaciones (máx. 500 más recientes).
        </p>
      </section>
    </div>
  );
}
