"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { SectionDirecciones } from "@/app/ajustes/_components/addresses-section";
import { AddressMissingAlertSlot } from "@/app/components/addresses/address-missing-alert-slot";
import { PremiumBusinessSettings } from "@/app/ajustes/_components/premium-business-settings";
import { SectionTiendasSeguidas } from "@/app/ajustes/_components/section-tiendas-seguidas";
import { SignOutButton } from "@/app/components/auth/sign-out-button";
import { initialsFromName } from "@/src/data/mockProfiles";
import { displayNameFromEmail } from "@/src/lib/auth-profile";

/** Acento UI Ajustes (paleta Colex) — usar #822020 literal en clases Tailwind */

export type AjustesSection =
  | "perfil"
  | "cuenta"
  | "negocio"
  | "tiendas-seguidas"
  | "direcciones"
  | "ayuda"
  | "soporte";

const AJUSTES_SECTIONS: AjustesSection[] = [
  "perfil",
  "cuenta",
  "negocio",
  "tiendas-seguidas",
  "direcciones",
  "ayuda",
  "soporte",
];

/** Sección activa desde `?tab=` (p. ej. footer → Centro de ayuda). */
export function parseAjustesSection(tab: string | null | undefined): AjustesSection {
  const value = tab?.trim().toLowerCase();
  if (value && (AJUSTES_SECTIONS as string[]).includes(value)) {
    return value as AjustesSection;
  }
  return "perfil";
}

function buildNavGroups(showNegocio: boolean): {
  title: string;
  items: { id: AjustesSection; label: string }[];
}[] {
  const cuentaItems: { id: AjustesSection; label: string }[] = [
    { id: "perfil", label: "Editar perfil" },
    { id: "cuenta", label: "Ajustes de cuenta" },
  ];
  if (showNegocio) {
    cuentaItems.push({ id: "negocio", label: "Editar mi tienda" });
  }
  cuentaItems.push({ id: "tiendas-seguidas", label: "Tiendas que seguís" });
  cuentaItems.push({ id: "direcciones", label: "Direcciones" });
  return [
    { title: "Tu cuenta", items: cuentaItems },
    {
      title: "Ayuda y asistencia",
      items: [
        { id: "ayuda", label: "Centro de ayuda" },
        { id: "soporte", label: "Contactar soporte" },
      ],
    },
  ];
}

const FAQ_ITEMS = [
  {
    q: "¿Cómo publico un producto?",
    a: "Ingresá a Vender, completá título, fotos, precio y publicá. Revisá que el artículo sea apto para el marketplace escolar.",
  },
  {
    q: "¿Cómo compro en Colex?",
    a: "Buscá por institución o categoría, abrí la publicación y acordá la compra con el vendedor con los medios de pago que Colex te muestra en la ficha.",
  },
  {
    q: "¿Cómo funcionan los productos usados?",
    a: "Los vendedores indican el estado. Podés pedir más fotos o detalles por chat y coordinar entrega o retiro seguro.",
  },
  {
    q: "¿Cómo contacto a un vendedor?",
    a: "Desde la publicación usá el contacto o mensajería de Colex para acordar precio, pago y entrega sin compartir datos personales al inicio.",
  },
] as const;

const inputClass =
  "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#822020] focus:ring-2 focus:ring-[#822020]/20 sm:text-base";
const labelClass = "text-sm font-medium text-zinc-800";

const btnPrimaryClass =
  "rounded-full bg-[#822020] px-8 py-2.5 text-sm font-medium text-white transition hover:bg-[#6d1b1b] active:bg-[#5a1616] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#822020] sm:py-3 sm:text-base";

function PanelCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-zinc-200 bg-zinc-50/80 p-5 sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

type PerfilFormState = {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  institution: string;
  bio: string;
  location: string;
};

