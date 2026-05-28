"use client";

import { PremiumShopEditor } from "@/app/components/shop/premium-shop-editor";

/** Editor de tienda embebido en la landing Premium. */
export function PremiumShopSection() {
  return (
    <section
      className="mt-10 rounded-2xl border border-[#822020]/15 bg-white p-5 sm:mt-12 sm:rounded-3xl sm:p-8"
      aria-label="Editar tienda premium"
    >
      <PremiumShopEditor heading="Editar mi tienda" id="premium-shop-editor" />
    </section>
  );
}
