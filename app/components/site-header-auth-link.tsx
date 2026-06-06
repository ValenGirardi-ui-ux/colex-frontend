"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/src/lib/supabase/client";

function sessionHasUser(session: Session | null): boolean {
  return Boolean(session?.user);
}

/** Icono de perfil: anillo fino + cabeza y hombros solo contorno, fondo blanco. */
function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10.25" className="fill-white" />
      <circle cx="12" cy="12" r="9.15" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="8.85" r="3.45" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        d="M6.55 19.4c.95-2.85 2.95-4.25 5.45-4.25s4.5 1.4 5.45 4.25"
      />
    </svg>
  );
}

/**
 * Enlace de auth en el header: “Iniciar sesión” → /login o icono de perfil → /perfil.
 * Hidrata con getSession() y se mantiene al día con onAuthStateChange (p. ej. tras login/registro).
 */
export function SiteHeaderAuthLink() {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;

    function apply(session: Session | null) {
      if (cancelled) return;
      setSignedIn(sessionHasUser(session));
      setReady(true);
    }

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      apply(session);
    });

    void supabase.auth.getSession().then(({ data: { session } }) => {
      apply(session);
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);

  const signedInLabel = "Tu perfil";
  const signedOutLabel = "Iniciar sesión";

  const profileButtonClass =
    "inline-flex shrink-0 text-[#3f3f46] transition-colors hover:text-[#822020] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#822020]";

  if (!ready) {
    return (
      <span className={profileButtonClass} aria-busy="true" aria-label="Comprobando sesión">
        <ProfileIcon className="h-8 w-8 rounded-full bg-white animate-pulse opacity-40 lg:h-9 lg:w-9" />
      </span>
    );
  }

  if (signedIn) {
    return (
      <Link href="/perfil" aria-label={signedInLabel} className={profileButtonClass}>
        <ProfileIcon className="h-8 w-8 rounded-full bg-white lg:h-9 lg:w-9" />
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      aria-label={signedOutLabel}
      className="inline-flex items-center justify-center rounded-lg p-1.5 text-zinc-700 hover:bg-zinc-100 lg:px-2 lg:py-1 lg:text-sm"
    >
      <span className="hidden lg:inline">{signedOutLabel}</span>
      <span className="text-xs font-semibold text-[#822020] lg:hidden">Entrar</span>
    </Link>
  );
}
