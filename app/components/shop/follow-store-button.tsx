"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { StoreFollowStats } from "@/app/components/shop/store-follow-stats";
import { supabase } from "@/src/lib/supabase/client";
import {
  fetchStoreFollowState,
  followStore,
  formatStoreFollowErrorForUser,
  unfollowStore,
} from "@/src/services/store-follows";

type FollowStoreButtonProps = {
  storeUserId: string;
  storeDisplayName?: string;
  /** Mostrar contador de seguidores debajo del botón. */
  showFollowerCount?: boolean;
  layout?: "stack" | "inline";
  className?: string;
};

export function FollowStoreButton({
  storeUserId,
  storeDisplayName = "esta tienda",
  showFollowerCount = true,
  layout = "stack",
  className = "",
}: FollowStoreButtonProps) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwnStore, setIsOwnStore] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const refresh = useCallback(async (uid: string | null) => {
    setLoading(true);
    setFeedback(null);
    const state = await fetchStoreFollowState(storeUserId, uid);
    setFollowerCount(state.followerCount);
    setIsFollowing(state.isFollowing);
    setIsOwnStore(state.isOwnStore);
    setLoading(false);
  }, [storeUserId]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      const uid = session?.user?.id ?? null;
      setViewerId(uid);
      await refresh(uid);
    }

    void init();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null;
      setViewerId(uid);
      void refresh(uid);
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, [refresh]);

  async function handleToggle() {
    if (!viewerId) return;
    setBusy(true);
    setFeedback(null);
    const { error } = isFollowing
      ? await unfollowStore(storeUserId)
      : await followStore(storeUserId);
    setBusy(false);
    if (error) {
      setFeedback(formatStoreFollowErrorForUser(error));
      return;
    }
    setIsFollowing((prev) => !prev);
    setFollowerCount((c) => (isFollowing ? Math.max(0, c - 1) : c + 1));
  }

  if (loading) {
    return (
      <div className={`animate-pulse rounded-xl bg-zinc-100 ${layout === "inline" ? "h-11 w-36" : "h-20 w-full max-w-xs"} ${className}`} />
    );
  }

  if (isOwnStore) {
    return showFollowerCount ? (
      <StoreFollowStats followerCount={followerCount} className={className} />
    ) : null;
  }

  const btnClass = isFollowing
    ? "border-[#822020]/40 bg-[#822020]/[0.06] text-[#822020] hover:bg-[#822020]/10"
    : "border-zinc-200 bg-white text-zinc-800 hover:border-[#822020]/30 hover:text-[#822020]";

  const controls = (
    <div className={layout === "inline" ? "flex flex-wrap items-center gap-3" : "flex flex-col items-stretch gap-2 sm:items-start"}>
      {!viewerId ? (
        <Link
          href={`/login?next=${encodeURIComponent(pathname || "/")}`}
          className={`inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 text-sm font-semibold text-[#822020] transition hover:border-[#822020]/30 ${layout === "inline" ? "" : "w-full sm:w-auto"}`}
        >
          Iniciá sesión para seguir
        </Link>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => void handleToggle()}
          className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-70 ${btnClass} ${layout === "inline" ? "" : "w-full sm:min-w-[11rem] sm:w-auto"}`}
          aria-pressed={isFollowing}
        >
          {busy ? (
            <span>{isFollowing ? "Dejando de seguir…" : "Siguiendo…"}</span>
          ) : isFollowing ? (
            <>
              <CheckIcon />
              Siguiendo
            </>
          ) : (
            <>
              <PlusIcon />
              Seguir tienda
            </>
          )}
        </button>
      )}
      {showFollowerCount ? <StoreFollowStats followerCount={followerCount} /> : null}
    </div>
  );

  return (
    <div className={className}>
      {controls}
      {feedback ? (
        <p className="mt-2 text-sm text-red-700" role="alert">
          {feedback}
        </p>
      ) : null}
      {!viewerId ? (
        <p className="mt-1 text-xs text-zinc-500">
          Recibí novedades cuando {storeDisplayName} publique productos.
        </p>
      ) : null}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" d="M10 4v12M4 10h12" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}