function SectionPerfil() {
  const [authLoading, setAuthLoading] = useState(true);
  const [sessionMissing, setSessionMissing] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [form, setForm] = useState<PerfilFormState>({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    institution: "",
    bio: "",
    location: "",
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { getCurrentUser } = await import("@/src/services/auth");
      const { ensureProfileForUser } = await import("@/src/services/profiles");
      const user = await getCurrentUser();
      if (cancelled) return;
      if (!user) {
        setSessionMissing(true);
        setAuthLoading(false);
        return;
      }
      const email = user.email?.trim() ?? "";
      const { profile } = await ensureProfileForUser(user);
      if (cancelled) return;
      const metaName =
        user.user_metadata && typeof user.user_metadata.full_name === "string"
          ? user.user_metadata.full_name.trim()
          : "";
      const local = email ? displayNameFromEmail(email) : "";
      const uname = profile?.username?.trim() || local;
      setForm({
        fullName: (profile?.full_name ?? metaName).trim() || uname,
        username: uname,
        email,
        phone: profile?.phone?.trim() ?? "",
        institution: profile?.institution?.trim() ?? "",
        bio: profile?.bio?.trim() ?? "",
        location: profile?.location?.trim() ?? "",
      });
      setSessionMissing(false);
      setAuthLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const previewTitle =
    form.fullName.trim() || form.username.trim() || (form.email ? displayNameFromEmail(form.email) : "—");
  const previewInitials = initialsFromName(previewTitle);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">Editar perfil</h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 sm:text-base">
          Actualizá tus datos de contacto e institución. Así otras familias y compradores en Colex reconocen
          tu perfil.
        </p>
      </div>

      <AddressMissingAlertSlot variant="informacion" />

      {sessionMissing ? (
        <PanelCard>
          <p className="text-sm text-zinc-700">
            No hay sesión iniciada.{" "}
            <Link href="/login" className="font-semibold text-[#822020] underline-offset-2 hover:underline">
              Iniciá sesión
            </Link>{" "}
            para ver y editar los datos vinculados a tu cuenta.
          </p>
        </PanelCard>
      ) : null}

      <PanelCard>
        <p className="mb-4 text-sm font-medium text-zinc-500">Vista previa</p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex shrink-0 sm:items-start">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#822020] to-[#4a1212] text-2xl font-semibold text-white"
              aria-hidden
            >
              {authLoading ? "…" : previewInitials}
            </div>
          </div>
          <dl className="min-w-0 flex-1 space-y-1 text-sm sm:text-base">
            <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
              <dt className="shrink-0 text-zinc-500">Nombre</dt>
              <dd className="font-medium text-zinc-900">{authLoading ? "…" : previewTitle}</dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
              <dt className="shrink-0 text-zinc-500">Usuario</dt>
              <dd className="font-medium text-zinc-900">
                {authLoading ? "…" : form.username ? `@${form.username}` : "—"}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
              <dt className="shrink-0 text-zinc-500">Email</dt>
              <dd className="break-all font-medium text-zinc-900">{authLoading ? "…" : form.email || "—"}</dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
              <dt className="shrink-0 text-zinc-500">Ubicación</dt>
              <dd className="font-medium text-zinc-900">{form.location || "—"}</dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
              <dt className="shrink-0 text-zinc-500">Teléfono</dt>
              <dd className="font-medium text-zinc-900">{form.phone || "—"}</dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
              <dt className="shrink-0 text-zinc-500">Institución</dt>
              <dd className="text-zinc-800">{form.institution || "—"}</dd>
            </div>
          </dl>
        </div>
      </PanelCard>

      <form
        className="space-y-5"
        onSubmit={async (e) => {
          e.preventDefault();
          setSaveFeedback(null);
          const { getCurrentUser } = await import("@/src/services/auth");
          const { saveOwnProfile } = await import("@/src/services/profiles");
          const user = await getCurrentUser();
          if (!user?.id || !user.email) {
            setSaveFeedback({ type: "err", text: "No hay sesión. Iniciá sesión de nuevo." });
            return;
          }
          setSaveBusy(true);
          try {
            const { error } = await saveOwnProfile(user.id, user.email, {
              fullName: form.fullName,
              username: form.username,
              phone: form.phone,
              institution: form.institution,
              bio: form.bio,
              location: form.location,
            });
            if (error) {
              setSaveFeedback({ type: "err", text: error });
            } else {
              setSaveFeedback({ type: "ok", text: "Cambios guardados correctamente." });
            }
          } catch (err) {
            console.error("[Colex ajustes] guardar perfil", err);
            setSaveFeedback({ type: "err", text: "No pudimos guardar. Intentá de nuevo." });
          } finally {
            setSaveBusy(false);
          }
        }}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="aj-fullname" className={labelClass}>
              Nombre completo
            </label>
            <input
              id="aj-fullname"
              className={inputClass}
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              autoComplete="name"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="aj-username" className={labelClass}>
              Nombre de usuario (sin @)
            </label>
            <input
              id="aj-username"
              className={inputClass}
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value.replace(/^@+/, "") }))}
              autoComplete="username"
              placeholder="ej.: maria_colex"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="aj-email" className={labelClass}>
              Email
            </label>
            <input
              id="aj-email"
              type="email"
              readOnly={!sessionMissing && Boolean(form.email)}
              className={`${inputClass} ${!sessionMissing && form.email ? "cursor-not-allowed bg-zinc-50 text-zinc-600" : ""}`}
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              autoComplete="email"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="aj-bio" className={labelClass}>
              Biografía
            </label>
            <textarea
              id="aj-bio"
              rows={4}
              className={`${inputClass} min-h-[100px] resize-y`}
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              placeholder="Contá un poco sobre vos…"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="aj-location" className={labelClass}>
              Ubicación
            </label>
            <input
              id="aj-location"
              className={inputClass}
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              placeholder="Ciudad o barrio"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="aj-phone" className={labelClass}>
              Teléfono
            </label>
            <input
              id="aj-phone"
              type="tel"
              className={inputClass}
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              autoComplete="tel"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="aj-instit" className={labelClass}>
              Institución (opcional)
            </label>
            <input
              id="aj-instit"
              className={inputClass}
              value={form.institution}
              onChange={(e) => setForm((f) => ({ ...f, institution: e.target.value }))}
              placeholder="Colegio o escuela a la que pertenecés"
            />
          </div>
        </div>
        <div className="pt-1">
          <button type="submit" disabled={saveBusy || sessionMissing} className={btnPrimaryClass}>
            {saveBusy ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
        {saveFeedback ? (
          <p
            role={saveFeedback.type === "err" ? "alert" : "status"}
            className={`rounded-xl border px-3 py-2 text-sm ${
              saveFeedback.type === "ok"
                ? "border-green-700/25 bg-green-700/10 text-green-900"
                : "border-[#822020]/25 bg-[#822020]/10 text-[#6d1b1b]"
            }`}
          >
            {saveFeedback.text}
          </p>
        ) : null}
      </form>
    </div>
  );
}

