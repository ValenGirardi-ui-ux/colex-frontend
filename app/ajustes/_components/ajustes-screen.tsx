"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { SignOutButton } from "@/app/components/auth/sign-out-button";

/** Acento UI Ajustes (paleta Colex) — usar #822020 literal en clases Tailwind */

export type AjustesSection = "perfil" | "cuenta" | "direcciones" | "ayuda" | "soporte";

const NAV_GROUPS: {
  title: string;
  items: { id: AjustesSection; label: string }[];
}[] = [
  {
    title: "Tu cuenta",
    items: [
      { id: "perfil", label: "Editar perfil" },
      { id: "cuenta", label: "Ajustes de cuenta" },
      { id: "direcciones", label: "Direcciones" },
    ],
  },
  {
    title: "Ayuda y asistencia",
    items: [
      { id: "ayuda", label: "Centro de ayuda" },
      { id: "soporte", label: "Contactar soporte" },
    ],
  },
];

const FLAT_NAV = NAV_GROUPS.flatMap((g) => g.items);

const MOCK_PROFILE = {
  name: "María González",
  email: "maria.gonzalez@email.com",
  phone: "+54 9 11 2345-6789",
  institution: "Colegio San Martín",
} as const;

const MOCK_ADDRESS = {
  id: "1",
  name: "Casa",
  line: "Av. Corrientes 1234, Piso 3 Depto A",
  city: "CABA",
  region: "Buenos Aires",
  postal: "C1043",
  country: "Argentina",
};

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
  "rounded-full bg-[#822020] px-8 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#6d1b1b] active:bg-[#5a1616] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#822020] sm:py-3 sm:text-base";

function PanelCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-zinc-200 bg-zinc-50/80 p-5 shadow-sm sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

type PerfilFormState = {
  fullName: string;
  email: string;
  phone: string;
  institution: string;
};

