"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
  notificationHref,
} from "@/src/services/notifications";
import { supabase } from "@/src/lib/supabase/client";
import type { AppNotification } from "@/src/types/notification";

function formatNotificationTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat("es-AR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async (uid: string) => {
    const [listResult, countResult] = await Promise.all([
      fetchNotifications(uid),
      fetchUnreadNotificationCount(uid),
    ]);
    if (!listResult.error) setNotifications(listResult.notifications);
    if (!countResult.error) setUnreadCount(countResult.count);
  }, []);

  useEffect(() => {
    let cancelled = false;

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      const id = session?.user?.id ?? null;
      setUserId(id);
      if (id) void refresh(id);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const id = session?.user?.id ?? null;
      setUserId(id);
      if (id) void refresh(id);
      else {
        setNotifications([]);
        setUnreadCount(0);
      }
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, [refresh]);

  useEffect(() => {
    if (!userId || !open) return;
    setLoading(true);
    void refresh(userId).finally(() => setLoading(false));
  }, [open, userId, refresh]);

  useEffect(() => {
    if (!userId) return;
    const interval = window.setInterval(() => {
      void refresh(userId);
    }, 45_000);
    return () => window.clearInterval(interval);
  }, [userId, refresh]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  async function handleMarkRead(notification: AppNotification) {
    if (!userId || notification.read) return;
    await markNotificationRead(notification.id, userId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }

  async function handleMarkAllRead() {
    if (!userId) return;
    await markAllNotificationsRead(userId);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }

  if (!userId) return null;

  const badge =
    unreadCount > 0 ? (
      <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#822020] px-1 text-[10px] font-bold text-white">
        {unreadCount > 9 ? "9+" : unreadCount}
      </span>
    ) : null;

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={unreadCount > 0 ? `Notificaciones, ${unreadCount} sin leer` : "Notificaciones"}
        aria-expanded={open}
        className="relative p-1.5 text-zinc-800 transition hover:text-[#822020] lg:p-2"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-6 w-6 lg:h-8 lg:w-8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 3C8.13 3 5 6.13 5 10V14.09L3.29 17.29C3.11 17.58 3.32 18 3.67 18H20.33C20.68 18 20.89 17.58 20.71 17.29L19 14.09V10C19 6.13 15.87 3 12 3Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9.5 18C9.86 19.16 10.84 20 12 20C13.16 20 14.14 19.16 14.5 18"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {badge}
      </button>

      {open ? (
        <div
          className="fixed inset-x-3 top-[calc(4.25rem+env(safe-area-inset-top))] z-50 flex max-h-[min(calc(100dvh-7.5rem-env(safe-area-inset-bottom)),28rem)] flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg max-lg:max-w-none lg:absolute lg:inset-x-auto lg:bottom-auto lg:left-auto lg:right-0 lg:top-full lg:mt-2 lg:max-h-80 lg:w-[min(100vw-2rem,22rem)]"
        >
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-zinc-900">Notificaciones</h2>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={() => void handleMarkAllRead()}
                className="text-xs font-medium text-[#822020] hover:underline"
              >
                Marcar todas leídas
              </button>
            ) : null}
          </div>

          {loading ? (
            <p className="px-4 py-6 text-center text-sm text-zinc-500">Cargando…</p>
          ) : notifications.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-zinc-500">No tenés avisos por ahora.</p>
          ) : (
            <ul className="min-h-0 flex-1 overflow-y-auto max-lg:max-h-none lg:max-h-80">
              {notifications.map((n) => (
                <li key={n.id} className="border-b border-zinc-50 last:border-0">
                  <Link
                    href={notificationHref(n)}
                    onClick={() => {
                      void handleMarkRead(n);
                      setOpen(false);
                    }}
                    className={`block px-4 py-3 transition hover:bg-zinc-50 ${
                      n.read ? "opacity-75" : "bg-[#822020]/[0.03]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-zinc-900">{n.title}</p>
                      {!n.read ? (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#822020]" aria-hidden />
                      ) : null}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-zinc-600">{n.message}</p>
                    <p className="mt-1 text-[10px] text-zinc-400">{formatNotificationTime(n.created_at)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
