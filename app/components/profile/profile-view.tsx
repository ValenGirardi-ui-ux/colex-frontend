"use client";

import Link from "next/link";
import { StartPeerConversationButton } from "@/app/components/start-peer-conversation-button";
import { FollowStoreButton } from "@/app/components/shop/follow-store-button";
import { ProfileDraftsList } from "@/app/components/profile/profile-drafts-list";
import { ProfilePublicacionesOwn } from "@/app/components/profile/profile-publicaciones-own";
import { ProfileHeaderStats } from "@/app/components/profile/profile-header-stats";
import { ProductListGrid } from "@/app/components/product-list-grid";
import { AddressMissingAlertSlot } from "@/app/components/addresses/address-missing-alert-slot";
import { ProfileReviewsPanel } from "@/app/components/reviews/profile-reviews-panel";
import { ReviewRatingBadge } from "@/app/components/reviews/review-rating-badge";
import { VerifiedName } from "@/app/components/verified-badge";
import { premiumShopPath } from "@/src/lib/premium-shop";
import type { ReviewSummary } from "@/src/types/review";
import type { Order, SellerOrderRow } from "@/src/types/order";
import type { Product } from "@/src/types/product";
import type { MockPublicProfile } from "@/src/data/mockProfiles";
import { initialsFromName } from "@/src/data/mockProfiles";

export type ProfileTabKey =
  | "publicaciones"
  | "borradores"
  | "favoritos"
  | "informacion";

const TAB_ITEMS: Array<{ key: ProfileTabKey; label: string }> = [
  { key: "publicaciones", label: "Publicaciones" },
  { key: "borradores", label: "Borradores" },
  { key: "favoritos", label: "Favoritos" },
  { key: "informacion", label: "Información" },
];

export type ProfileViewProps = {
  profile: MockPublicProfile;
  listings: Product[];
  drafts?: Product[];
  favorites: Product[];
  isOwnProfile: boolean;
  activeTab: ProfileTabKey;
  /** Ruta sin query, p. ej. `/perfil` o `/perfil/seller-lucia` */
  basePath: string;
  onDraftsChanged?: () => void;
  onListingsChanged?: () => void;
  userId?: string | null;
  buyerOrders?: Order[];
  sellerSalesRows?: SellerOrderRow[];
  ordersLoadError?: string | null;
  onSellerSaleUpdated?: (row: SellerOrderRow) => void;
  reviewSummary?: ReviewSummary | null;
};

function EmptyPublicaciones() {
  return (
    <div className="rounded-xl border border-dashed border-zinc-200 bg-[#FFFFFF] px-5 py-8 text-center sm:px-6">
      <p className="text-base font-medium text-zinc-900">Todavía no hay publicaciones</p>
      <p className="mt-1.5 text-sm text-zinc-600">Cuando publiques artículos, aparecerán aquí.</p>
      <Link
        href="/vender"
        className="mt-4 inline-flex rounded-full bg-[#822020] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#6d1b1b]"
      >
        Publicar artículo
      </Link>
    </div>
  );
}

function EmptyFavoritos() {
  return (
    <div className="rounded-xl border border-dashed border-zinc-200 bg-[#FFFFFF] px-5 py-8 text-center sm:px-6">
      <p className="text-base font-medium text-zinc-900">No hay favoritos guardados</p>
      <p className="mt-1.5 text-sm text-zinc-600">Marcá artículos desde el catálogo para verlos aquí.</p>
      <Link
        href="/"
        className="mt-4 inline-block text-sm font-medium text-[#822020] underline-offset-2 hover:underline"
      >
        Ir al inicio
      </Link>
    </div>
  );
}

function FavoritosPrivados() {
  return (
    <div className="rounded-xl border border-zinc-100 bg-[#FFFFFF] px-5 py-6 text-center text-base text-zinc-600">
      Los favoritos de este usuario no son públicos.
    </div>
  );
}