function SectionAjustesCuenta() {
  const [notifEmail, setNotifEmail] = useState(true);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          Ajustes de cuenta
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 sm:text-base">
          Preferencias de la cuenta, privacidad y opciones generales. No afectan los datos de tu perfil
          público.
        </p>
      </div>

      <div className="space-y-3">
        <PanelCard>
          <p className="mb-4 text-sm font-medium text-zinc-800">Privacidad y apariencia</p>
          <ul className="divide-y divide-zinc-200/80">
            <li className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-900">Notificaciones por email</p>
                <p className="text-sm text-zinc-500">Avisos de ventas, mensajes y novedades de Colex.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notifEmail}
                onClick={() => setNotifEmail((v) => !v)}
                className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border transition ${
                  notifEmail
                    ? "border-[#822020]/30 bg-[#822020]"
                    : "border-zinc-200 bg-zinc-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-7 w-7 translate-y-0.5 rounded-full bg-white transition ${
                    notifEmail ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </li>
          </ul>
        </PanelCard>

        <PanelCard>
          <p className="mb-3 text-sm font-medium text-zinc-800">Idioma y datos</p>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <span className={labelClass}>Idioma de la interfaz</span>
              <select
                className={inputClass}
                defaultValue="es-AR"
                aria-label="Idioma de la interfaz"
              >
                <option value="es-AR">Español (Argentina)</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>
        </PanelCard>

        <PanelCard>
          <p className="mb-3 text-sm font-medium text-zinc-800">Sesión</p>
          <p className="mb-4 text-sm text-zinc-500">
            Si cerrás sesión en este dispositivo, tendrás que volver a ingresar con email y contraseña.
          </p>
          <SignOutButton />
        </PanelCard>
      </div>

      <div>
        <button type="button" className={btnPrimaryClass}>
          Guardar preferencias
        </button>
      </div>
    </div>
  );
}

