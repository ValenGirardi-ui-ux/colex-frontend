"use client";

import Link from "next/link";
import { SellForm } from "@/app/components/sell/sell-form";

type EditListingClientProps = {
  productId: string;
};

export function EditListingClient({ productId }: EditListingClientProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-zinc-600">
        <Link href="/perfil?tab=publicaciones" className="font-medium text-[#822020] hover:underline">
          ← Volver a mis publicaciones
        </Link>
      </p>
      <SellForm editProductId={productId} />
    </div>
  );
}
