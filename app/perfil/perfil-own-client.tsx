"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useOrdersRealtime } from "@/src/hooks/use-orders-realtime";
import { subscribePostgresChanges } from "@/src/lib/supabase/realtime-subscribe";
import { useFavorites } from "@/src/context/favorites-context";
import { SiteHeader } from "@/app/components/site-header";
import { ProfileView, parseProfileTab, type ProfileTabKey } from "@/app/components/profile/profile-view";
import { publicProfileFromUserAndRow } from "@/src/lib/auth-profile";
import { supabase } from "@/src/lib/supabase/client";
import { fetchFavoriteProducts } from "@/src/services/favorites";
import { ensureProfileForUser } from "@/src/services/profiles";
import { fetchOrdersForBuyer, fetchSellerSalesPanel } from "@/src/services/orders";
import { fetchReviewSummaryForUser } from "@/src/services/reviews";
import type { ReviewSummary } from "@/src/types/review";
import { getSellerManageableListingsByUserId } from "@/src/services/products";
import type { User } from "@supabase/supabase-js";
import type { Order, SellerOrderRow } from "@/src/types/order";
import type { Product } from "@/src/types/product";
import type { ProfileRow } from "@/src/types/profile";

type Phase = "loading" | "anon" | "ready";

export function PerfilOwnClient() {
  const searchParams = useSearchParams();
  const activeTab: ProfileTabKey = parseProfileTab(searchParams.get("tab") ?? undefined);

  const [phase, setPhase] = useState<Phase>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [profileRow, setProfileRow] = useState<ProfileRow | null>(null);
  const [listings, setListings] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [buyerOrders, setBuyerOrders] = useState<Order[]>([]);
  const [sellerSalesRows, setSellerSalesRows] = useState<SellerOrderRow[]>([]);
  const [ordersLoadError, setOrdersLoadError] = useState<string | null>(null);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);
  const { favoriteIds, ready: favReady } = useFavorites();
  const favoriteIdsKey = useMemo(() => [...favoriteIds].sort().join(","), [favoriteIds]);

  useEffect(() => {
    let cancelled = false;

    async function hydrateFromUser(next: User | null) {
      if (cancelled) return;
      if (!next?.id) {
        setUser(null);
        setProfileRow(null);
        setListings([]);
        setFavorites([]);
        setBuyerOrders([]);
        setSellerSalesRows([]);
        setOrdersLoadError(null);
        setPhase("anon");
        return;
      }
      setPhase("loading");
      setUser(next);

      const [{ profile: prof }, products, favResult, buyerResult, sellerResult, reviewsSum] =
        await Promise.all([
          ensureProfileForUser(next),
          getSellerManageableListingsByUserId(next.id),
          fetchFavoriteProducts(next.id),
          fetchOrdersForBuyer(next.id),
          fetchSellerSalesPanel(next.id),
          fetchReviewSummaryForUser(next.id),
        ]);

      if (cancelled) return;
      setProfileRow(prof);
      setListings(products);
      setFavorites(favResult.error ? [] : favResult.products);
      setBuyerOrders(buyerResult.orders);
      setSellerSalesRows(sellerResult.rows);
      setOrdersLoadError(buyerResult.error ?? sellerResult.error);
      setReviewSummary(reviewsSum.count > 0 ? reviewsSum : null);
      setPhase("ready");
    }

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled) void hydrateFromUser(session?.user ?? null);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      void hydrateFromUser(session?.user ?? null);
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (phase !== "ready" || !user?.id || !favReady) return;
    let cancelled = false;
    void fetchFavoriteProducts(user.id).then(({ products, error }) => {
      if (cancelled) return;
      if (!error) setFavorites(products);
    });
    return () => {
      cancelled = true;
    };
  }, [phase, user?.id, favReady, favoriteIdsKey]);

  const refreshListings = useCallback(() => {
    if (!user?.id) return;
    void getSellerManageableListingsByUserId(user.id).then(setListings);
  }, [user?.id]);

  useOrdersRealtime(user?.id ?? null, {
    enabled: phase === "ready",
    onBuyerOrders: setBuyerOrders,
    onSellerRows: setSellerSalesRows,
    onError: setOrdersLoadError,
  });

  useEffect(() => {
    if (phase !== "ready" || !user?.id) return;

    let debounce: ReturnType<typeof setTimeout> | null = null;
    const scheduleRefresh = () => {
      if (debounce) clearTimeout(debounce);
      debounce = setTimeout(() => refreshListings(), 400);
    };

    const unsub = subscribePostgresChanges(
      `seller-products:${user.id}`,
      [
        { event: "INSERT", table: "products", filter: `user_id=eq.${user.id}` },
        { event: "UPDATE", table: "products", filter: `user_id=eq.${user.id}` },
        { event: "DELETE", table: "products", filter: `user_id=eq.${user.id}` },
      ],
      scheduleRefresh,
    );

    return () => {
      unsub();
      if (debounce) clearTimeout(debounce);
    };
  }, [phase, user?.id, refreshListings]);

  const handleSellerSaleUpdated = (row: SellerOrderRow) => {
    setSellerSalesRows((prev) => prev.map((r) => (r.id === row.id ? row : r)));
  };

  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-[#FFFFFF] text-zinc-900">
        <SiteHeader />
        <main className="mx-auto max-w-[1240px] px-4 py-16 text-center sm:px-6">
          <p className="text-base text-zinc-600">Cargando tu perfil…</p>
        </main>
      </div>
    );
  }

  if (phase === "anon" || !user) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] text-zinc-900">
        <SiteHeader />
        <main className="mx-auto max-w-[1240px] px-4 py-16 text-center sm:px-6">
          <h1 className="text-xl font-semibold text-zinc-900 sm:text-2xl">No iniciaste sesión</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600 sm:text-base">
            Iniciá sesión o registrate para ver tu perfil y publicaciones vinculadas a tu cuenta.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex h-11 min-w-[140px] items-center justify-center rounded-full bg-[#822020] px-6 text-sm font-semibold text-white transition hover:bg-[#6d1b1b]"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="inline-flex h-11 min-w-[140px] items-center justify-center rounded-full border border-[#822020]/35 bg-white px-6 text-sm font-semibold text-[#822020] transition hover:bg-[#822020]/[0.06]"
            >
              Registrate
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const profile = publicProfileFromUserAndRow(user, profileRow);

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-zinc-900">
      <SiteHeader />
      <main>
        <ProfileView
          profile={profile}
          listings={listings}
          favorites={favorites}
          isOwnProfile
          activeTab={activeTab}
          basePath="/perfil"
          userId={user.id}
          onListingsChanged={refreshListings}
          buyerOrders={buyerOrders}
          sellerSalesRows={sellerSalesRows}
          ordersLoadError={ordersLoadError}
          onSellerSaleUpdated={handleSellerSaleUpdated}
          reviewSummary={reviewSummary}
        />
      </main>
    </div>
  );
}
