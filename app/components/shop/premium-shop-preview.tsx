"use client";

import Link from "next/link";
import { VerifiedBadge } from "@/app/components/verified-badge";
import { initialsFromName } from "@/src/data/mockProfiles";
import { hasAnySocialLink, parseShopSocialLinks } from "@/src/lib/premium-shop";
import { premiumShopPath } from "@/src/lib/premium-shop";
import { normalizeShopSlug } from "@/src/lib/shop-slug";
import type { ShopSocialLinks } from "@/src/types/shop";

export type PremiumShopPreviewDraft = {
  businessName: string;
  shopDescription: string;
  shortDescription: string;
  location: string;
  institution: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  shopSlug: string;
  socialLinks: ShopSocialLinks;
  isVerified?: boolean;
};

type PremiumShopPreviewProps = {
  draft: PremiumShopPreviewDraft;
  /** Enlace funcional si el slug es válido (abre tienda publicada o preview). */
  openInNewTab?: boolean;
  compact?: boolean;
};

export function PremiumShopPreview({ draft, openInNewTab = false, compact = false }: PremiumShopPreviewProps) {
  const name = draft.businessName.trim() || "Tu negocio";
  const initials = initialsFromName(name);
  const slug = normalizeShopSlug(draft.shopSlug);
  const href = slug ? premiumShopPath(slug) : null;
  const socials = parseShopSocialLinks(draft.socialLinks);
  const showSocials = hasAnySocialLink(socials);
  const description =
    draft.shopDescription.trim() ||
    draft.shortDescription.trim() ||
    "Agregá una descripción para tu tienda.";

  const coverClass = compact ? "h-24 sm:h-28" : "h-28 sm:h-32";

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-[#F6F6F6] shadow-sm">
      <p className="border-b border-zinc-200/80 bg-white px-4 py-2 text-xs font-medium text-zinc-500">
        Vista previa de tu tienda
      </p>
      <div className={`relative ${coverClass} bg-gradient-to-br from-[#822020]/20 via-[#822020]/8 to-zinc-100`}>
        {draft.bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={draft.bannerUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      </div>
      <div className="relative -mt-10 px-4 pb-4 sm:-mt-12 sm:px-5 sm:pb-5">
        <article className="rounded-xl border border-zinc-200/90 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex gap-3 sm:gap-4">
            {draft.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={draft.avatarUrl}
                alt=""
                className="h-14 w-14 shrink-0 rounded-xl border-2 border-white object-cover shadow sm:h-16 sm:w-16"
              />
            ) : (
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 border-white bg-[#822020]/10 text-lg font-semibold text-[#822020] shadow sm:h-16 sm:w-16"
                aria-hidden
              >
                {initials}
              </div>
            )}
            <div className="min-w-0 flex-1 pt-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#822020] sm:text-xs">
                Tienda Premium
              </p>
              <p className="mt-0.5 flex items-center gap-1.5">
                <span className="truncate text-base font-bold text-zinc-900 sm:text-lg">{name}</span>
                <VerifiedBadge verified={draft.isVerified === true} size="sm" />
              </p>
              {draft.shortDescription.trim() ? (
                <p className="mt-0.5 line-clamp-2 text-xs text-zinc-600 sm:text-sm">{draft.shortDescription}</p>
              ) : null}
            </div>
          </div>
          <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-zinc-700 sm:text-sm">{description}</p>
          {draft.location.trim() || draft.institution.trim() ? (
            <div className="mt-2 space-y-0.5 text-xs text-zinc-600 sm:text-sm">
              {draft.location.trim() ? (
                <p>
                  <span className="font-medium text-zinc-500">Ubicación · </span>
                  {draft.location.trim()}
                </p>
              ) : null}
              {draft.institution.trim() ? (
                <p>
                  <span className="font-medium text-zinc-500">Rubro · </span>
                  {draft.institution.trim()}
                </p>
              ) : null}
            </div>
          ) : null}
          {showSocials ? (
            <p className="mt-2 text-xs text-zinc-500">Redes y enlaces configurados</p>
          ) : null}
          {href ? (
            <p className="mt-3 text-xs text-zinc-500">
              URL:{" "}
              {openInNewTab ? (
                <Link
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#822020] underline-offset-2 hover:underline"
                >
                  {href}
                </Link>
              ) : (
                <span className="font-medium text-zinc-700">{href}</span>
              )}
            </p>
          ) : (
            <p className="mt-3 text-xs text-amber-800">Definí un slug para generar la URL pública.</p>
          )}
        </article>
      </div>
    </div>
  );
}
