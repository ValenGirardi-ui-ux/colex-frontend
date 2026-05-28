"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { normalizeFavoriteProductId } from "@/src/lib/favorite-product-id";
import { supabase } from "@/src/lib/supabase/client";
import {
  addFavorite,
  fetchFavoriteProductIds,
  formatFavoriteErrorForUser,
  isFavoritesSchemaError,
  removeFavorite,
} from "@/src/services/favorites";

type FavoritesContextValue = {
  ready: boolean;
  userId: string | null;
  favoriteIds: ReadonlySet<string>;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => Promise<void>;
  reloadFavorites: () => Promise<void>;
  lastMessage: string | null;
  clearMessage: () => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIdsState] = useState<Set<string>>(new Set());
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  const loadForUser = useCallback(async (uid: string | null) => {
    if (!uid) {
      setFavoriteIdsState(new Set());
      setReady(true);
      return;
    }
    const { ids, error } = await fetchFavoriteProductIds(uid);
    if (error && !isFavoritesSchemaError(error)) {
      console.error("[Colex favorites] cargar ids", error);
    }
    setFavoriteIdsState(ids);
    setReady(true);
  }, []);

  const reloadFavorites = useCallback(async () => {
    if (!userId) return;
    const { ids, error } = await fetchFavoriteProductIds(userId);
    if (!error) setFavoriteIdsState(ids);
  }, [userId]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      await loadForUser(uid);
    }

    void init();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      void loadForUser(uid);
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, [loadForUser]);

  const isFavorite = useCallback(
    (productId: string) => favoriteIds.has(normalizeFavoriteProductId(productId)),
    [favoriteIds],
  );

  const toggleFavorite = useCallback(
    async (productId: string) => {
      const pid = normalizeFavoriteProductId(productId);
      setLastMessage(null);

      if (!userId) {
        const next = `${pathname}${typeof window !== "undefined" ? window.location.search : ""}`;
        router.push(`/login?next=${encodeURIComponent(next || "/")}`);
        return;
      }

      const wasFavorite = favoriteIds.has(pid);
      setFavoriteIdsState((prev) => {
        const next = new Set(prev);
        if (wasFavorite) next.delete(pid);
        else next.add(pid);
        return next;
      });

      const { error } = wasFavorite ? await removeFavorite(userId, pid) : await addFavorite(userId, pid);

      if (error) {
        setFavoriteIdsState((prev) => {
          const next = new Set(prev);
          if (wasFavorite) next.add(pid);
          else next.delete(pid);
          return next;
        });
        if (!isFavoritesSchemaError(error)) {
          setLastMessage(formatFavoriteErrorForUser(error));
        }
        return;
      }

      await reloadFavorites();
    },
    [favoriteIds, pathname, reloadFavorites, router, userId],
  );

  const clearMessage = useCallback(() => setLastMessage(null), []);

  const value = useMemo(
    () => ({
      ready,
      userId,
      favoriteIds,
      isFavorite,
      toggleFavorite,
      reloadFavorites,
      lastMessage,
      clearMessage,
    }),
    [ready, userId, favoriteIds, isFavorite, toggleFavorite, reloadFavorites, lastMessage, clearMessage],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites debe usarse dentro de FavoritesProvider");
  }
  return ctx;
}
