"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatArsPrice } from "@/src/lib/money";
import { removeProductDraft } from "@/src/services/product-drafts";
import type { Product } from "@/src/types/product";

type ProfileDraftsListProps = {
  drafts: Product[];
  userId: string;
  onChanged: () => void;
};

export function ProfileDraftsList({ drafts, userId, onChanged }: ProfileDraftsListProps) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (drafts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-200 bg-white px-5 py-8 text-center sm:px-6">
        <p className="text-base font-medium text-zinc-900">No tenés borradores</p>
        <p className="mt-1.5 text-sm text-zinc-600">Guardá una publicación sin publicar desde Vender.</p>
        <Link
          href="/vender"
          className="mt-4 inline-flex rounded-full bg-[#822020] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#6d1b1b]"
        >
          Ir a Vender
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
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {drafts.map((draft) => {
          const thumb = draft.images?.[0];
          return (
            <li
              key={draft.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white"
            >
              <div className="relative aspect-square w-full bg-zinc-100">
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                    Sin imagen
                  </div>
                )}
                <span className="absolute left-2 top-2 rounded-full bg-zinc-800/80 px-2.5 py-0.5 text-xs font-medium text-white">
                  Borrador
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div>
                  <h3 className="line-clamp-2 font-semibold text-zinc-900">{draft.title}</h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    {draft.price > 0 ? formatArsPrice(draft.price) : "Precio sin definir"}
                  </p>
                </div>
                <div className="mt-auto flex flex-col gap-2">
                  <Link
                    href={`/vender?borrador=${encodeURIComponent(draft.id)}`}
                    className="inline-flex h-10 items-center justify-center rounded-full border border-[#822020]/30 text-sm font-semibold text-[#822020] transition hover:bg-[#822020]/[0.05]"
                  >
                    Continuar editando
                  </Link>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={busyId === draft.id}
                      onClick={() => {
                        router.push(`/vender?borrador=${encodeURIComponent(draft.id)}`);
                      }}
                      className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-[#822020] text-sm font-semibold text-white transition hover:bg-[#6d1b1b] disabled:opacity-60"
                    >
                      Publicar
                    </button>
                    <button
                      type="button"
                      disabled={busyId === draft.id}
                      onClick={() => {
                        void (async () => {
                          if (!window.confirm("¿Eliminar este borrador?")) return;
                          setBusyId(draft.id);
                          setError(null);
                          const { error: delErr } = await removeProductDraft(draft.id, userId);
                          setBusyId(null);
                          if (delErr) {
                            setError(delErr);
                            return;
                          }
                          onChanged();
                        })();
                      }}
                      className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-200 px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-60"
                      aria-label="Eliminar borrador"
                    >
                      Eliminar
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
