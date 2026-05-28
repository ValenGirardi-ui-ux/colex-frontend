"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { PremiumShopPreview } from "@/app/components/shop/premium-shop-preview";
import { initialsFromName } from "@/src/data/mockProfiles";
import { parseShopSocialLinks, premiumShopPath } from "@/src/lib/premium-shop";
import { normalizeShopSlug } from "@/src/lib/shop-slug";
import { uploadBusinessLogo, uploadShopBanner } from "@/src/services/profile-avatar";
import { isShopSlugTaken, savePremiumShopSettings } from "@/src/services/premium-shops";
import type { ShopSocialLinks } from "@/src/types/shop";

const inputClass =
  "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#822020] focus:ring-2 focus:ring-[#822020]/20 sm:text-base";
const labelClass = "text-sm font-medium text-zinc-800";
const btnPrimaryClass =
  "rounded-full bg-[#822020] px-8 py-2.5 text-sm font-medium text-white transition hover:bg-[#6d1b1b] active:bg-[#5a1616] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#822020] disabled:cursor-wait disabled:opacity-70 sm:py-3 sm:text-base";
const btnSecondaryClass =
  "inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white px-6 py-2.5 text-sm font-medium text-zinc-800 transition hover:border-[#822020]/30 hover:text-[#822020] disabled:opacity-60 sm:py-3";

const SHORT_DESC_MAX = 120;
const SHOP_DESC_MAX = 600;

type FormState = {
  businessName: string;
  institution: string;
  businessDescription: string;
  shopDescription: string;
  location: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  shopSlug: string;
  socialLinks: ShopSocialLinks;
};

const EMPTY_SOCIAL: ShopSocialLinks = {
  instagram: "",
  facebook: "",
  tiktok: "",
  whatsapp: "",
  website: "",
};

type PremiumShopEditorProps = {
  /** Título de la sección (Ajustes vs Premium). */
  heading?: string;
  id?: string;
};