function SectionPerfil() {
  const [form, setForm] = useState<PerfilFormState>({
    fullName: MOCK_PROFILE.name,
    email: MOCK_PROFILE.email,
    phone: MOCK_PROFILE.phone,
    institution: MOCK_PROFILE.institution,
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">Editar perfil</h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 sm:text-base">
          Actualizá tu foto, datos de contacto e institución. Así otras familias y compradores en Colex
          reconocen tu perfil.
        </p>
      </div>

      <PanelCard>
        <p className="mb-4 text-sm font-medium text-zinc-500">Vista previa</p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex shrink-0 flex-col items-center gap-2 sm:items-start">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#822020] to-[#4a1212] text-2xl font-semibold text-white shadow-inner"
              aria-hidden
            >
              {MOCK_PROFILE.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <button
              type="button"
              className="text-sm font-medium text-[#822020] underline decoration-[#822020]/30 decoration-1 underline-offset-2 transition hover:decoration-[#822020]"
            >
              Cambiar foto
            </button>
          </div>
          <dl className="min-w-0 flex-1 space-y-1 text-sm sm:text-base">
            <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
              <dt className="shrink-0 text-zinc-500">Nombre</dt>
              <dd className="font-medium text-zinc-900">{MOCK_PROFILE.name}</dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
              <dt className="shrink-0 text-zinc-500">Email</dt>
              <dd className="break-all font-medium text-zinc-900">{MOCK_PROFILE.email}</dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
              <dt className="shrink-0 text-zinc-500">Teléfono</dt>
              <dd className="font-medium text-zinc-900">{MOCK_PROFILE.phone}</dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
              <dt className="shrink-0 text-zinc-500">Institución</dt>
              <dd className="text-zinc-800">{MOCK_PROFILE.institution}</dd>
            </div>
          </dl>
        </div>
      </PanelCard>

      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
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
          <div className="space-y-1.5">
            <label htmlFor="aj-email" className={labelClass}>
              Email
            </label>
            <input
              id="aj-email"
              type="email"
              className={inputClass}
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              autoComplete="email"
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
          <button type="submit" className={btnPrimaryClass}>
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
}

function SectionAjustesCuenta() {
  const [notifEmail, setNotifEmail] = useState(true);
  const [mostrarInstitucion, setMostrarInstitucion] = useState(true);

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
                    ? "border-[#822020]/30 bg-[#822020] shadow-sm"
                    : "border-zinc-200 bg-zinc-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-7 w-7 translate-y-0.5 rounded-full bg-white shadow transition ${
                    notifEmail ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </li>
            <li className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-900">Mostrar mi institución en el perfil</p>
                <p className="text-sm text-zinc-500">Visible en publicaciones y en tu ficha pública.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={mostrarInstitucion}
                onClick={() => setMostrarInstitucion((v) => !v)}
                className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border transition ${
                  mostrarInstitucion
                    ? "border-[#822020]/30 bg-[#822020] shadow-sm"
                    : "border-zinc-200 bg-zinc-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-7 w-7 translate-y-0.5 rounded-full bg-white shadow transition ${
                    mostrarInstitucion ? "translate-x-6" : "translate-x-0.5"
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
            <p className="pt-1 text-sm text-zinc-500">
              Podés solicitar una copia de los datos vinculados a tu cuenta (respuesta en hasta 15 días
              hábiles, sin costo en esta versión).
            </p>
            <button
              type="button"
              className="text-left text-sm font-medium text-[#822020] underline decoration-[#822020]/30 decoration-2 underline-offset-4 transition hover:decoration-[#822020]"
            >
              Solicitar descarga de mis datos
            </button>
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

function SectionDirecciones() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          Direcciones
        </h2>
        <p className="mt-2 text-sm text-zinc-600 sm:text-base">
          Guardá direcciones para entregas o retiros. Podés agregar varias y elegir una por compra o
          venta.
        </p>
      </div>

      <PanelCard>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-base font-semibold text-zinc-900">{MOCK_ADDRESS.name}</p>
            <p className="mt-1 text-sm text-zinc-700 sm:text-base">{MOCK_ADDRESS.line}</p>
            <p className="text-sm text-zinc-600">
              {MOCK_ADDRESS.city}, {MOCK_ADDRESS.region} · CP {MOCK_ADDRESS.postal} ·{" "}
              {MOCK_ADDRESS.country}
            </p>
          </div>
          <span className="w-fit rounded-full bg-[#822020]/10 px-3 py-1 text-xs font-medium text-[#822020] sm:shrink-0">
            Predeterminada
          </span>
        </div>
      </PanelCard>

      <button
        type="button"
        className="w-full rounded-2xl border-2 border-dashed border-zinc-300 py-4 text-sm font-medium text-zinc-700 transition hover:border-[#822020]/35 hover:bg-[#822020]/[0.04] hover:text-[#822020] sm:w-auto sm:px-8 sm:py-3"
      >
        Agregar dirección
      </button>
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
                ? "border-[#822020]/35 bg-[#822020]/[0.11] text-[#822020] shadow-sm"
                : "border-zinc-200/90 bg-white text-zinc-800 hover:border-[#822020]/20 hover:bg-[#822020]/[0.04]"
            }`
          : `w-full rounded-lg border border-transparent px-3 py-2.5 text-left text-base transition sm:text-lg ${
              selected
                ? "border-[#822020]/20 bg-[#822020]/[0.1] font-semibold text-[#822020] shadow-sm"
                : "text-zinc-800 hover:border-[#822020]/10 hover:bg-[#822020]/[0.04]"
            }`
      }
    >
      {label}
    </button>
  );
}

export function AjustesScreen() {
  const [section, setSection] = useState<AjustesSection>("perfil");

  let body: ReactNode;
  switch (section) {
    case "perfil":
      body = <SectionPerfil />;
      break;
    case "cuenta":
      body = <SectionAjustesCuenta />;
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
        <div
          className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Secciones de ajustes"
        >
          {FLAT_NAV.map((item) => (
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
          {NAV_GROUPS.map((group) => (
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
