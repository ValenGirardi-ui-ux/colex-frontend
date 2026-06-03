"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { listingStatusBadgeClass, listingStatusLabel } from "@/src/lib/listing-status";
import { formatArsPrice } from "@/src/lib/money";
import { formatProductCondition } from "@/src/lib/product-condition";
import {
  deleteListing,
  pauseListing,
  republishListing,
} from "@/src/services/listing-management";
import type { Product } from "@/src/types/product";

type ProfileListingsListProps = {
  listings: Product[];
  userId: string;
  onChanged: () => void;
};

export function ProfileListingsList({ listings, userId, onChanged }: ProfileListingsListProps) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAction(
    productId: string,
    action: () => Promise<{ error: string | null }>,
  ) {
    setBusyId(productId);
    setError(null);
    const result = await action();
    setBusyId(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    onChanged();
    router.refresh();
  }

  if (listings.length === 0) {
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

  return (
    <div className="space-y-4">
      {error ? (
        <p role="alert" className="rounded-xl border border-[#822020]/25 bg-[#822020]/10 px-4 py-3 text-sm text-[#6d1b1b]">
          {error}
        </p>
      ) : null}
      <ul className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((product) => {
          const thumb = product.images?.[0];
          const isBusy = busyId === product.id;
          const isPaused = product.status === "paused";
          const isActive = product.status === "active";

          return (
            <li
              key={product.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white"
            >
              <Link
                href={
                  isPaused
                    ? `/vender/editar/${encodeURIComponent(product.id)}`
                    : `/producto/${encodeURIComponent(product.id)}`
                }
                className="relative block aspect-square bg-zinc-100"
              >
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                    Sin imagen
                  </div>
                )}
                <span
                  className={`absolute left-2 top-2 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${listingStatusBadgeClass(product.status)}`}
                >
                  {listingStatusLabel(product.status)}
                </span>
              </Link>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div>
                  <h3 className="line-clamp-2 font-semibold text-zinc-900">{product.title}</h3>
                  <p className="mt-1 text-sm font-semibold text-zinc-900">{formatArsPrice(product.price)}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">{formatProductCondition(product)}</p>
                </div>
                <div className="mt-auto flex flex-col gap-2">
                  <Link
                    href={`/vender/editar/${encodeURIComponent(product.id)}`}
                    className="inline-flex h-10 items-center justify-center rounded-full border border-[#822020]/30 text-sm font-semibold text-[#822020] transition hover:bg-[#822020]/[0.05]"
                  >
                    Editar
                  </Link>
                  <div className="flex flex-wrap gap-2">
                    {isActive ? (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() =>
                          void runAction(product.id, async () => {
                            const r = await pauseListing(product.id, userId);
                            return { error: r.error };
                          })
                        }
                        className="inline-flex h-9 flex-1 items-center justify-center rounded-full border border-zinc-200 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-60"
                      >
                        {isBusy ? "…" : "Pausar"}
                      </button>
                    ) : null}
                    {isPaused ? (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() =>
                          void runAction(product.id, async () => {
                            const r = await republishListing(product.id, userId);
                            return { error: r.error };
                          })
                        }
                        className="inline-flex h-9 flex-1 items-center justify-center rounded-full bg-[#822020] text-xs font-semibold text-white transition hover:bg-[#6d1b1b] disabled:opacity-60"
                      >
                        {isBusy ? "…" : "Republicar"}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => {
                        if (
                          !window.confirm(
                            `¿Eliminar «${product.title}»? No se verá más en el catálogo.`,
                          )
                        ) {
                          return;
                        }
                        void runAction(product.id, () => deleteListing(product.id, userId));
                      }}
                      className="inline-flex h-9 flex-1 items-center justify-center rounded-full border border-red-200 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                    >
                      {isBusy ? "…" : "Eliminar"}
                    </button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