function AvatarCircle({ profile }: { profile: MockPublicProfile }) {
  const base =
    "h-[5.25rem] w-[5.25rem] shrink-0 rounded-2xl border border-zinc-100 sm:h-24 sm:w-24 lg:h-[6.5rem] lg:w-[6.5rem]";
  if (profile.avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={profile.avatarUrl} alt="" className={`${base} bg-zinc-100 object-cover`} />;
  }
  return (
    <div
      className={`flex ${base} items-center justify-center bg-[#822020]/10 text-2xl font-semibold text-[#822020] lg:text-3xl`}
      aria-hidden
    >
      {initialsFromName(profile.displayName)}
    </div>
  );
}

function IconSettings() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.021-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export function ProfileView({
  profile,
  listings,
  drafts = [],
  favorites,
  isOwnProfile,
  activeTab,
  basePath,
  onDraftsChanged,
  onListingsChanged,
  userId,
  buyerOrders = [],
  sellerSalesRows = [],
  ordersLoadError = null,
  onSellerSaleUpdated,
  reviewSummary: reviewSummaryProp,
}: ProfileViewProps) {
  const reviewSummary =
    reviewSummaryProp ??
    (profile.reviewSummary && profile.reviewSummary.count > 0 ? profile.reviewSummary : null);
  const shopSlug = profile.shopSlug?.trim() ?? null;
  const shopHref = shopSlug ? premiumShopPath(shopSlug) : null;
  const hrefTab = (key: ProfileTabKey) => (key === "publicaciones" ? basePath : `${basePath}?tab=${key}`);
  const pubCount = listings.length;
  const visibleTabs = isOwnProfile
    ? TAB_ITEMS
    : TAB_ITEMS.filter((t) => t.key !== "borradores");

  const actionLabel = isOwnProfile ? "Editar perfil" : "Enviar mensaje";
  const primaryActionClassName =
    "inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#822020] px-6 text-base font-semibold text-white transition hover:bg-[#6d1b1b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#822020] disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className="w-full min-w-0 bg-[#FFFFFF] px-3 pb-10 pt-5 max-lg:overflow-x-hidden sm:px-6 sm:pb-12 sm:pt-8 lg:px-8">
      <div className="mx-auto w-full max-w-[1240px]">
        <article className="overflow-hidden rounded-2xl border border-zinc-100 bg-[#FFFFFF]">
          {/* Header: izquierda (avatar + nombre) | centro (stats + datos) | derecha (acciones) */}
          <div className="border-b border-zinc-100 p-4 sm:p-7 lg:p-8">
            <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-6 xl:gap-10">
              {/* Izquierda */}
              <div className="flex min-w-0 shrink-0 gap-4 sm:gap-5 lg:max-w-[340px] lg:flex-[0_1_auto]">
                <AvatarCircle profile={profile} />
                <div className="min-w-0 space-y-1 self-center pt-0.5 sm:self-start">
                  <h1 className="min-w-0">
                    <VerifiedName
                      verified={profile.isVerified}
                      nameClassName="text-2xl font-semibold leading-tight tracking-tight text-zinc-900 sm:text-3xl"
                      badgeSize="md"
                    >
                      {profile.displayName}
                    </VerifiedName>
                  </h1>
                  {profile.profileTagline ? (
                    <p className="text-sm leading-snug text-zinc-500">{profile.profileTagline}</p>
                  ) : null}
                  {profile.username ? (
                    <p className="text-sm font-semibold text-zinc-600">@{profile.username}</p>
                  ) : null}
                  {reviewSummary ? (
                    <ReviewRatingBadge summary={reviewSummary} size="sm" className="mt-1" />
                  ) : null}
                  <p className="break-all text-base font-semibold text-[#822020] sm:text-lg">{profile.handle}</p>
                </div>
              </div>

              {/* Centro: métricas en fila + ubicación / institución */}
              <div className="min-w-0 flex-1 space-y-5 lg:border-l lg:border-zinc-100 lg:pl-6 xl:pl-10">
                <ProfileHeaderStats
                  publicationCount={pubCount}
                  storeUserId={profile.id}
                  showStoreFollowers={profile.isPremiumStore === true}
                  followersLabel={isOwnProfile ? "Seguidores de tu tienda" : "Seguidores"}
                />
                <div className="space-y-2 text-sm leading-relaxed text-zinc-700 sm:text-base">
                  <p>
                    <span className="font-semibold text-zinc-500">Ubicación · </span>
                    {profile.location}
                  </p>
                  <p>
                    <span className="font-semibold text-zinc-500">Institución · </span>
                    {profile.institution ?? "No indicada"}
                  </p>
                </div>
              </div>

              {/* Derecha */}
              <div className="flex w-full shrink-0 flex-col gap-2 sm:flex-row sm:items-center lg:w-auto lg:min-w-[200px] lg:flex-col lg:items-stretch xl:min-w-[240px]">
                {profile.isPremiumStore && !isOwnProfile ? (
                  <FollowStoreButton
                    storeUserId={profile.id}
                    storeDisplayName={profile.displayName}
                    layout="stack"
                    className="w-full"
                  />
                ) : null}
                {shopHref ? (
                  <Link
                    href={shopHref}
                    className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-[#822020]/35 bg-white px-6 text-base font-semibold text-[#822020] transition hover:bg-[#822020]/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#822020]"
                  >
                    {isOwnProfile ? "Ver mi tienda" : "Visitar tienda"}
                  </Link>
                ) : null}
                {profile.isPremiumStore && isOwnProfile ? (
                  <FollowStoreButton
                    storeUserId={profile.id}
                    storeDisplayName={profile.displayName}
                    showFollowerCount={false}
                    layout="stack"
                    className="w-full"
                  />
                ) : null}
                {isOwnProfile ? (
                  <Link href="/ajustes" className={primaryActionClassName}>
                    {actionLabel}
                  </Link>
                ) : (
                  <StartPeerConversationButton
                    peerUserId={profile.id}
                    peerDisplayName={profile.displayName}
                    returnPath={basePath}
                    className={primaryActionClassName}
                  >
                    {actionLabel}
                  </StartPeerConversationButton>
                )}
                {isOwnProfile ? (
                  <Link
                    href="/ajustes?tab=ayuda"
                    aria-label="Centro de ayuda"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
                  >
                    <IconSettings />
                    <span className="hidden sm:inline">Ayuda</span>
                  </Link>
                ) : null}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <nav
            className="colex-hscroll flex border-b border-zinc-100 bg-[#FFFFFF] px-1 sm:px-4"
            aria-label="Secciones del perfil"
          >
            {visibleTabs.map(({ key, label }) => {
              const on = activeTab === key;
              return (
                <Link
                  key={key}
                  href={hrefTab(key)}
                  scroll={false}
                  className={`flex min-h-[48px] min-w-[5.5rem] shrink-0 flex-1 items-center justify-center px-2.5 py-3 text-center text-xs font-semibold transition max-lg:snap-start sm:min-h-[56px] sm:min-w-0 sm:px-4 sm:text-base ${
                    on
                      ? "border-b-[3px] border-[#822020] text-[#822020]"
                      : "border-b-[3px] border-transparent text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Contenido */}
          <div className="bg-[#FFFFFF] p-4 sm:p-7 sm:pt-6 lg:p-8">
            {activeTab === "publicaciones" ? (
              isOwnProfile && userId ? (
                onListingsChanged ? (
                  <ProfilePublicacionesOwn
                    listings={listings}
                    userId={userId}
                    onListingsChanged={onListingsChanged}
                    buyerOrders={buyerOrders}
                    sellerSalesRows={sellerSalesRows}
                    ordersLoadError={ordersLoadError}
                    onSellerSaleUpdated={onSellerSaleUpdated}
                  />
                ) : (
                  <p className="py-6 text-center text-base text-zinc-600">Cargando publicaciones…</p>
                )
              ) : listings.length === 0 ? (
                <p className="py-6 text-center text-base text-zinc-600">Sin publicaciones por ahora.</p>
              ) : (
                <ProductListGrid products={listings} cardVariant="compact" />
              )
            ) : null}

            {activeTab === "borradores" && isOwnProfile ? (
              userId && onDraftsChanged ? (
                <ProfileDraftsList drafts={drafts} userId={userId} onChanged={onDraftsChanged} />
              ) : (
                <p className="py-6 text-center text-base text-zinc-600">Cargando borradores…</p>
              )
            ) : null}

            {activeTab === "favoritos" ? (
              !isOwnProfile ? (
                <FavoritosPrivados />
              ) : favorites.length === 0 ? (
                <EmptyFavoritos />
              ) : (
                <ProductListGrid products={favorites} cardVariant="compact" />
              )
            ) : null}

            {activeTab === "informacion" ? (
              <div className="space-y-4">
                {isOwnProfile ? (
                  <AddressMissingAlertSlot variant="informacion" />
                ) : null}
                <div className="rounded-xl border border-zinc-100 bg-zinc-50/40 p-5 sm:p-6">
                <dl className="space-y-4 text-base sm:text-lg">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                    <dt className="shrink-0 text-sm font-semibold uppercase tracking-wide text-[#822020]">Nombre</dt>
                    <dd className="min-w-0 text-left font-medium text-zinc-900 sm:text-right">{profile.displayName}</dd>
                  </div>
                  {profile.accountEmail ? (
                    <>
                      <div className="h-px bg-zinc-200/80" />
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                        <dt className="shrink-0 text-sm font-semibold uppercase tracking-wide text-[#822020]">Email</dt>
                        <dd className="min-w-0 break-all text-left font-medium text-zinc-900 sm:text-right">
                          {profile.accountEmail}
                        </dd>
                      </div>
                    </>
                  ) : null}
                  <div className="h-px bg-zinc-200/80" />
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                    <dt className="shrink-0 text-sm font-semibold uppercase tracking-wide text-[#822020]">Biografía</dt>
                    <dd className="min-w-0 whitespace-pre-line text-left font-medium text-zinc-900 sm:text-right">
                      {profile.bio}
                    </dd>
                  </div>
                  {profile.phone ? (
                    <>
                      <div className="h-px bg-zinc-200/80" />
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                        <dt className="shrink-0 text-sm font-semibold uppercase tracking-wide text-[#822020]">Teléfono</dt>
                        <dd className="min-w-0 text-left font-medium text-zinc-900 sm:text-right">{profile.phone}</dd>
                      </div>
                    </>
                  ) : null}
                  <div className="h-px bg-zinc-200/80" />
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                    <dt className="shrink-0 text-sm font-semibold uppercase tracking-wide text-[#822020]">
                      Ubicación
                    </dt>
                    <dd className="min-w-0 text-left font-medium text-zinc-900 sm:text-right">{profile.location}</dd>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                    <dt className="shrink-0 text-sm font-semibold uppercase tracking-wide text-[#822020]">
                      Institución
                    </dt>
                    <dd className="min-w-0 text-left font-medium text-zinc-900 sm:text-right">
                      {profile.institution ?? "No indicada"}
                    </dd>
                  </div>
                </dl>
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-[#822020]">Reseñas</h3>
                  <ProfileReviewsPanel
                    userId={profile.id}
                    initialSummary={reviewSummary ?? undefined}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </article>
      </div>
    </div>
  );
}

export function parseProfileTab(tab: string | undefined): ProfileTabKey {
  if (tab === "favoritos" || tab === "informacion" || tab === "borradores") {
    return tab;
  }
  return "publicaciones";
}