function SectionAyuda() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          Centro de ayuda
        </h2>
        <p className="mt-2 text-sm text-zinc-600 sm:text-base">
          Respuestas rápidas sobre cómo usar Colex. Para más detalle, visitá la ayuda en cada paso
          del flujo de compra o venta.
        </p>
      </div>
      <div className="divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        {FAQ_ITEMS.map((item) => (
          <details key={item.q} className="group border-zinc-200 p-0 open:bg-[#822020]/[0.03]">
            <summary className="cursor-pointer list-none px-4 py-4 text-left text-sm font-medium text-zinc-900 transition marker:content-[''] hover:bg-[#822020]/[0.05] sm:px-5 sm:text-base [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-2">
                {item.q}
                <span className="shrink-0 text-[#822020]/50 transition group-open:rotate-180 group-open:text-[#822020]">
                  ▾
                </span>
              </span>
            </summary>
            <p className="border-t border-zinc-100 px-4 pb-4 pl-4 text-sm leading-relaxed text-zinc-600 sm:px-5 sm:pb-5">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}

function SectionSoporte() {
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          Contactar soporte
        </h2>
        <p className="mt-2 text-sm text-zinc-600 sm:text-base">
          Contanos qué sucede y te respondemos por email. Incluí el número de pedido o publicación si
          aplica.
        </p>
      </div>
      <form
        className="max-w-2xl space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <div className="space-y-1.5">
          <label htmlFor="aj-sop-asunto" className={labelClass}>
            Asunto
          </label>
          <input
            id="aj-sop-asunto"
            className={inputClass}
            value={asunto}
            onChange={(e) => setAsunto(e.target.value)}
            placeholder="Ej.: No puedo publicar / problema con un pago"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="aj-sop-msg" className={labelClass}>
            Mensaje
          </label>
          <textarea
            id="aj-sop-msg"
            rows={6}
            className={`${inputClass} min-h-[140px] resize-y`}
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Escribí tu consulta con el mayor detalle posible…"
          />
        </div>
        <button type="submit" className={btnPrimaryClass}>
          Enviar mensaje
        </button>
      </form>
    </div>
  );
}

function NavButton({
  label,
  selected,
  onSelect,
  narrow,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
  narrow?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={
        narrow
          ? `shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition sm:text-base ${
              selected
                ? "border-[#822020]/35 bg-[#822020]/[0.11] text-[#822020]"
                : "border-zinc-200/90 bg-white text-zinc-800 hover:border-[#822020]/20 hover:bg-[#822020]/[0.04]"
            }`
          : `w-full rounded-lg border border-transparent px-3 py-2.5 text-left text-base transition sm:text-lg ${
              selected
                ? "border-[#822020]/20 bg-[#822020]/[0.1] font-semibold text-[#822020]"
                : "text-zinc-800 hover:border-[#822020]/10 hover:bg-[#822020]/[0.04]"
            }`
      }
    >
      {label}
    </button>
  );
}

