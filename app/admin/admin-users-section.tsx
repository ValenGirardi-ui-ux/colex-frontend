"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  adminCreateUser,
  adminListUsers,
  adminSetUserFeatured,
  adminSetUserPremium,
} from "@/src/services/admin-users";
import type { AdminUserRow } from "@/src/types/admin";
import {
  AdminFeedback,
  AdminToggle,
  adminInputClass,
  formatAdminDate,
} from "@/app/admin/admin-shared";

export function AdminUsersSection() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setFeedback(null);
    const { data, error } = await adminListUsers();
    if (error) {
      setFeedback({ type: "err", text: error });
      setUsers([]);
    } else {
      setUsers(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const blob = [u.email, u.fullName, u.username, u.id, u.shopSlug]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [users, query]);

  async function handlePremium(userId: string, next: boolean) {
    setBusyId(userId);
    setFeedback(null);
    const { data, error } = await adminSetUserPremium(userId, next);
    setBusyId(null);
    if (error || !data) {
      setFeedback({ type: "err", text: error ?? "No se pudo actualizar Premium." });
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === userId ? data : u)));
    setFeedback({ type: "ok", text: next ? "Premium activado." : "Premium desactivado." });
  }

  async function handleFeatured(userId: string, next: boolean) {
    setBusyId(userId);
    setFeedback(null);
    const { data, error } = await adminSetUserFeatured(userId, next);
    setBusyId(null);
    if (error || !data) {
      setFeedback({ type: "err", text: error ?? "No se pudo actualizar destacado." });
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === userId ? data : u)));
    setFeedback({ type: "ok", text: next ? "Negocio destacado activado." : "Negocio destacado desactivado." });
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateBusy(true);
    setFeedback(null);
    const { data, error } = await adminCreateUser({
      email: newEmail,
      password: newPassword,
      fullName: newName,
    });
    setCreateBusy(false);
    if (error || !data) {
      setFeedback({ type: "err", text: error ?? "No se pudo crear el usuario." });
      return;
    }
    setUsers((prev) => [data, ...prev]);
    setNewEmail("");
    setNewPassword("");
    setNewName("");
    setCreateOpen(false);
    setFeedback({ type: "ok", text: "Usuario creado correctamente." });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Usuarios</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Gestioná Premium y negocios destacados.
        </p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por email, nombre o ID…"
            className={adminInputClass}
          />
          <button
            type="button"
            onClick={() => void loadUsers()}
            disabled={loading}
            className="shrink-0 rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-800 transition hover:border-[#822020]/30 disabled:opacity-60"
          >
            Actualizar
          </button>
          <button
            type="button"
            onClick={() => setCreateOpen((o) => !o)}
            className="shrink-0 rounded-full bg-[#822020] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6d1b1b]"
          >
            {createOpen ? "Cerrar alta" : "Agregar usuario"}
          </button>
        </div>

        {feedback ? (
          <div className="mt-4">
            <AdminFeedback feedback={feedback} />
          </div>
        ) : null}
      </section>

      {createOpen ? (
        <section className="rounded-2xl border border-[#822020]/20 bg-white p-5 sm:p-6">
          <h3 className="text-base font-semibold text-zinc-900">Alta manual de usuario</h3>
          <p className="mt-1 text-sm text-zinc-600">
            Crea la cuenta en Auth y el perfil en Colex. El email queda confirmado.
          </p>
          <form onSubmit={handleCreate} className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-zinc-800">Email</span>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className={`mt-1 ${adminInputClass}`}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-zinc-800">Nombre</span>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className={`mt-1 ${adminInputClass}`}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-zinc-800">Contraseña</span>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`mt-1 ${adminInputClass}`}
              />
            </label>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={createBusy}
                className="rounded-full bg-[#822020] px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6d1b1b] disabled:opacity-70"
              >
                {createBusy ? "Creando…" : "Crear usuario"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white">
        {loading ? (
          <p className="p-8 text-center text-sm text-zinc-500">Cargando usuarios…</p>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-zinc-500">No hay usuarios para mostrar.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-zinc-100 bg-zinc-50/80 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Registro</th>
                  <th className="px-4 py-3">Premium</th>
                  <th className="px-4 py-3">Destacado</th>
                  <th className="px-4 py-3">Enlaces</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filtered.map((user) => {
                  const busy = busyId === user.id;
                  return (
                    <tr key={user.id} className="hover:bg-zinc-50/50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-zinc-900">{user.fullName ?? "Sin nombre"}</p>
                        <p className="text-zinc-600">{user.email ?? "Sin email"}</p>
                        <p className="mt-0.5 font-mono text-[11px] text-zinc-400">{user.id}</p>
                      </td>
                      <td className="px-4 py-3 text-zinc-600">{formatAdminDate(user.createdAt)}</td>
                      <td className="px-4 py-3">
                        <AdminToggle
                          checked={user.isPremium}
                          disabled={busy}
                          label={`Premium ${user.fullName ?? user.email ?? user.id}`}
                          onChange={(next) => void handlePremium(user.id, next)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <AdminToggle
                          checked={user.isFeatured}
                          disabled={busy}
                          label={`Destacado ${user.fullName ?? user.email ?? user.id}`}
                          onChange={(next) => void handleFeatured(user.id, next)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <Link
                            href={`/perfil/${encodeURIComponent(user.id)}`}
                            className="font-medium text-[#822020] hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Perfil
                          </Link>
                          {user.shopSlug ? (
                            <Link
                              href={`/tienda/${encodeURIComponent(user.shopSlug)}`}
                              className="font-medium text-[#822020] hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Tienda
                            </Link>
                          ) : null}
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
          Mostrando {filtered.length} de {users.length} perfiles (máx. 500 más recientes).
        </p>
      </section>
    </div>
  );
}
