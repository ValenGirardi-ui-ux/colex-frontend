"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { VerifiedBadge } from "@/app/components/verified-badge";
import { initialsFromName } from "@/src/data/mockProfiles";
import { fetchFollowedStores } from "@/src/services/store-follows";
import type { FollowedStore } from "@/src/types/store-follow";

type FollowedStoresPanelProps = {
  userId: string;
};

export function FollowedStoresPanel({ userId }: FollowedStoresPanelProps) {
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<FollowedStore[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchFollowedStores(userId).then(({ stores: list, error: err }) => {
      if (cancelled) return;
      setStores(list);
      setError(err);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true">
        {[1, 2].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-zinc-100" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 px-5 py-8 text-center">
        <p className="text-sm text-zinc-600">
          No pudimos cargar tus tiendas seguidas. Verificá la migración{" "}
          <code className="text-xs">store_followers</code> en Supabase.
        </p>
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/60 px-5 py-10 text-center sm:px-8">
        <p className="text-base font-medium text-zinc-900">Todavía no seguís ninguna tienda</p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          Visitá negocios Premium y tocá &quot;Seguir tienda&quot; para ver sus novedades acá.
        </p>
        <Link
          href="/"
          className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-[#822020] px-6 text-sm font-semibold text-white transition hover:bg-[#6d1b1b]"
        >
          Explorar marketplace
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {stores.map((store) => (
        <li key={store.storeUserId}>
          <FollowedStoreCard store={store} />
        </li>
      ))}
    </ul>
  );
}

function FollowedStoreCard({ store }: { store: FollowedStore }) {
  const initials = initialsFromName(store.businessName);

  return (
    <article className="flex gap-4 rounded-2xl border border-zinc-200/90 bg-white p-4 transition hover:border-[#822020]/20 sm:p-5">
      {store.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={store.avatarUrl}
          alt=""
          className="h-14 w-14 shrink-0 rounded-2xl border border-zinc-100 object-cover sm:h-16 sm:w-16"
        />
      ) : (
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#822020]/15 bg-[#822020]/10 text-lg font-semibold text-[#822020] sm:h-16 sm:w-16"
          aria-hidden
        >
          {initials}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2">
          <Link
            href={store.shopHref}
            className="text-base font-semibold text-zinc-900 hover:text-[#822020] sm:text-lg"
          >
            {store.businessName}
          </Link>
          <VerifiedBadge verified size="sm" />
        </p>
        {store.subtitle ? (
          <p className="mt-0.5 line-clamp-2 text-sm text-zinc-500">{store.subtitle}</p>
        ) : null}
        <p className="mt-2 text-xs text-zinc-400">
          Seguís desde{" "}
          {new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(new Date(store.followedAt))}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={store.shopHref}
            className="inline-flex h-9 items-center justify-center rounded-full bg-[#822020] px-4 text-sm font-semibold text-white transition hover:bg-[#6d1b1b]"
          >
            Ver tienda
          </Link>
          <Link
            href={store.profileHref}
            className="inline-flex h-9 items-center justify-center rounded-full border border-zinc-200 px-4 text-sm font-medium text-zinc-700 transition hover:border-[#822020]/30 hover:text-[#822020]"
          >
            Perfil
          </Link>
        </div>
      </div>
    </article>
  );
}
