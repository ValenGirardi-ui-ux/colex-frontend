"use client";

import { useState } from "react";
import { ProfileListingsList } from "@/app/components/profile/profile-listings-list";
import { ProfileOrdersList } from "@/app/components/profile/profile-orders-list";
import { ProfileSalesPanel } from "@/app/components/profile/profile-sales-panel";
import type { Order, SellerOrderRow } from "@/src/types/order";
import type { Product } from "@/src/types/product";

type PublicacionesSection = "articulos" | "compras" | "ventas";

const MOBILE_SECTIONS: Array<{ key: PublicacionesSection; label: string }> = [
  { key: "articulos", label: "Artículos" },
  { key: "compras", label: "Compras" },
  { key: "ventas", label: "Ventas" },
];

function ProfileSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold uppercase tracking-wide text-[#822020]">{children}</h2>
  );
}

type ProfilePublicacionesOwnProps = {
  listings: Product[];
  userId: string;
  onListingsChanged: () => void;
  buyerOrders: Order[];
  sellerSalesRows: SellerOrderRow[];
  ordersLoadError: string | null;
  onSellerSaleUpdated?: (row: SellerOrderRow) => void;
};

export function ProfilePublicacionesOwn({
  listings,
  userId,
  onListingsChanged,
  buyerOrders,
  sellerSalesRows,
  ordersLoadError,
  onSellerSaleUpdated,
}: ProfilePublicacionesOwnProps) {
  const [mobileSection, setMobileSection] = useState<PublicacionesSection>("articulos");

  const articulosBlock = (
    <>
      <ProfileSectionTitle>Artículos publicados</ProfileSectionTitle>
      <ProfileListingsList listings={listings} userId={userId} onChanged={onListingsChanged} />
    </>
  );

  const comprasBlock = (
    <>
      <ProfileSectionTitle>Compras</ProfileSectionTitle>
      <ProfileOrdersList
        orders={buyerOrders}
        mode="buyer"
        currentUserId={userId}
        loadError={ordersLoadError}
      />
    </>
  );

  const ventasBlock = (
    <>
      <ProfileSectionTitle>Ventas</ProfileSectionTitle>
      <ProfileSalesPanel
        rows={sellerSalesRows}
        sellerId={userId}
        currentUserId={userId}
        loadError={ordersLoadError}
        onOrderUpdated={onSellerSaleUpdated}
      />
    </>
  );

  return (
    <>
      {/* Mobile / tablet: una sección a la vez */}
      <div className="min-w-0 lg:hidden">
        <nav
          className="colex-hscroll -mx-1 flex gap-2 border-b border-zinc-100 pb-3"
          aria-label="Secciones de publicaciones"
        >
          {MOBILE_SECTIONS.map(({ key, label }) => {
            const active = mobileSection === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setMobileSection(key)}
                className={`shrink-0 snap-start rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                  active
                    ? "bg-[#822020] text-white"
                    : "border border-zinc-200 bg-white text-zinc-700 hover:border-[#822020]/25 hover:text-[#822020]"
                }`}
                aria-current={active ? "true" : undefined}
              >
                {label}
              </button>
            );
          })}
        </nav>

        <div className="mt-4 min-w-0 space-y-4">
          {mobileSection === "articulos" ? articulosBlock : null}
          {mobileSection === "compras" ? comprasBlock : null}
          {mobileSection === "ventas" ? ventasBlock : null}
        </div>
      </div>

      {/* Desktop: las tres secciones apiladas */}
      <div className="hidden min-w-0 space-y-10 lg:block">
        <section className="space-y-4">{articulosBlock}</section>
        <section className="space-y-4 border-t border-zinc-100 pt-8">{comprasBlock}</section>
        <section className="space-y-4 border-t border-zinc-100 pt-8">{ventasBlock}</section>
      </div>
    </>
  );
}