export function AjustesScreen() {
  const searchParams = useSearchParams();
  const [section, setSection] = useState<AjustesSection>(() =>
    parseAjustesSection(searchParams.get("tab")),
  );
  const [showNegocioNav, setShowNegocioNav] = useState(false);

  useEffect(() => {
    setSection(parseAjustesSection(searchParams.get("tab")));
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { getCurrentUser } = await import("@/src/services/auth");
      const { fetchProfileByUserId } = await import("@/src/services/profiles");
      const user = await getCurrentUser();
      if (cancelled || !user) return;
      const { profile } = await fetchProfileByUserId(user.id);
      const { isPremiumEntitled } = await import("@/src/lib/premium-access");
      if (!cancelled) setShowNegocioNav(isPremiumEntitled(profile));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const navGroups = buildNavGroups(showNegocioNav);
  const flatNav = navGroups.flatMap((g) => g.items);

  let body: ReactNode;
  switch (section) {
    case "perfil":
      body = <SectionPerfil />;
      break;
    case "cuenta":
      body = <SectionAjustesCuenta />;
      break;
    case "negocio":
      body = <PremiumBusinessSettings heading="Editar mi tienda" id="ajustes-shop-editor" />;
      break;
    case "tiendas-seguidas":
      body = <SectionTiendasSeguidas />;
      break;
    case "direcciones":
      body = <SectionDirecciones />;
      break;
    case "ayuda":
      body = <SectionAyuda />;
      break;
    case "soporte":
      body = <SectionSoporte />;
      break;
  }

  return (
    <div className="flex min-h-[min(60vh,720px)] flex-col gap-6 lg:grid lg:min-h-0 lg:grid-cols-[minmax(0,240px)_1fr] lg:items-start lg:gap-8">
      {/* Mobile: horizontal nav */}
      <div className="lg:hidden">
        <h1 className="mb-3 text-2xl font-semibold text-[#822020]">Ajustes</h1>
        <div className="colex-hscroll gap-2 pb-1" role="tablist" aria-label="Secciones de ajustes">
          {flatNav.map((item) => (
            <NavButton
              key={item.id}
              label={item.label}
              selected={section === item.id}
              onSelect={() => setSection(item.id)}
              narrow
            />
          ))}
          <Link
            href="/conocenos"
            className="shrink-0 rounded-full border border-zinc-200/90 bg-white px-4 py-2 text-sm font-medium text-zinc-800 transition hover:border-[#822020]/20 hover:bg-[#822020]/[0.04] sm:text-base"
          >
            Conocenos
          </Link>
          <Link
            href="/aurenza"
            className="shrink-0 rounded-full border border-zinc-200/90 bg-white px-4 py-2 text-sm font-medium text-zinc-800 transition hover:border-[#822020]/20 hover:bg-[#822020]/[0.04] sm:text-base"
          >
            Aurenza
          </Link>
        </div>
      </div>

      {/* Desktop: sidebar grouped */}
      <aside className="hidden lg:block lg:border-r lg:border-zinc-200/90 lg:pr-6">
        <h1 className="mb-4 text-[28px] font-semibold leading-tight tracking-tight text-[#822020] lg:text-[32px]">
          Ajustes
        </h1>
        <nav className="space-y-4" aria-label="Secciones de ajustes">
          {navGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-1.5 text-sm text-zinc-500">{group.title}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavButton
                    key={item.id}
                    label={item.label}
                    selected={section === item.id}
                    onSelect={() => setSection(item.id)}
                  />
                ))}
              </div>
            </div>
          ))}
          <div className="mt-4 space-y-0.5 border-t border-zinc-200 pt-4">
            <Link
              href="/conocenos"
              className="block w-full rounded-lg border border-transparent px-3 py-2.5 text-left text-base text-zinc-800 transition hover:border-[#822020]/10 hover:bg-[#822020]/[0.04] sm:text-lg"
            >
              Conocenos
            </Link>
            <Link
              href="/aurenza"
              className="block w-full rounded-lg border border-transparent px-3 py-2.5 text-left text-base text-zinc-800 transition hover:border-[#822020]/10 hover:bg-[#822020]/[0.04] sm:text-lg"
            >
              Aurenza
            </Link>
          </div>
        </nav>
      </aside>

      <div className="min-w-0 flex-1 border-t border-zinc-100 pt-6 lg:border-0 lg:pt-0">
        {body}
      </div>
    </div>
  );
}
