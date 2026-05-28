"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isProfileVerified } from "@/src/lib/profile-verified";

export function PremiumBusinessLink() {
  const [canEdit, setCanEdit] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { getCurrentUser } = await import("@/src/services/auth");
      const { fetchProfileByUserId } = await import("@/src/services/profiles");
      const user = await getCurrentUser();
      if (cancelled) return;
      if (!user) {
        setChecked(true);
        return;
      }
      const { profile } = await fetchProfileByUserId(user.id);
      if (!cancelled) {
        setCanEdit(isProfileVerified(profile));
        setChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!checked) return null;

  if (!canEdit) {
    return (
      <section className="mt-8 rounded-2xl border border-zinc-200/90 bg-white p-5 sm:mt-10 sm:p-6">
        <h2 className="text-lg font-bold text-zinc-900 sm:text-xl">Configurar mi negocio</h2>
        <p className="mt-2 text-sm text-zinc-600 sm:text-base">
          Activá Premium para personalizar tu presencia en Negocios destacados.
        </p>
        <Link
          href="/ajustes?tab=negocio"
          className="mt-4 inline-flex text-sm font-medium text-[#822020] underline-offset-2 hover:underline sm:text-base"
        >
          Más información en Ajustes
        </Link>
      </section>
    );
  }

  return (
    <section
      className="mt-8 rounded-2xl border border-[#822020]/15 bg-white p-5 sm:mt-10 sm:p-6"
      aria-labelledby="premium-business-config-heading"
    >
      <h2 id="premium-business-config-heading" className="text-lg font-bold text-zinc-900 sm:text-xl">
        Configurar mi negocio
      </h2>
      <p className="mt-2 text-sm text-zinc-600 sm:text-base">
        Personalizá nombre, logo y descripción para el carrusel de Negocios destacados en la home.
      </p>
      <Link
        href="/ajustes?tab=negocio"
        className="mt-4 inline-flex rounded-full bg-[#822020] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6d1b1b] sm:text-base"
      >
        Ir a configuración
      </Link>
    </section>
  );
}