export function PremiumShopEditor({
  heading = "Editar mi tienda",
  id = "premium-shop-editor",
}: PremiumShopEditorProps) {
  const [authLoading, setAuthLoading] = useState(true);
  const [sessionMissing, setSessionMissing] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [savedShopPath, setSavedShopPath] = useState<string | null>(null);
  const [saveBusy, setSaveBusy] = useState(false);
  const [logoBusy, setLogoBusy] = useState(false);
  const [bannerBusy, setBannerBusy] = useState(false);
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "ok" | "taken">("idle");
  const [saveFeedback, setSaveFeedback] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [form, setForm] = useState<FormState>({
    businessName: "",
    institution: "",
    businessDescription: "",
    shopDescription: "",
    location: "",
    avatarUrl: null,
    bannerUrl: null,
    shopSlug: "",
    socialLinks: { ...EMPTY_SOCIAL },
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { getCurrentUser } = await import("@/src/services/auth");
      const { ensureProfileForUser, fetchProfileByUserId } = await import("@/src/services/profiles");
      const user = await getCurrentUser();
      if (cancelled) return;
      if (!user) {
        setSessionMissing(true);
        setAuthLoading(false);
        return;
      }
      await ensureProfileForUser(user);
      const { profile, error: profileErr } = await fetchProfileByUserId(user.id);
      if (cancelled) return;
      if (profileErr && !profile) {
        setSaveFeedback({ type: "err", text: profileErr });
      }
      setUserId(user.id);
      setIsPremium(profile?.is_premium === true);
      if (profile) {
        const social = parseShopSocialLinks(profile.shop_social_links);
        const slug = profile.shop_slug?.trim() ?? "";
        setForm({
          businessName: profile.business_name?.trim() ?? "",
          institution: profile.institution?.trim() ?? "",
          businessDescription: profile.business_description?.trim() ?? "",
          shopDescription: profile.shop_description?.trim() ?? "",
          location: profile.location?.trim() ?? "",
          avatarUrl: profile.avatar_url?.trim() || null,
          bannerUrl: profile.shop_banner_url?.trim() || null,
          shopSlug: slug,
          socialLinks: {
            instagram: social.instagram ?? "",
            facebook: social.facebook ?? "",
            tiktok: social.tiktok ?? "",
            whatsapp: social.whatsapp ?? "",
            website: social.website ?? "",
          },
        });
        if (slug) setSavedShopPath(premiumShopPath(slug));
      }
      setAuthLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const displayLabel = form.businessName.trim() || "Tu negocio";
  const initials = initialsFromName(displayLabel);
  const slugPreview = normalizeShopSlug(form.shopSlug);

  const previewDraft = useMemo(
    () => ({
      businessName: form.businessName,
      shopDescription: form.shopDescription,
      shortDescription: form.businessDescription,
      location: form.location,
      institution: form.institution,
      avatarUrl: form.avatarUrl,
      bannerUrl: form.bannerUrl,
      shopSlug: form.shopSlug,
      socialLinks: form.socialLinks,
      isVerified: isPremium,
    }),
    [form, isPremium],
  );

  useEffect(() => {
    if (!userId || !slugPreview || !isPremium) {
      setSlugStatus("idle");
      return;
    }
    let cancelled = false;
    setSlugStatus("checking");
    const t = window.setTimeout(() => {
      void isShopSlugTaken(slugPreview, userId).then((taken) => {
        if (!cancelled) setSlugStatus(taken ? "taken" : "ok");
      });
    }, 400);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [form.shopSlug, userId, isPremium, slugPreview]);

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !userId || !isPremium) return;
    if (!file.type.startsWith("image/")) {
      setSaveFeedback({ type: "err", text: "Elegí una imagen (JPG, PNG o WebP)." });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSaveFeedback({ type: "err", text: "La imagen no puede superar 5 MB." });
      return;
    }
    setLogoBusy(true);
    setSaveFeedback(null);
    const { url, error } = await uploadBusinessLogo(userId, file);
    setLogoBusy(false);
    if (error || !url) {
      setSaveFeedback({ type: "err", text: error ?? "No se pudo subir el logo." });
      return;
    }
    setForm((prev) => ({ ...prev, avatarUrl: url }));
  }

  async function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !userId || !isPremium) return;
    if (!file.type.startsWith("image/")) {
      setSaveFeedback({ type: "err", text: "Elegí una imagen para el banner." });
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      setSaveFeedback({ type: "err", text: "El banner no puede superar 6 MB." });
      return;
    }
    setBannerBusy(true);
    setSaveFeedback(null);
    const { url, error } = await uploadShopBanner(userId, file);
    setBannerBusy(false);
    if (error || !url) {
      setSaveFeedback({ type: "err", text: error ?? "No se pudo subir el banner." });
      return;
    }
    setForm((prev) => ({ ...prev, bannerUrl: url }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !isPremium) return;
    if (slugStatus === "taken") {
      setSaveFeedback({ type: "err", text: "Ese slug ya está en uso." });
      return;
    }
    setSaveBusy(true);
    setSaveFeedback(null);
    const { error, shopPath } = await savePremiumShopSettings({
      businessName: form.businessName,
      institution: form.institution,
      businessDescription: form.businessDescription,
      shopDescription: form.shopDescription,
      location: form.location,
      avatarUrl: form.avatarUrl,
      bannerUrl: form.bannerUrl,
      shopSlug: form.shopSlug,
      socialLinks: form.socialLinks,
    });
    setSaveBusy(false);
    if (error) {
      setSaveFeedback({ type: "err", text: error });
      return;
    }
    if (shopPath) {
      setSavedShopPath(shopPath);
      const normalized = normalizeShopSlug(form.shopSlug);
      if (normalized) setForm((prev) => ({ ...prev, shopSlug: normalized }));
    }
    setSaveFeedback({
      type: "ok",
      text: "Cambios guardados. Tu tienda y el carrusel de Negocios destacados ya muestran la información actualizada.",
    });
  }

  if (authLoading) {
    return (
      <div id={id} className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-6 text-sm text-zinc-500">
        Cargando editor de tienda…
      </div>
    );
  }

  if (sessionMissing) {
    return (
      <div id={id} className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-6">
        <p className="text-sm text-zinc-600">Iniciá sesión para editar tu tienda.</p>
        <Link href="/login" className={`mt-4 inline-flex ${btnPrimaryClass}`}>
          Iniciar sesión
        </Link>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div id={id} className="space-y-4">
        <header>
          <h2 className="text-xl font-semibold text-zinc-900 sm:text-2xl">{heading}</h2>
          <p className="mt-2 text-sm text-zinc-600 sm:text-base">
            La tienda premium y la edición completa están disponibles solo con plan Premium activo.
          </p>
        </header>
        <div className="rounded-2xl border border-[#822020]/15 bg-[#822020]/[0.06] p-5 sm:p-6">
          <p className="font-medium text-[#822020]">Requiere Colex Premium</p>
          <p className="mt-2 text-sm text-zinc-600">
            Activá Premium para publicar en <span className="font-medium">/tienda/tu-slug</span> y aparecer en
            Negocios destacados.
          </p>
          <Link href="/premium#premium-shop-editor" className={`mt-4 inline-flex ${btnPrimaryClass}`}>
            Conocer Premium
          </Link>
        </div>
      </div>
    );
  }

  const liveShopHref = slugPreview ? premiumShopPath(slugPreview) : savedShopPath;

  return (
    <div id={id} className="space-y-6 scroll-mt-24">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 sm:text-2xl">{heading}</h2>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600 sm:text-base">
            Editá cómo se ve tu negocio en la tienda pública y en el carrusel de la home. Los cambios se guardan en
            tu perfil de Colex.
          </p>
        </div>
        {liveShopHref ? (
          <Link
            href={liveShopHref}
            target="_blank"
            rel="noopener noreferrer"
            className={`${btnSecondaryClass} shrink-0`}
          >
            Ver tienda publicada
          </Link>
        ) : null}
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:items-start lg:gap-8">
        <form onSubmit={handleSubmit} className="min-w-0 space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-5 sm:p-6">
            <p className={labelClass}>Banner / portada</p>
            <div className="mt-3 overflow-hidden rounded-xl border border-zinc-200/90 bg-zinc-100">
              {form.bannerUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.bannerUrl} alt="" className="h-28 w-full object-cover sm:h-36" />
              ) : (
                <div className="flex h-28 items-center justify-center bg-gradient-to-br from-[#822020]/15 to-zinc-100 text-sm text-zinc-500 sm:h-36">
                  Fondo por defecto
                </div>
              )}
            </div>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handleBannerChange}
              disabled={bannerBusy}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={bannerBusy}
                onClick={() => bannerInputRef.current?.click()}
                className="rounded-full border border-zinc-300 bg-white px-5 py-2 text-sm font-medium text-zinc-800 transition hover:border-[#822020]/30 disabled:opacity-60"
              >
                {bannerBusy ? "Subiendo…" : form.bannerUrl ? "Cambiar banner" : "Subir banner"}
              </button>
              {form.bannerUrl ? (
                <button
                  type="button"
                  className="text-sm text-zinc-500 underline-offset-2 hover:text-[#822020] hover:underline"
                  onClick={() => setForm((prev) => ({ ...prev, bannerUrl: null }))}
                >
                  Quitar
                </button>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-5 sm:p-6">
            <p className={labelClass}>Logo del negocio</p>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
              {form.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.avatarUrl}
                  alt=""
                  className="h-20 w-20 shrink-0 rounded-2xl border border-zinc-200/90 bg-white object-cover"
                />
              ) : (
                <div
                  className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-[#822020]/15 bg-[#822020]/10 text-xl font-semibold text-[#822020]"
                  aria-hidden
                >
                  {initials}
                </div>
              )}
              <div className="min-w-0 flex-1 space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  onChange={handleLogoChange}
                  disabled={logoBusy}
                />
                <button
                  type="button"
                  disabled={logoBusy}
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full border border-zinc-300 bg-white px-5 py-2 text-sm font-medium text-zinc-800 transition hover:border-[#822020]/30 disabled:opacity-60"
                >
                  {logoBusy ? "Subiendo…" : form.avatarUrl ? "Cambiar logo" : "Subir logo"}
                </button>
                <p className="text-xs text-zinc-500">Se usa en tu tienda y en Negocios destacados.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-5 sm:p-6">
            <div>
              <label htmlFor={`${id}-shop-slug`} className={labelClass}>
                Slug de tienda <span className="text-[#822020]">*</span>
              </label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                <span className="shrink-0 text-sm text-zinc-500">/tienda/</span>
                <input
                  id={`${id}-shop-slug`}
                  type="text"
                  required
                  maxLength={48}
                  className={inputClass}
                  placeholder="libreria-san-martin"
                  value={form.shopSlug}
                  onChange={(e) => setForm((prev) => ({ ...prev, shopSlug: e.target.value }))}
                />
              </div>
              {slugPreview ? (
                <p className="mt-1.5 text-xs text-zinc-500">
                  {slugStatus === "checking" && "Verificando disponibilidad…"}
                  {slugStatus === "ok" && <span className="text-emerald-700">Slug disponible</span>}
                  {slugStatus === "taken" && (
                    <span className="text-[#822020]">Ese slug ya está en uso</span>
                  )}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor={`${id}-business-name`} className={labelClass}>
                Nombre del negocio <span className="text-[#822020]">*</span>
              </label>
              <input
                id={`${id}-business-name`}
                type="text"
                required
                maxLength={80}
                className={`${inputClass} mt-2`}
                value={form.businessName}
                onChange={(e) => setForm((prev) => ({ ...prev, businessName: e.target.value }))}
              />
            </div>

            <div>
              <label htmlFor={`${id}-location`} className={labelClass}>
                Ubicación
              </label>
              <input
                id={`${id}-location`}
                type="text"
                maxLength={120}
                className={`${inputClass} mt-2`}
                placeholder="Ej. Córdoba Capital"
                value={form.location}
                onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
              />
            </div>

            <div>
              <label htmlFor={`${id}-shop-description`} className={labelClass}>
                Descripción de la tienda
              </label>
              <textarea
                id={`${id}-shop-description`}
                rows={4}
                maxLength={SHOP_DESC_MAX}
                className={`${inputClass} mt-2 resize-y`}
                placeholder="Contá qué ofrecés, horarios, envíos…"
                value={form.shopDescription}
                onChange={(e) => setForm((prev) => ({ ...prev, shopDescription: e.target.value }))}
              />
              <p className="mt-1 text-right text-xs text-zinc-500">
                {form.shopDescription.length}/{SHOP_DESC_MAX}
              </p>
            </div>

            <div>
              <label htmlFor={`${id}-business-description`} className={labelClass}>
                Descripción corta (carrusel home)
              </label>
              <textarea
                id={`${id}-business-description`}
                rows={2}
                maxLength={SHORT_DESC_MAX}
                className={`${inputClass} mt-2 resize-y`}
                value={form.businessDescription}
                onChange={(e) => setForm((prev) => ({ ...prev, businessDescription: e.target.value }))}
              />
              <p className="mt-1 text-right text-xs text-zinc-500">
                {form.businessDescription.length}/{SHORT_DESC_MAX}
              </p>
            </div>

            <div>
              <label htmlFor={`${id}-institution`} className={labelClass}>
                Institución o rubro <span className="font-normal text-zinc-500">(opcional)</span>
              </label>
              <input
                id={`${id}-institution`}
                type="text"
                maxLength={80}
                className={`${inputClass} mt-2`}
                value={form.institution}
                onChange={(e) => setForm((prev) => ({ ...prev, institution: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-5 sm:p-6">
            <p className={labelClass}>Redes y enlaces externos</p>
            {(
              [
                ["website", "Sitio web"],
                ["instagram", "Instagram"],
                ["facebook", "Facebook"],
                ["tiktok", "TikTok"],
                ["whatsapp", "WhatsApp (número)"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <label htmlFor={`${id}-social-${key}`} className="text-xs font-medium text-zinc-600">
                  {label}
                </label>
                <input
                  id={`${id}-social-${key}`}
                  type="text"
                  className={`${inputClass} mt-1`}
                  value={form.socialLinks[key] ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, [key]: e.target.value },
                    }))
                  }
                />
              </div>
            ))}
          </div>

          {saveFeedback ? (
            <div
              role="status"
              className={`rounded-xl px-4 py-3 text-sm ${
                saveFeedback.type === "ok"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border border-red-200 bg-red-50 text-red-800"
              }`}
            >
              <p>{saveFeedback.text}</p>
              {saveFeedback.type === "ok" && liveShopHref ? (
                <Link
                  href={liveShopHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex font-semibold text-[#822020] underline-offset-2 hover:underline"
                >
                  Abrir mi tienda →
                </Link>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="submit"
              disabled={saveBusy || logoBusy || bannerBusy || slugStatus === "taken"}
              className={btnPrimaryClass}
            >
              {saveBusy ? "Guardando…" : "Guardar cambios"}
            </button>
            {liveShopHref ? (
              <Link href={liveShopHref} target="_blank" rel="noopener noreferrer" className={btnSecondaryClass}>
                Vista previa en vivo
              </Link>
            ) : null}
          </div>
        </form>

        <div className="lg:sticky lg:top-24">
          <PremiumShopPreview draft={previewDraft} openInNewTab={Boolean(liveShopHref)} />
          <p className="mt-3 text-center text-xs text-zinc-500 lg:text-left">
            La vista previa se actualiza al editar. Guardá para publicar en la web.
          </p>
        </div>
      </div>
    </div>
  );
}
